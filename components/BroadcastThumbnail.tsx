"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CLOUDINARY_HOST = "res.cloudinary.com";
const IMAGE_TRANSFORMATION = "w_104,h_104,c_fill,q_auto,f_auto";
const VIDEO_TRANSFORMATION = "so_0,w_104,h_104,c_fill,q_auto,f_jpg";
const VIDEO_EXTENSIONS = /\.(mp4|mov|m4v|webm)$/i;

const getCloudinaryThumbnail = (mediaUrl?: string) => {
  if (!mediaUrl) return null;

  try {
    const url = new URL(mediaUrl);
    const isCloudinary = url.hostname === CLOUDINARY_HOST;
    const isVideo =
      url.pathname.includes("/video/upload/") ||
      VIDEO_EXTENSIONS.test(url.pathname);

    if (!isCloudinary) {
      return isVideo ? null : mediaUrl;
    }

    const transformation = isVideo
      ? VIDEO_TRANSFORMATION
      : IMAGE_TRANSFORMATION;

    url.pathname = url.pathname.replace(
      "/upload/",
      `/upload/${transformation}/`
    );

    if (isVideo) {
      url.pathname = url.pathname.replace(/\.[^/.]+$/, ".jpg");
    }

    return url.toString();
  } catch {
    return null;
  }
};

const BroadcastThumbnail = ({
  mediaUrl,
  title,
}: {
  mediaUrl?: string;
  title: string;
}) => {
  const [hasError, setHasError] = useState(false);
  const thumbnailUrl = useMemo(
    () => getCloudinaryThumbnail(mediaUrl),
    [mediaUrl]
  );

  useEffect(() => {
    setHasError(false);
  }, [thumbnailUrl]);

  if (!thumbnailUrl || hasError) {
    return (
      <div
        aria-label="No broadcast thumbnail"
        className="flex h-[52px] w-[52px] items-center justify-center rounded-md bg-[#E4E4E4] text-[#A8A8A8]"
      >
        <ImageIcon aria-hidden="true" className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="relative h-[52px] w-[52px] overflow-hidden rounded-md bg-[#E4E4E4]">
      <Image
        src={thumbnailUrl}
        alt={`${title} thumbnail`}
        fill
        sizes="52px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default BroadcastThumbnail;
