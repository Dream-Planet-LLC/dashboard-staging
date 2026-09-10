"use client";

import Dropzone from "@/components/Dropzone";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useBroadcast from "@/hooks/useBroadcast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface FileWithPreview {
  preview: string; // Cloudinary URL
  name: string; // Original file name
  size: number; // File size
}

const BroadcastCreate = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const { createBroadCast, createLoading } = useBroadcast();
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const closeDeleteDialog = () => setisDeleteOpen(false);
  const removeFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      const closeButton = document.querySelector(
        "button.absolute.right-4.top-4"
      );

      if (closeButton) {
        closeButton.remove();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isDeleteOpen, setisDeleteOpen]);
  return (
    <div className="flex justify-between items-start">
      <div className="flex w-3/6 flex-col space-y-[24px]">
      <div
            onClick={() => {
              router.push("/broadcast");
            }}
            className=" cursor-pointer flex items-center transition-all active:scale-95"
          >
          <ArrowLeft width={20} height={20} className="mr-[8px]" />

            <span className="">Return back</span>
          </div>
        <div>
          <h2 className=" text-2xl">Create Broadcast</h2>
          <p className="text-sm text-[#A8A8A8]">
            create a new broadcast and add media content
          </p>
        </div>
        <div>
          <p className="text-[#10002E] font-medium mb-1 text-[14px]">Title</p>
          <Input
            className="focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#C8C8C8] border-[#C8C8C8]"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            placeholder="Enter Title"
          />
        </div>
        <div>
          <p className="text-[#10002E] font-medium mb-1 text-[14px]">
            Description
          </p>
          <Textarea
            className="focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#C8C8C8] h-[120px] border-[#C8C8C8]"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            placeholder="Enter Description"
          />
        </div>
        <div>
          <p className="text-[#10002E] font-medium mb-1 text-[14px]">Media</p>
          <Dropzone
            files={files}
            setFiles={setFiles}
            className="w-full border border-[#C8C8C8] border-dashed cursor-pointer h-32 rounded-md flex justify-center items-center"
          />
          <div className="mt-4">
            <ul className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="border rounded-[8px] border-[#E4E4E4] flex items-center p-4  justify-between "
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
                      <p className="text-[#111810] font-medium">{file.name}</p>
                      <p className="text-[12px] text-[#808080]">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button className=" transition-all bg-transparent text-black hover:bg-transparent text-sm font-medium cursor-pointer active:scale-95">
                      <Link href={file.preview} download={true} target="_blank">
                        Preview
                      </Link>
                    </Button>
                    <div className="bg-[#C8C8C8] rounded-full w-[4px] h-[4px]"></div>
                    <Button
                      onClick={() => {
                        removeFile(file.name);
                      }}
                      className="text-sm text-[#BF3100] font-medium bg-transparent hover:bg-transparent cursor-pointer active:scale-95 transition-all"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {title && description && files.length > 0 ? (
          <Button
            onClick={() => {
              setisDeleteOpen(true);
            }}
            className="btnPlain"
          >
            Delete Post
          </Button>
        ) : (
          <Button className="btnPlainInactive" disabled={true}>
            Delete Post
          </Button>
        )}
        {title && description && files.length > 0 ? (
          <Button
            onClick={async () => {
              const filePreviews = files.map((file) => file.preview);
              await createBroadCast(title, description, filePreviews);
              setTitle("");
              setDescription("");
              setFiles([]);
            }}
            className="btnColored"
            loading={createLoading}
          >
            Upload Post
          </Button>
        ) : (
          <Button className="btnColoredInactive" disabled={true}>
            Upload Post
          </Button>
        )}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-[384px]">
          <div className="flex flex-col items-center justify-center gap-2 mt-7">
            <Image
              src={"/DASHBOARDASSETS/ILLUSTRATION/DELETE.png"}
              height={72}
              width={69.68}
              alt="trashIcon"
            />
            <p className="text-[20px] font-medium">Delete this Broadcast?</p>
            <p className="text-[14px] text-center text-[#808080]">
              Are you sure you want to delete this broadcast? This action is
              irreversible.
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-center items-center space-x-2">
              <Button
                className="w-full shadow-md text-[14px] text-black bg-transparent hover:bg-transparent transition-all hover:scale-105 active:scale-95 border"
                type="submit"
              >
                Cancel
              </Button>
              <Button
                className="w-full shadow-md text-[14px] text-white bg-[#C83532] hover:bg-[#C83532] transition-all hover:scale-105 active:scale-95"
                type="submit"
              >
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BroadcastCreate;
