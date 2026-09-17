"use client";

import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { NotificationMediaUpload } from "@/types/notifications";

const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

interface NotificationImageUploadProps {
  media: NotificationMediaUpload | null;
  onChange: (media: NotificationMediaUpload | null) => void;
}

interface CloudinaryImageUploadResponse {
  secure_url?: string;
  width?: number;
  height?: number;
  error?: { message?: string };
}

const uploadImage = (
  file: File,
  onProgress: (progress: number) => void,
) =>
  new Promise<{ url: string; width?: number; height?: number }>((resolve, reject) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      reject(new Error("Image upload is not configured"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const request = new XMLHttpRequest();
    request.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onerror = () => reject(new Error("Network error while uploading image"));
    request.onload = () => {
      try {
        const response = JSON.parse(
          request.responseText,
        ) as CloudinaryImageUploadResponse;

        if (request.status >= 200 && request.status < 300 && response.secure_url) {
          resolve({
            url: response.secure_url,
            width: response.width,
            height: response.height,
          });
          return;
        }

        reject(new Error(response.error?.message || "Image upload failed"));
      } catch {
        reject(new Error("The upload service returned an invalid response"));
      }
    };
    request.send(formData);
  });

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const NotificationImageUpload = ({
  media,
  onChange,
}: NotificationImageUploadProps) => {
  const onDrop = useCallback(
    async ([file]: File[]) => {
      if (!file) return;

      const localPreview = URL.createObjectURL(file);
      onChange({
        mimeType: file.type,
        name: file.name,
        preview: localPreview,
        progress: 0,
        size: file.size,
        status: "uploading",
      });

      try {
        const uploadedImage = await uploadImage(file, (progress) => {
          onChange({
            mimeType: file.type,
            name: file.name,
            preview: localPreview,
            progress,
            size: file.size,
            status: "uploading",
          });
        });

        URL.revokeObjectURL(localPreview);
        onChange({
          height: uploadedImage.height,
          mimeType: file.type,
          name: file.name,
          preview: uploadedImage.url,
          progress: 100,
          size: file.size,
          status: "complete",
          url: uploadedImage.url,
          width: uploadedImage.width,
        });
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        onChange({
          mimeType: file.type,
          name: file.name,
          preview: localPreview,
          progress: 100,
          size: file.size,
          status: "error",
        });
        toast.error(error instanceof Error ? error.message : "Image upload failed");
      }
    },
    [onChange],
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDrop,
    onDropRejected: (rejections) => {
      const tooLarge = rejections.some((rejection) =>
        rejection.errors.some((error) => error.code === "file-too-large"),
      );
      toast.error(
        tooLarge
          ? `Image is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`
          : "Please upload a JPG, PNG, or WebP image.",
      );
    },
  });

  const removeMedia = () => {
    if (media?.preview.startsWith("blob:")) URL.revokeObjectURL(media.preview);
    onChange(null);
  };

  return (
    <div>
      <div
        {...getRootProps({
          className: `flex h-[112px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#C8C8C8] bg-white transition hover:border-[#F75803] ${
            media?.status === "uploading" ? "pointer-events-none opacity-70" : ""
          }`,
        })}
      >
        <input {...getInputProps()} aria-label="Upload notification image" />
        <Image
          src="/icons/fileImage.svg"
          height={34}
          width={34}
          alt="Upload image"
        />
        <p className="mt-1 text-xs text-[#808080]">
          <span className="underline underline-offset-2">Click to upload</span>{" "}
          {isDragActive ? "or drop it here" : "or drag and drop"}
        </p>
        <p className="mt-1 text-[10px] text-[#A8A8A8]">
          Maximum file size {MAX_FILE_SIZE_MB} MB.
        </p>
      </div>

      {media && (
        <div className="mt-3 rounded-lg border border-[#E4E4E4] px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#E4E4E4]">
                <Image
                  src="/icons/picturefileImage.svg"
                  height={14}
                  width={18}
                  alt="Image file"
                />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#111810]">{media.name}</p>
                <p className="mt-0.5 text-[10px] text-[#808080]">
                  {formatFileSize(media.size)}
                  {media.status === "uploading" ? ` · ${media.progress}%` : ""}
                  {media.status === "error" ? " · Upload failed" : ""}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => window.open(media.preview, "_blank", "noopener,noreferrer")}
                className="text-[#111810]"
              >
                Preview
              </button>
              <span className="h-1 w-1 rounded-full bg-[#C8C8C8]" />
              <button type="button" onClick={removeMedia} className="text-[#BF3100]">
                Delete
              </button>
            </div>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#E4E4E4]">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${
                media.status === "error" ? "bg-[#BF3100]" : "bg-[#111810]"
              }`}
              style={{ width: `${media.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationImageUpload;
