"use client";

import BroadcastMediaUpload, {
  BroadcastMediaFile,
} from "@/components/broadcast/BroadcastMediaUpload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useBroadcast from "@/hooks/useBroadcast";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BroadcastCreate = () => {
  const [files, setFiles] = useState<BroadcastMediaFile[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { createBroadCast, createLoading } = useBroadcast();
  const router = useRouter();

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(description.trim()) &&
    files.length > 0 &&
    !isUploading;

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector("button.absolute.right-4.top-4")?.remove();
    }, 0);

    return () => clearTimeout(timer);
  }, [isDeleteOpen]);

  const clearDraft = () => {
    setTitle("");
    setDescription("");
    setFiles([]);
    setIsDeleteOpen(false);
  };

  const handleCreate = async () => {
    if (!canSubmit) return;

    await createBroadCast(
      title.trim(),
      description.trim(),
      files.map((file) => file.preview),
    );
    setTitle("");
    setDescription("");
    setFiles([]);
  };

  return (
    <main className="flex flex-col items-start pb-8">
      <button
        type="button"
        onClick={() => router.push("/broadcast")}
        className="inline-flex items-center gap-2 text-xs text-[#373737] transition hover:text-[#F75803]"
      >
        <ArrowLeft className="h-4 w-4" />
        Return back
      </button>

      <div className="flex w-full items-center justify-between gap-3">
        <header className="mt-5">
          <h1 className="text-[22px] font-medium leading-7 text-[#111810]">
            Create Broadcast
          </h1>
          <p className="mt-0.5 text-xs text-[#A8A8A8]">
            Create a new broadcast and add media content
          </p>
        </header>

        <div className="flex shrink-0 items-center gap-3">
          <Button
            className="btnPlain"
            disabled={!canSubmit || createLoading}
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete Post
          </Button>
          <Button
            className="btnColored"
            disabled={!canSubmit}
            loading={createLoading}
            onClick={handleCreate}
          >
            Upload Post
          </Button>
        </div>
      </div>

      <div className="mt-6 w-full max-w-[500px] space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[#10002E]">
            Title
          </span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter Title"
            className="h-11 border-[#C8C8C8] text-xs placeholder:text-[#C8C8C8] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[#10002E]">
            Description
          </span>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter Description"
            className="h-[120px] resize-none border-[#C8C8C8] text-xs placeholder:text-[#C8C8C8] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </label>

        <div>
          <p className="mb-1.5 text-xs font-medium text-[#10002E]">Media</p>
          <BroadcastMediaUpload
            files={files}
            setFiles={setFiles}
            onUploadStateChange={setIsUploading}
          />
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[384px]">
          <div className="mt-7 flex flex-col items-center justify-center gap-2">
            <Image
              src="/DASHBOARDASSETS/ILLUSTRATION/DELETE.png"
              height={72}
              width={69.68}
              alt="Delete broadcast"
            />
            <p className="text-[20px] font-medium">Delete this Broadcast?</p>
            <p className="text-center text-[14px] text-[#808080]">
              Are you sure you want to delete this broadcast draft? This action is
              irreversible.
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full items-center justify-center gap-2">
              <Button className="btnPlain w-full" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                className="w-full bg-[#C83532] text-white hover:bg-[#C83532]"
                onClick={clearDraft}
              >
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default BroadcastCreate;
