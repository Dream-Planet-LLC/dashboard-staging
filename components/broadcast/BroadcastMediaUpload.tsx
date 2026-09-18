"use client";

import Image from "next/image";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = Number(
  process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB || "500",
);
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface BroadcastMediaFile {
  preview: string;
  name: string;
  size: number;
}

interface BroadcastMediaUploadProps {
  files: BroadcastMediaFile[];
  setFiles: Dispatch<SetStateAction<BroadcastMediaFile[]>>;
  onUploadStateChange?: (isUploading: boolean) => void;
}

interface ActiveUpload {
  id: string;
  name: string;
  progress: number;
  size: number;
  status: "uploading" | "error";
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: { message?: string };
}

const uploadToCloudinary = (
  file: File,
  onProgress: (progress: number) => void,
) =>
  new Promise<string>((resolve, reject) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      reject(new Error("Media upload is not configured"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const request = new XMLHttpRequest();
    request.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/upload`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onerror = () => reject(new Error("Network error while uploading media"));
    request.onload = () => {
      try {
        const response = JSON.parse(
          request.responseText,
        ) as CloudinaryUploadResponse;

        if (request.status >= 200 && request.status < 300 && response.secure_url) {
          resolve(response.secure_url);
          return;
        }

        reject(new Error(response.error?.message || "Media upload failed"));
      } catch {
        reject(new Error("The upload service returned an invalid response"));
      }
    };
    request.send(formData);
  });

const formatFileSize = (bytes: number) => {
  if (!bytes) return "Size unavailable";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const BroadcastMediaUpload = ({
  files,
  setFiles,
  onUploadStateChange,
}: BroadcastMediaUploadProps) => {
  const [activeUploads, setActiveUploads] = useState<ActiveUpload[]>([]);
  const isUploading = activeUploads.some((upload) => upload.status === "uploading");

  useEffect(() => {
    onUploadStateChange?.(isUploading);
  }, [isUploading, onUploadStateChange]);

  const updateUpload = (id: string, changes: Partial<ActiveUpload>) => {
    setActiveUploads((current) =>
      current.map((upload) =>
        upload.id === id ? { ...upload, ...changes } : upload,
      ),
    );
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploads = acceptedFiles.map((file, index) => ({
        file,
        id: `${file.name}-${file.lastModified}-${index}`,
      }));

      if (uploads.length === 0) return;

      setActiveUploads((current) => [
        ...current.filter((upload) => upload.status !== "error"),
        ...uploads.map(({ file, id }) => ({
          id,
          name: file.name,
          progress: 0,
          size: file.size,
          status: "uploading" as const,
        })),
      ]);

      await Promise.all(
        uploads.map(async ({ file, id }) => {
          try {
            const preview = await uploadToCloudinary(file, (progress) => {
              updateUpload(id, { progress });
            });

            setFiles((current) => [
              ...current,
              { name: file.name, preview, size: file.size },
            ]);
            setActiveUploads((current) =>
              current.filter((upload) => upload.id !== id),
            );
            toast.success(`${file.name} uploaded successfully`);
          } catch (error) {
            updateUpload(id, { progress: 100, status: "error" });
            toast.error(
              error instanceof Error ? error.message : "Media upload failed",
            );
          }
        }),
      );
    },
    [setFiles],
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
    },
    disabled: isUploading,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    onDrop,
    onDropRejected: (rejections) => {
      const tooLarge = rejections.some((rejection) =>
        rejection.errors.some((error) => error.code === "file-too-large"),
      );
      toast.error(
        tooLarge
          ? `Media is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB per file.`
          : "Please upload a JPG, PNG, WebP, MP4, or MOV file.",
      );
    },
  });

  const removeFile = (preview: string) => {
    setFiles((current) => current.filter((file) => file.preview !== preview));
  };

  return (
    <div>
      <div
        {...getRootProps({
          className: `flex h-[112px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#C8C8C8] bg-white transition hover:border-[#F75803] ${
            isUploading ? "pointer-events-none opacity-70" : ""
          }`,
        })}
      >
        <input {...getInputProps()} aria-label="Upload broadcast media" />
        <Image src="/icons/fileImage.svg" height={34} width={34} alt="Upload media" />
        <p className="mt-1 text-xs text-[#808080]">
          <span className="underline underline-offset-2">Click to upload</span>{" "}
          {isDragActive ? "or drop it here" : "or drag and drop"}
        </p>
        <p className="mt-1 text-[10px] text-[#A8A8A8]">
          Images or videos. Maximum file size {MAX_FILE_SIZE_MB} MB.
        </p>
      </div>

      {(activeUploads.length > 0 || files.length > 0) && (
        <div className="mt-3 space-y-2">
          {activeUploads.map((upload) => (
            <MediaRow
              key={upload.id}
              name={upload.name}
              size={upload.size}
              progress={upload.progress}
              status={upload.status}
              onDelete={() =>
                setActiveUploads((current) =>
                  current.filter((item) => item.id !== upload.id),
                )
              }
            />
          ))}
          {files.map((file) => (
            <MediaRow
              key={file.preview}
              name={file.name}
              size={file.size}
              progress={100}
              status="complete"
              onPreview={() =>
                window.open(file.preview, "_blank", "noopener,noreferrer")
              }
              onDelete={() => removeFile(file.preview)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface MediaRowProps {
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "complete" | "error";
  onPreview?: () => void;
  onDelete: () => void;
}

const MediaRow = ({
  name,
  size,
  progress,
  status,
  onPreview,
  onDelete,
}: MediaRowProps) => (
  <div className="rounded-lg border border-[#E4E4E4] px-3 py-3">
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#E4E4E4]">
          <Image
            src="/icons/picturefileImage.svg"
            height={14}
            width={18}
            alt="Media file"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[#111810]">{name}</p>
          <p className="mt-0.5 text-[10px] text-[#808080]">
            {formatFileSize(size)}
            {status === "uploading" ? ` · ${progress}%` : ""}
            {status === "error" ? " · Upload failed" : ""}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[11px] font-medium">
        {status === "complete" && onPreview && (
          <button type="button" onClick={onPreview} className="text-[#111810]">
            Preview
          </button>
        )}
        {status !== "uploading" && (
          <>
            {status === "complete" && (
              <span className="h-1 w-1 rounded-full bg-[#C8C8C8]" />
            )}
            <button type="button" onClick={onDelete} className="text-[#BF3100]">
              Delete
            </button>
          </>
        )}
      </div>
    </div>
    <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#E4E4E4]">
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${
          status === "error" ? "bg-[#BF3100]" : "bg-[#111810]"
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

export default BroadcastMediaUpload;
