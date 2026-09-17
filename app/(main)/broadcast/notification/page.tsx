"use client";

import NotificationImageUpload from "@/components/notifications/NotificationImageUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import usePushNotifications from "@/hooks/usePushNotifications";
import {
  NotificationMediaPayload,
  NotificationMediaUpload,
  NotificationRecipient,
} from "@/types/notifications";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const recipientName = (recipient: NotificationRecipient) =>
  recipient.full_name || recipient.username || `User ${recipient.id}`;

const recipientInitials = (recipient: NotificationRecipient) =>
  recipientName(recipient)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");

const PushNotificationPage = () => {
  const router = useRouter();
  const {
    loadRecipients,
    pagination,
    recipients,
    recipientsError,
    recipientsLoading,
    recipientsLoadingMore,
    sendLoading,
    sendNotification,
  } = usePushNotifications();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<NotificationMediaUpload | null>(null);
  const [allCreators, setAllCreators] = useState(false);
  const [allFans, setAllFans] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [selectedUsersById, setSelectedUsersById] = useState<
    Map<number, NotificationRecipient>
  >(() => new Map());
  const [recipientSearch, setRecipientSearch] = useState("");
  const [isRecipientListOpen, setIsRecipientListOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const sendStartedRef = useRef(false);
  const debouncedRecipientSearch = useDebounce(recipientSearch, 400);

  useEffect(() => {
    void loadRecipients({
      page: 1,
      searchString: debouncedRecipientSearch,
    });
  }, [debouncedRecipientSearch, loadRecipients]);

  const selectedUsers = useMemo(
    () => Array.from(selectedUsersById.values()),
    [selectedUsersById],
  );
  const selectedAudienceCount =
    Number(allCreators) + Number(allFans) + selectedUserIds.size;
  const hasAudience = selectedAudienceCount > 0;
  const mediaReady =
    !media || (media.status === "complete" && Boolean(media.url));
  const canPreview =
    Boolean(title.trim()) &&
    Boolean(message.trim()) &&
    hasAudience &&
    mediaReady &&
    !sendLoading;
  const pushPreviewMessage =
    message.length > 200 ? `${message.slice(0, 197)}...` : message;

  const toggleRecipient = (recipient: NotificationRecipient) => {
    const isSelected = selectedUserIds.has(recipient.id);

    setSelectedUserIds((current) => {
      const next = new Set(current);
      if (isSelected) next.delete(recipient.id);
      else next.add(recipient.id);
      return next;
    });
    setSelectedUsersById((current) => {
      const next = new Map(current);
      if (isSelected) next.delete(recipient.id);
      else next.set(recipient.id, recipient);
      return next;
    });
  };

  const removeRecipient = (recipientId: number) => {
    setSelectedUserIds((current) => {
      const next = new Set(current);
      next.delete(recipientId);
      return next;
    });
    setSelectedUsersById((current) => {
      const next = new Map(current);
      next.delete(recipientId);
      return next;
    });
  };

  const createMediaPayload = (): NotificationMediaPayload[] => {
    if (!media?.url || media.status !== "complete") return [];

    return [
      {
        url: media.url,
        mime_type: media.mimeType,
        file_name: media.name,
        size_bytes: media.size,
        width: media.width,
        height: media.height,
      },
    ];
  };

  const handleSendNotification = async () => {
    if (!canPreview || sendStartedRef.current) return;
    sendStartedRef.current = true;

    try {
      const result = await sendNotification({
        title: title.trim(),
        message: message.trim(),
        media: createMediaPayload(),
        audience: {
          all_creators: allCreators,
          all_fans: allFans,
          user_ids: Array.from(selectedUserIds).sort((first, second) => first - second),
        },
      });

      toast.success(
        `Notification queued for ${result.recipient_count.toLocaleString()} recipients (${result.push_token_count.toLocaleString()} push-enabled)`,
      );
      setIsPreviewOpen(false);
      router.push("/broadcast");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send the notification. Please try again.",
      );
    } finally {
      sendStartedRef.current = false;
    }
  };

  const loadMoreRecipients = () => {
    if (!pagination?.hasNextPage || !pagination.nextPage) return;

    void loadRecipients({
      append: true,
      page: pagination.nextPage,
      searchString: debouncedRecipientSearch,
    });
  };

  const visibleUserChipCount = Math.max(
    0,
    4 - Number(allCreators) - Number(allFans),
  );

  return (
    <main className="flex flex-col items-start justify-between pb-8">
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
            Send Push Notification
          </h1>
          <p className="mt-0.5 text-xs text-[#A8A8A8]">
            Create, send and customise app wide push notifications
          </p>
        </header>

        <div className="flex shrink-0 items-center gap-3">
          <Button className="btnPlain" onClick={() => router.push("/broadcast")}>
            Cancel
          </Button>
          <Button
            className="btnColored"
            disabled={!canPreview}
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview
          </Button>
        </div>
      </div>

      <div className="mt-6 w-full max-w-[500px] space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[#10002E]">Title</span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="You’re invited to join the challenge!"
            className="h-11 border-[#C8C8C8] text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[#10002E]">
            Message
          </span>
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Hello Creator, You have been invited to join the #ororochallenge. Hop in this challenge right now"
            className="h-[78px] resize-none border-[#C8C8C8] text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </label>

        <div>
          <p className="mb-1.5 text-xs font-medium text-[#10002E]">Media</p>
          <NotificationImageUpload media={media} onChange={setMedia} />
          {media?.status === "error" && (
            <p className="mt-1.5 text-[11px] text-[#BF3100]">
              Remove this image or select it again before previewing.
            </p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-[#10002E]">Send to</p>
          <div className="rounded-lg border border-[#C8C8C8] bg-white">
            <div className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left">
              <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                {allCreators && (
                  <AudienceChip
                    label="All Creators"
                    onRemove={() => setAllCreators(false)}
                  />
                )}
                {allFans && (
                  <AudienceChip label="All Fans" onRemove={() => setAllFans(false)} />
                )}
                {selectedUsers.slice(0, visibleUserChipCount).map((recipient) => (
                  <AudienceChip
                    key={recipient.id}
                    avatar={recipient.image}
                    label={recipientName(recipient)}
                    onRemove={() => removeRecipient(recipient.id)}
                  />
                ))}
                {selectedAudienceCount > 4 && (
                  <span className="rounded bg-[#686868] px-2 py-1 text-[10px] text-white">
                    {selectedAudienceCount - 4}
                  </span>
                )}
                {selectedAudienceCount === 0 && (
                  <span className="text-xs text-[#A8A8A8]">Select an audience</span>
                )}
              </span>
              <button
                type="button"
                aria-label={
                  isRecipientListOpen ? "Close recipient list" : "Open recipient list"
                }
                aria-expanded={isRecipientListOpen}
                onClick={() => setIsRecipientListOpen((current) => !current)}
                className="shrink-0 p-1 text-[#808080]"
              >
                {isRecipientListOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {isRecipientListOpen && (
              <div className="border-t border-[#E4E4E4] p-3">
                <label className="flex h-10 items-center gap-2 rounded-md border border-[#D8D8D8] px-3 text-[#A8A8A8]">
                  {recipientsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="sr-only">Search recipients</span>
                  <input
                    value={recipientSearch}
                    onChange={(event) => setRecipientSearch(event.target.value)}
                    placeholder="Search for fans or creator..."
                    className="w-full bg-transparent text-xs text-[#111810] outline-none placeholder:text-[#A8A8A8]"
                  />
                </label>

                <div className="mt-2 max-h-[240px] space-y-1 overflow-y-auto pr-1">
                  <AudienceGroupRow
                    label="All Creators"
                    selected={allCreators}
                    onClick={() => setAllCreators((current) => !current)}
                  />
                  <AudienceGroupRow
                    label="All Fans"
                    selected={allFans}
                    onClick={() => setAllFans((current) => !current)}
                  />

                  <div className="my-1 border-t border-[#EEEEEE]" />

                  {recipientsLoading ? (
                    <div className="flex items-center justify-center gap-2 py-5 text-xs text-[#808080]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading recipients...
                    </div>
                  ) : recipientsError ? (
                    <div className="py-4 text-center">
                      <p className="text-xs text-[#BF3100]">{recipientsError}</p>
                      <button
                        type="button"
                        onClick={() =>
                          void loadRecipients({
                            page: 1,
                            searchString: debouncedRecipientSearch,
                          })
                        }
                        className="mt-2 text-xs font-medium text-[#F75803]"
                      >
                        Try again
                      </button>
                    </div>
                  ) : recipients.length === 0 ? (
                    <p className="py-5 text-center text-xs text-[#808080]">
                      No recipients found.
                    </p>
                  ) : (
                    <>
                      {recipients.map((recipient) => {
                        const selected = selectedUserIds.has(recipient.id);
                        return (
                          <button
                            key={recipient.id}
                            type="button"
                            onClick={() => toggleRecipient(recipient)}
                            className="flex w-full items-center justify-between rounded-md px-1 py-2 text-left hover:bg-[#FAFAFA]"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={recipient.image || undefined}
                                  alt={recipientName(recipient)}
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-[9px]">
                                  {recipientInitials(recipient)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-medium text-[#292929]">
                                  {recipientName(recipient)}
                                </span>
                                <span className="block truncate text-[10px] capitalize text-[#909090]">
                                  {recipient.username ? `@${recipient.username} · ` : ""}
                                  {recipient.user_type}
                                </span>
                              </span>
                            </span>
                            {selected && <Check className="h-4 w-4 text-[#F75803]" />}
                          </button>
                        );
                      })}

                      {pagination?.hasNextPage && (
                        <button
                          type="button"
                          disabled={recipientsLoadingMore}
                          onClick={loadMoreRecipients}
                          className="flex w-full items-center justify-center gap-2 rounded-md py-2 text-xs font-medium text-[#F75803] hover:bg-[#FFF7F2] disabled:opacity-60"
                        >
                          {recipientsLoadingMore && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          )}
                          {recipientsLoadingMore ? "Loading..." : "Load more"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-y-auto border-l border-[#E4E4E4] p-6 sm:max-w-[410px]"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-base font-medium text-[#111810]">
              Preview Notifications
            </SheetTitle>
            <SheetDescription className="sr-only">
              Preview the notification before sending it.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 space-y-5">
            <section>
              <p className="mb-2 text-xs font-medium text-[#5F5F5F]">
                Push Notification
              </p>
              <div className="rounded-lg border border-[#E4E4E4] p-3">
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F7F7]">
                    <Image
                      src="/DreamPlanetLogo.png"
                      alt="Dream Planet"
                      width={22}
                      height={22}
                    />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-[#111810]">
                      {title.trim()}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-[#707070]">
                      {pushPreviewMessage.trim()}
                    </p>
                    <p className="mt-1 text-[10px] text-[#A8A8A8]">Now</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-medium text-[#5F5F5F]">
                Notification Details
              </p>
              <div className="overflow-hidden rounded-lg border border-[#E4E4E4]">
                {media?.status === "complete" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.preview}
                    alt={media.name}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-[#F7F7F7] text-xs text-[#A8A8A8]">
                    No image added
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[10px] text-[#5F5F5F]">
                    <Image src="/DreamPlanetLogo.png" alt="" width={17} height={17} />
                    Dream Planet <span>•</span> Now
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-[#111810]">
                    {title.trim()}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#5F5F5F]">
                    {message.trim()}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <p className="text-xs text-[#5F5F5F]">
                This notification will be sent to;
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allCreators && <PreviewAudienceChip label="All Creators" />}
                {allFans && <PreviewAudienceChip label="All Fans" />}
                {selectedUsers.map((recipient) => (
                  <PreviewAudienceChip
                    key={recipient.id}
                    avatar={recipient.image}
                    label={recipientName(recipient)}
                  />
                ))}
              </div>
            </section>
          </div>

          <SheetFooter className="mt-auto pt-6 sm:space-x-3">
            <Button
              className="btnPlain"
              disabled={sendLoading}
              onClick={() => setIsPreviewOpen(false)}
            >
              Go back and edit
            </Button>
            <Button
              className="btnColored"
              loading={sendLoading}
              disabled={!canPreview}
              onClick={handleSendNotification}
            >
              Send Notification
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
};

interface AudienceChipProps {
  label: string;
  avatar?: string | null;
  onRemove: () => void;
}

const AudienceChip = ({ label, avatar, onRemove }: AudienceChipProps) => (
  <span className="inline-flex items-center gap-1 rounded bg-[#F2F2F2] px-2 py-1 text-[10px] text-[#4F4F4F]">
    {avatar && (
      <Avatar className="h-4 w-4">
        <AvatarImage src={avatar} alt="" className="object-cover" />
        <AvatarFallback>{label.slice(0, 1)}</AvatarFallback>
      </Avatar>
    )}
    {label}
    <button type="button" aria-label={`Remove ${label}`} onClick={onRemove}>
      <X className="h-3 w-3" />
    </button>
  </span>
);

interface AudienceGroupRowProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const AudienceGroupRow = ({ label, selected, onClick }: AudienceGroupRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-md px-1 py-2 text-left hover:bg-[#FAFAFA]"
  >
    <span className="flex items-center gap-2 text-xs font-medium text-[#292929]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#087AFF] text-white">
        <UsersRound className="h-3 w-3" />
      </span>
      {label}
    </span>
    {selected && <Check className="h-4 w-4 text-[#F75803]" />}
  </button>
);

interface PreviewAudienceChipProps {
  label: string;
  avatar?: string | null;
}

const PreviewAudienceChip = ({ label, avatar }: PreviewAudienceChipProps) => (
  <span className="inline-flex items-center gap-1 rounded bg-[#F2F2F2] px-2 py-1 text-[9px] text-[#4F4F4F]">
    {avatar && (
      <Avatar className="h-3.5 w-3.5">
        <AvatarImage src={avatar} alt="" className="object-cover" />
        <AvatarFallback>{label.slice(0, 1)}</AvatarFallback>
      </Avatar>
    )}
    {label}
  </span>
);

export default PushNotificationPage;
