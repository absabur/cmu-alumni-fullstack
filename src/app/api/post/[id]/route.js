// app/api/posts/[id]/route.js
import connectDB from "@/config/db";
import { localTime } from "@/config/localTime";
import Post from "@/models/postModel";
import { NextResponse } from "next/server";
import cloudinary from "@/config/cloudinary";

export async function PUT(request, { params }) {
  await connectDB();

  try {
    const { id } = await params;
    const formData = await request.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const youtubeLink = formData.get("youtubeLink");
    const files = formData.getAll("images");

    const exists = await Post.findById(id);
    if (!exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 400 });
    }

    const images = [];
    for (const file of files) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "post" }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(Buffer.from(buffer));
        });
        images.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    }

    if (images.length > 0) {
      await Promise.all(
        exists.images.map(async (image) => {
          await cloudinary.uploader.destroy(image.public_id);
        })
      );
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title: title || exists.title,
        content: content || exists.content,
        youtubeLink: youtubeLink || exists.youtubeLink,
        images: images.length > 0 ? images : exists.images,
        updateDate: localTime(),
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "Post updated", post: updatedPost },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  await connectDB();

  try {
    const { id } = await params;
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectDB();

  try {
    const { id } = await params;
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete images from Cloudinary
    if (post.images && post.images.length > 0) {
      await Promise.all(
        post.images.map(async (image) => {
          await cloudinary.uploader.destroy(image.public_id);
        })
      );
    }

    // Delete the post document
    const deletedPost = await Post.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Post and all associated images deleted successfully",
      deletedPost,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
