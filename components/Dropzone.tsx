"use client";
import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import LoadingState from "@/components/LoadingState";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = Number(
  process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB || "500"
);

interface FileWithPreview {
  preview: string;
  name: string;
  size: number;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: {
    message?: string;
  };
}

const uploadToCloudinary = (
  file: File,
  onProgress: (loadedBytes: number) => void
) =>
  new Promise<CloudinaryUploadResponse>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );

    const request = new XMLHttpRequest();
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`
    );

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded);
      }
    };

    request.onload = () => {
      let response: CloudinaryUploadResponse = {};

      try {
        response = JSON.parse(request.responseText);
      } catch {
        reject(new Error("Cloudinary returned an invalid response"));
        return;
      }

      if (
        request.status >= 200 &&
        request.status < 300 &&
        response.secure_url
      ) {
        resolve(response);
        return;
      }

      reject(new Error(response.error?.message || "Upload failed"));
    };

    request.onerror = () => {
      reject(new Error("Network error while uploading to Cloudinary"));
    };

    request.send(formData);
  });

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
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setLoading(true);
    setUploadProgress(0);

    const totalBytes = acceptedFiles.reduce(
      (total, file) => total + file.size,
      0
    );
    const loadedBytesByFile = new Map<File, number>();

    const updateProgress = (file: File, loadedBytes: number) => {
      loadedBytesByFile.set(file, Math.min(loadedBytes, file.size));
      const loadedBytesTotal = Array.from(loadedBytesByFile.values()).reduce(
        (total, loaded) => total + loaded,
        0
      );

      setUploadProgress(
        Math.min(100, Math.round((loadedBytesTotal / totalBytes) * 100))
      );
    };

    try {
      await Promise.all(
        acceptedFiles.map(async (file) => {
          try {
            const data = await uploadToCloudinary(file, (loadedBytes) => {
              updateProgress(file, loadedBytes);
            });

            updateProgress(file, file.size);

            if (!data.secure_url) {
              return;
            }

            const preview = data.secure_url;

            setFiles((prevFiles) => [
              ...prevFiles,
              {
                preview,
                name: file.name,
                size: file.size,
              },
            ]);
          } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
          }
        })
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "video/mp4": [],
      "video/mov": [],
    },
    maxSize: 1024 * 1024 * MAX_FILE_SIZE_MB,
    onDrop,
    onDropRejected: (fileRejections) => {
      setLoading(false);
      fileRejections.forEach((file) => {
        if (file.errors.some((err) => err.code === "file-too-large")) {
          alert(
            `File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`
          );
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
          <LoadingState message={`Loading... ${uploadProgress}%`} />
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
          <p className="text-[#808080] text-[12px]">
            Maximum file size {MAX_FILE_SIZE_MB} MB.
          </p>
        </div>
      )}
    </div>
  );
}
