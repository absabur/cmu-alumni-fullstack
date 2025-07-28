"use client";
import { LOADING_END, LOADING_START, MESSAGE } from "@/store/constant";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

export default function NoticeUpdate() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(
          `/api/notice/${id}`
        );
        const data = await res.json();
        if (data?.notice) {
          const fields = ["title", "description", "type", "dateTime"];
          fields.forEach((field) => setValue(field, data.notice[field]));
        }
      } catch (err) {
        console.error("Failed to fetch notice", err);
      }
    };

    if (id) fetchNotice();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    dispatch({ type: LOADING_START });

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("type", data.type);
    formData.append("dateTime", data.dateTime);

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append("images", data.images[i]);
      }
    }

    const response = await fetch(
      `/api/notice/${id}`,
      {
        method: "PUT",
        credentials: "include",
        body: formData,
      }
    );

    const result = await response.json();

    dispatch({
      type: MESSAGE,
      payload: {
        message: result.message || result.error || "Unknown error",
        status: result.message ? "success" : "error",
        path: result.message ? `/notice/${id}` : "",
      },
    });

    dispatch({ type: LOADING_END });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Update Notice</h2>

      <div>
        <label>Title:</label>
        <input type="text" {...register("title", { required: true })} />
      </div>

      <div>
        <label>Description:</label>
        <textarea {...register("description", { required: true })}></textarea>
      </div>

      <div>
        <label>Type:</label>
        <select {...register("type", { required: true })}>
          <option value="">Select Type</option>
          <option value="general">General</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label>Date & Time:</label>
        <input
          type="datetime-local"
          {...register("dateTime", { required: true })}
        />
      </div>

      <div>
        <label>Images (upload multiple):</label>
        <input type="file" {...register("images")} multiple />
      </div>

      <button type="submit">Update</button>
    </form>
  );
}
