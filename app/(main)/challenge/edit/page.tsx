"use client";

import Dropzone from "@/components/Dropzone";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import useChallenge from "@/hooks/useChallenge";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import GeneralDropzone from "@/components/GeneralDropzone";   // ← Import this
import { Input } from "@/components/ui/input";

interface FileWithPreview {
  preview: string; // Cloudinary URL with fl_attachment
  name: string;
  size: number;
}

const UpdateChallenge = () => {
  const { updateChallenge, challengeLoading } = useChallenge();
  const challengeEdit = useSelector(
    (state: RootState) => state.challenge.challengeEdit
  );

  const router = useRouter();

  // States
  const [files, setFiles] = useState<FileWithPreview[]>(
    challengeEdit?.media_url 
      ? challengeEdit.media_url.map((url, index) => ({
          preview: url,
          name: `File-${index + 1}`,
          size: 0,
        }))
      : []
  );

  const [postMediaFiles, setPostMediaFiles] = useState<FileWithPreview[]>(
    challengeEdit?.download_link 
      ? [{
          preview: challengeEdit.download_link,   // Use download_link as fallback for existing records
          name: "Current Post Media",
          size: 0,
        }]
      : []
  );

  const [name, setName] = useState<string>(challengeEdit?.name || "");
  const [instructions, setInstructions] = useState<string>(
    challengeEdit?.instructions || ""
  );
  const [price, setPrice] = useState<string>(challengeEdit?.price || "");
  const [link, setLink] = useState<string>(challengeEdit?.link || "");
  const [status, setStatus] = useState<string>("active");
  const [hashtag, setHashtag] = useState<string>(challengeEdit?.hashtag || "");

  // Duration handling
  const durationParts = challengeEdit?.duration?.split(" ") || [];
  const [durationValue, setDurationValue] = useState<string>(
    durationParts[0] || ""
  );
  const [durationUnit, setDurationUnit] = useState<string>(
    durationParts[1] || "days"
  );

  const [deleteafter, setDeleteAfter] = useState<boolean>(
    challengeEdit?.delete_after_duration === true
  );

  // Auto-set link from Post Media (same logic as CreateChallenge)
  useEffect(() => {
    if (postMediaFiles.length > 0) {
      setLink(postMediaFiles[0].preview);
      console.log("✅ Update - Link set from Post Media:", postMediaFiles[0].preview);
    } else {
      setLink(challengeEdit?.link || "");   // Fallback to existing link
    }
  }, [postMediaFiles, challengeEdit?.link]);

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const removePostMediaFile = (fileName: string) => {
    setPostMediaFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const isFormValid =
    name.trim() &&
    instructions.trim() &&
    price.trim() &&
    durationValue.trim() &&
    hashtag.trim() &&
    files.length > 0 &&
    link.length > 0;

  const handleUpdate = async () => {
    const formattedDuration = `${durationValue} ${durationUnit}`;
    const mediaUrls = files.map((file) => file.preview);

    await updateChallenge(
      challengeEdit.id,
      name,
      instructions,
      price,
      link,                   
      mediaUrls,
      status,
      formattedDuration,
      deleteafter,
      hashtag
    );

    router.push("/challenge");
  };

  return (
    <div className="flex justify-between items-start">
      <div className="flex w-3/6 flex-col space-y-[24px]">
        <div>
          <p
            onClick={() => router.push("/challenge")}
            className="text-[#F75803] cursor-pointer flex items-center transition-all active:scale-95"
          >
            <Image
              src={"/icons/arrowleftChallenge.svg"}
              alt="arrowleft"
              width={15}
              height={12.5}
            />
            <span className="ml-[8px]">Go back to overview</span>
          </p>
          <div className="mt-[13.5px]">
            <h2 className="text-2xl">Update Challenge</h2>
          </div>
        </div>

        <form className="space-y-[24px]">
          {/* Title + Hashtag */}
          <div className="flex items-center space-x-4 w-full">
            <div className="w-full">
              <Label className="text-[#10002E] text-[14px] font-medium mb-1">Title</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Title"
              />
            </div>
            <div className="w-full">
              <Label className="text-[#10002E] text-[14px] font-medium mb-1">Hashtag</Label>
              <Input
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                placeholder="Enter Hashtag"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="w-full">
            <Label className="text-[#10002E] text-[14px] font-medium mb-1">Duration</Label>
            <div className="flex items-center space-x-4">
              <Select value={durationUnit} onValueChange={setDurationUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                placeholder="Enter duration value"
              />
            </div>
          </div>

          {/* Price */}
          <div className="w-full">
            <Label className="text-[#10002E] text-[14px] font-medium mb-1">Price</Label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter Price"
            />
          </div>

          {/* Post Media - File Upload */}
          <div>
            <p className="text-[#10002E] text-[14px] font-medium mb-1">Challenge Material</p>
            <GeneralDropzone
              postMediaFiles={postMediaFiles}
              setPostMediaFiles={setPostMediaFiles}
              className="w-full border border-dashed cursor-pointer h-32 rounded-md flex justify-center items-center"
            />
            {postMediaFiles.length > 0 && (
              <div className="mt-4">
                <ul className="space-y-2">
                  {postMediaFiles.map((file, index) => (
                    <div key={index} className="border flex items-center p-4 justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="border p-2 rounded-md">
                          <Image src={"/icons/picturefileImage.svg"} height={13} width={17} alt="file" />
                        </div>
                        <div>
                          <p className="text-[#111810] font-bold">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                     <div className="space-x-2">
                      <Link href={file.preview} download target="_blank" className="text-sm font-medium">
                        Preview
                      </Link>
                      <button
                        onClick={() => removeFile(file.name)}
                        className="text-sm text-[#BF3100]"
                      >
                        Delete
                      </button>
                    </div>
                    </div>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <p className="text-[#10002E] text-[14px] font-medium mb-1">Instruction</p>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full h-[168px]"
              placeholder="Enter Instruction"
            />
          </div>

          {/* Media (Images) */}
          <div>
            <p className="text-[#10002E] text-[14px] font-medium mb-1">Media</p>
            <Dropzone files={files} setFiles={setFiles} className="w-full border border-dashed cursor-pointer h-32 rounded-md flex justify-center items-center" />
         
            <div className="mt-4">
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="border flex items-center p-4 justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="border p-2 rounded-md">
                        <Image src={"/icons/picturefileImage.svg"} height={13} width={17} alt="fileImage" />
                      </div>
                      <div>
                        <p className="text-[#111810] font-bold">{file.name}</p>
                        <p>{file.size}</p>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Link href={file.preview} download target="_blank" className="text-sm font-medium">
                        Preview
                      </Link>
                      <button
                        onClick={() => removeFile(file.name)}
                        className="text-sm text-[#BF3100]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          </div>

          {/* Delete after duration */}
          <div className="flex items-center justify-between">
            <Label className="text-[#10002E]">Delete challenges after duration</Label>
            <Switch
              checked={deleteafter}
              onCheckedChange={setDeleteAfter}
              className="[&[data-state='checked']]:bg-[#F75803]"
            />
          </div>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        <Button onClick={() => router.push("/challenge")} className="btnPlain">
          Cancel
        </Button>

        <Button
          onClick={handleUpdate}
          disabled={!isFormValid || challengeLoading}
          loading={challengeLoading}
          className="btnColored"
        >
          Update Challenge
        </Button>
      </div>
    </div>
  );
};

export default UpdateChallenge;