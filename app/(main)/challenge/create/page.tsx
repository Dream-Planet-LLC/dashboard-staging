"use client";

import Dropzone from "@/components/Dropzone";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import useChallenge from "@/hooks/useChallenge";
import GeneralDropzone from "@/components/GeneralDropzone";

interface FileWithPreview {
  preview: string;
  name: string;
  size: number;
}

const CreateChallenge = () => {
  const { createChallenge, challengeLoading } = useChallenge();
  
  const [files, setFiles] = useState<FileWithPreview[]>([]);           // Main Media (images)
  const [postMediaFiles, setPostMediaFiles] = useState<FileWithPreview[]>([]); // Post Media

  const [name, setName] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [link, setLink] = useState<string>("");           // ← This will be set from Post Media
  const [status, setStatus] = useState<string>("active");
  const [durationValue, setDurationValue] = useState<string>("");
  const [durationUnit, setDurationUnit] = useState<string>("days");
  const [deleteAfter, setDeleteAfter] = useState<boolean>(false);
  const [hashtag, setHashtag] = useState<string>("");

const router = useRouter();

  // Auto set link ONLY from Post Media
  useEffect(() => {
    if (postMediaFiles.length > 0) {
      setLink(postMediaFiles[0].preview);
      console.log("✅ Link set from Post Media:", postMediaFiles[0].preview); // ← Debug
    } else {
      setLink("");
      console.log("❌ Post Media cleared, link reset");
    }
  }, [postMediaFiles]);

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

  const handleUpload = async () => {
    const mediaUrls = files.map((file) => file.preview);
    const formattedDuration = `${durationValue} ${durationUnit}`;

    console.log("Sending to backend - Link:", link); // ← Check what is being sent

    await createChallenge(
      name,
      instructions,
      price,
      link,                    // ← This should be Post Media URL
      mediaUrls,
      status,
      formattedDuration,
      deleteAfter,
      hashtag
    );

    router.push("/challenge");
  };


  return (
    <div className="flex justify-between items-start">
      <div className="flex w-3/6 flex-col space-y-[24px]">
        <div>
          <p
            onClick={() => {
              router.push("/challenge");
            }}
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
            <h2 className="text-2xl">Create Challenges</h2>
          </div>
        </div>

        <form className="space-y-[24px]">
          <div className="flex items-center space-x-4 w-full">
            <div className="w-full">
              <Label
                className="text-[#10002E] text-[14px] font-medium mb-1"
                htmlFor="title"
              >
                Title
              </Label>
              <Input
                className="focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#C8C8C8] mt-1 placeholder:text-[14px] "
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                type="title"
                placeholder="Enter Title"
              />
            </div>
            <div className="w-full">
              <Label
                className="text-[#10002E] text-[14px] font-medium mb-1"
                htmlFor="hashtag"
              >
                Hashtag
              </Label>
              <Input
                className="focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#C8C8C8] mt-1 placeholder:text-[14px]"
                type="hashtag"
                value={hashtag}
                onChange={(e) => {
                  setHashtag(e.target.value);
                }}
                placeholder="Enter Hashtag"
              />
            </div>
          </div>

          <div className="w-full">
            <Label
              className="text-[#10002E] text-[14px] font-medium mb-1"
              htmlFor=""
            >
              Duration
            </Label>
            <div className="flex items-center space-x-4">
              <Select
                onValueChange={(value) => setDurationUnit(value)}
                value={durationUnit}
              >
                <SelectTrigger className="w-full mt-1 focus:ring-0 focus:ring-offset-0 focus:outline-none text-[#373737] text-[14px]">
                  <SelectValue placeholder="Select unit" />
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
                className="w-full focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#C8C8C8] mt-1 placeholder:text-[14px]"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                placeholder="Enter duration"
              />
            </div>
          </div>
          <div className="w-full">
            <Label
              className="text-[#10002E] text-[14px] font-medium mb-1"
              htmlFor="price"
            >
              Price
            </Label>
            <Input
              className="focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#C8C8C8] mt-1 placeholder:text-[14px]"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
              }}
              type="price"
              placeholder="Enter Price"
            />
          </div>

          {/* <div className="w-full">
            <Label htmlFor="link">Link URL(Optional)</Label>
            <Input
              className="focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#C8C8C8] mt-1 placeholder:text-[14px]"
              type="link"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
              }}
              placeholder="Enter Link"
            />
          </div> */}

          <div>
            <p className="text-[#10002E] text-[14px] font-medium mb-1">Post Media (Any File)</p>
            
         <GeneralDropzone
              postMediaFiles={postMediaFiles}
            setPostMediaFiles={setPostMediaFiles}
              className="w-full border border-dashed cursor-pointer h-32 rounded-md flex justify-center items-center"
            />
            {postMediaFiles.length > 0 && (
              <div className="mt-4">
                <ul className="space-y-2">
                  {postMediaFiles.map((file, index) => (
                    <div
                      key={index}
                      className="border flex items-center p-4 justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="border p-2 rounded-md">
                          <Image
                            src={"/icons/picturefileImage.svg"}
                            height={13}
                            width={17}
                            alt="file"
                          />
                        </div>
                        <div>
                          <p className="text-[#111810] font-bold">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="space-x-3">
                        <Link
                          href={file.preview}
                          target="_blank"
                          download
                          className="text-sm hover:underline"
                        >
                          Preview / Download
                        </Link>
                        <button
                          onClick={() => removePostMediaFile(file.name)}
                          className="text-sm text-[#BF3100] hover:underline"
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

          <div>
            <p className="text-[#10002E] text-[14px] font-medium mb-1">
              Instruction
            </p>
            <Textarea
              value={instructions}
              onChange={(e) => {
                setInstructions(e.target.value);
              }}
              className="focus-visible:ring-transparent w-full h-[168px] placeholder:text-[#C8C8C8] mt-1 placeholder:text-[14px]"
              placeholder="Enter Instruction"
            />
          </div>
          <div>
            <p className="text-[#10002E] text-[14px] font-medium mb-1">Media</p>
            <Dropzone
              files={files}
              setFiles={setFiles}
              className="w-full border border-dashed cursor-pointer h-32 rounded-md flex justify-center items-center"
            />
            <div className="mt-4">
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="border flex items-center p-4  justify-between "
                  >
                    <div className="flex items-center space-x-2">
                      <div className="border p-2 rounded-md">
                        <Image
                          src={"/icons/picturefileImage.svg"}
                          height={13}
                          width={17}
                          alt="fileImage"
                        />
                      </div>

                      <div>
                        <p className="text-[#111810] font-bold">{file.name}</p>
                        <p className="">{file.size}</p>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <button className="hover:scale-105 transition-all text-sm font-medium cursor-pointer active:scale-95">
                        <Link
                          href={file.preview}
                          download={true}
                          target="_blank"
                        >
                          Preview
                        </Link>
                      </button>

                      <button
                        onClick={() => {
                          removeFile(file.name);
                        }}
                        className="text-sm text-[#BF3100] font-medium cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[#10002E]" htmlFor="switch">
              Delete challenges after duration
            </Label>

            <Switch
              id="switch"
              className="[&[data-state='checked']]:bg-[#F75803]"
              checked={deleteAfter}
              onCheckedChange={(checked) => setDeleteAfter(checked)}
            />
          </div>
        </form>
      </div>
     <div className="flex gap-4">
        <Button onClick={() => router.push("/challenge")} className="btnPlain">
          Cancel
        </Button>

        <Button
          onClick={handleUpload}
          disabled={!isFormValid || challengeLoading}
          loading={challengeLoading}
          className="btnColored"
        >
          Upload
        </Button>
      </div>
    </div>
  );
};

export default CreateChallenge;
