"use client";

import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import LoadingState from "@/components/LoadingState";
import { toast } from "@/hooks/use-toast";

interface FileWithPreview {
  preview: string;   // Cloudinary secure_url
  name: string;
  size: number;
}

export default function GeneralDropzone({
  className,
  setPostMediaFiles,
 postMediaFiles,

}: {
  className?: string;
  setPostMediaFiles: Dispatch<SetStateAction<FileWithPreview[]>>;
  postMediaFiles: FileWithPreview[];
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
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, 
          // ← Important: /auto/upload instead of /upload
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
          setPostMediaFiles((prevFiles) => [
            ...prevFiles,
            {
              preview: data.secure_url,
              name: file.name,
              size: file.size,
            },
          ]);
        }
      } catch (error: any) {
        console.error(error);
        toast({
          variant: "destructive",
          description: error?.message || "Failed to upload file",
        });
      } finally {
        setLoading(false);
      }
    });
  }, [setPostMediaFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: undefined,                    // Accept ALL file types
    maxSize: 1024 * 1024 * 1024,         // 1GB limit
    onDrop,
    onDropRejected: (fileRejections) => {
      setLoading(false);
      fileRejections.forEach((file) => {
        if (file.errors.some((err) => err.code === "file-too-large")) {
          toast({
            variant: "destructive",
            description: `File "${file.file.name}" is too large. Maximum size is 1GB.`,
          });
        } else {
          toast({
            variant: "destructive",
            description: `File "${file.file.name}" was rejected.`,
          });
        }
      });
    },
  });

  return (
    <div
      {...getRootProps({
        className: `${className} ${loading ? "pointer-events-none opacity-70" : ""}`,
      })}
    >
      <input {...getInputProps()} />

      {loading ? (
        <div className="py-4">
          <LoadingState message="Uploading file..." />
        </div>
      ) : isDragActive ? (
        <p className="text-[#808080]">Drop the files here ...</p>
      ) : (
        <div className="flex items-center flex-col">
          <Image
            src={"/icons/fileImage.svg"}
            height={40}
            width={40}
            alt="upload icon"
          />
          <p className="text-[#808080] mt-2">
            <span className="underline underline-offset-4 text-[14px]">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-[#808080] text-[12px]">
            Any file type supported • Max 1GB
          </p>
        </div>
      )}
    </div>
  );
}