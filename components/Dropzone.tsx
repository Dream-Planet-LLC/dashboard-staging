"use client";
import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import LoadingState from "@/components/LoadingState";
import { toast } from "sonner";

interface FileWithPreview {
  preview: string;
  name: string;
  size: number;
}

export default function Dropzone({
  className,
  setFiles,
  files,
}: {
  className?: string;
  setFiles: Dispatch<SetStateAction<FileWithPreview[]>>;
  files: FileWithPreview[];
}) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setLoading(true);
    acceptedFiles.forEach(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      );

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
      
        if (!res.ok) {
          const errorData = await res.json(); 
          throw new Error(errorData?.error?.message || "Upload failed");
        }
      
        const data = await res.json();
      
        if (data.secure_url) {
          setFiles((prevFiles) => [
            ...prevFiles,
            {
              preview: data.secure_url,
              name: file.name,
              size: file.size,
            },
          ]);
        }
      } catch (error: any) {
        toast.error(error?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
      
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "video/mp4": [],
      "video/mov": [],
    },
    maxSize: 1024 * 1024 * 50, // 50 MB limit
    onDrop,
    onDropRejected: (fileRejections) => {
      setLoading(false);
      fileRejections.forEach((file) => {
        if (file.errors.some((err) => err.code === "file-too-large")) {
          alert("File is too large. Maximum size is 50 MB.");
        }
      });
    },
  });

  return (
    <div
      {...getRootProps({
        className: `${className} ${loading ? "pointer-events-none" : ""}`,
      })}
    >
      {!loading && <input {...getInputProps()} />}
      {loading ? (
        <div className="py-4">
          <LoadingState message="Loading..." />
        </div>
      ) : isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <div className="flex items-center flex-col">
          <Image
            src={"/icons/fileImage.svg"}
            height={40}
            width={40}
            alt="fileImage"
          />
          <p className="text-[#808080]">
            <span className="underline underline-offset-4 text-[14px]">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-[#808080] text-[12px]">Maximum file size 50 MB.</p>
        </div>
      )}
    </div>
  );
}
