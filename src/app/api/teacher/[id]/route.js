// app/api/teachers/[id]/route.js
import cloudinary from "@/config/cloudinary";
import connectDB from "@/config/db";
import { localTime } from "@/config/localTime";

import Teacher from "@/models/teacherModel";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  await connectDB();
  

  try {
    const { id } = await params;
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const title = formData.get("title");
    const about = formData.get("about");
    const address = formData.get("address");
    const avatarFile = formData.get("image");

    const exists = await Teacher.findById(id);
    if (!exists) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 400 });
    }

    if (!avatarFile) {
      NextResponse.json({ error: "Image is required" }, { status: 500 });
    }

    let avatar = {};
    if (avatarFile && avatarFile.size > 0) {
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "student" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(Buffer.from(buffer));
      });
      avatar = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    if (avatar.public_id) {
      await cloudinary.uploader.destroy(exists.avatar.public_id);
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      {
        name: name || exists.name,
        email: email || exists.email,
        phone: phone || exists.phone,
        title: title || exists.title,
        about: about || exists.about,
        address: address || exists.address,
        avatar: Object.keys(avatar).length ? avatar : exists.avatar,
        updateDate: localTime(),
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "Teacher updated", teacher: updatedTeacher },
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
    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await connectDB();

  try {
    const { id } = await params;
    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Delete avatar from Cloudinary if exists
    if (teacher.avatar?.public_id) {
      await cloudinary.uploader.destroy(teacher.avatar.public_id);
    }

    // Delete the teacher document
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Teacher and avatar deleted successfully",
      deletedTeacher,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
