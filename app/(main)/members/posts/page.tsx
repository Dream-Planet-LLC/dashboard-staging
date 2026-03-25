"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, CheckIcon, ChevronDownIcon, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import useGetUsers from "@/hooks/useGetUsers";
import LoadingState from "@/components/LoadingState";
import MediaCarousel from "@/components/MediaCarousel";
const Posts = () => {
  const { updateUserPosts, userLoading, deletePost } = useGetUsers();
  const [isOpen, setisOpen] = useState(false);
  const closeDialog = () => setisOpen(false);
  const [isDeleteOpen, setisDeleteOpen] = useState(false);
  const [postdetail, setPostdetail] = useState<any>();
  const closeDeleteDialog = () => {
    setisDeleteOpen(false);
    setPostdetail({});
  };
  const [deleteId, setDeleteId] = useState(0);
  const [isRestoreOpen, setisRestoreOpen] = useState(false);
  const closeRestoreDialog = () => setisRestoreOpen(false);
  const options = ["All Post", "Forum", "Feed"];
  const [selected, setSelected] = useState<string>("All Post");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);
  const { userPost, userProfile } = useSelector(
    (state: RootState) => state.usersOnboarded
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const timeSincePost = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - createdDate.getTime();

    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));

    if (minutes < 60) return `${minutes}min`;
    else if (hours < 24) return `${hours}h`;
    else if (days < 30) return `${days}d`;
    else if (months < 12) return `${months}m`;
    else return `${years}y`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const closeButton = document.querySelector(
        "button.absolute.right-4.top-4"
      );

      if (closeButton) {
        closeButton.remove();
      }
    }, 0); // Delay of 0 ensures it happens after the render cycle

    return () => clearTimeout(timer);
  }, [isDeleteOpen, setisDeleteOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsSelectOpen(false);
      }
    };

    if (isSelectOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelectOpen]);

  const handleSelect = (option: string) => {
    setSelected(option);
  };

  useEffect(() => {
    if (selected === "All Post") {
      updateUserPosts(userProfile.id, "all");
    } else {
      updateUserPosts(userProfile.id, selected.toLowerCase());
    }
  }, [selected]);

  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      const closeButton = document.querySelector(
        "button.absolute.right-4.top-4"
      );
      if (closeButton) {
        closeButton.remove();
      }
    }, 0); // Delay of 0 ensures it happens after the render cycle

    return () => clearTimeout(timer);
  }, [isOpen, setisOpen]);
  useEffect(() => {
    if (!userLoading) {
      setIsInitialLoading(false);
    }
  }, [userLoading]);

  if (userLoading && isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading posts..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <p
        onClick={() => {
          router.push("/members");
        }}
        className="flex items-center w-max  space-x-3 cursor-pointer transition-all active:scale-95 text-[14px] mb-3"
      >
        <span className="mr-2">
          <ArrowLeft size={14} />
        </span>
        Return back
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Avatar>
            <AvatarImage
              className="object-cover"
              src={userProfile?.image}
              alt="@shadcn"
            />
            <AvatarFallback>
              {userProfile?.fullName ? userProfile.fullName[0] : "CN"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p>{userProfile.fullName}</p>
            <div className="flex items-center space-x-2">
              <p className="text-[#808080] flex items-center space-x-2">
                <span className="mr-1">
                  <Image
                    src={"/icons/profile.svg"}
                    height={13}
                    width={13}
                    alt="profileIcon"
                  />
                </span>
                {userProfile.type}
              </p>
              <div className="h-1 w-1 rounded-full bg-[#808080]"></div>
              <p className="text-[#808080] flex items-center space-x-2">
                <span className="mr-1">
                  <Image
                    src={"/icons/music.svg"}
                    height={13}
                    width={13}
                    alt="musicIcon"
                  />
                </span>
                Artist/Musician
              </p>
            </div>
          </div>
        </div>
        <div className="relative inline-block w-[96px]" ref={selectRef}>
          <button
            onClick={() => setIsSelectOpen(!isSelectOpen)}
            className="w-full flex justify-between items-center bg-white border border-gray-300 rounded-md px-2 py-2"
          >
            <span
              className={`
               text-[14px] `}
            >
              {selected ? selected : "Select Option"}
            </span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {isSelectOpen && (
            <div className="absolute mt-2 w-[120px] bg-white border border-gray-300 rounded-md shadow-lg z-10 right-0">
              {options.map((option) => (
                <div
                  key={option}
                  className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  onClick={() => handleSelect(option)}
                >
                  <span className="flex items-center text-[14px]">
                    <div
                      className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center mr-2 ${
                        selected === option
                          ? "bg-[#F75803] border-[#F75803]"
                          : "border-gray-400"
                      }`}
                    >
                      {selected === option && (
                        <CheckIcon className="w-3 h-3 text-white" />
                      )}
                    </div>
                    {option}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {userPost ? (
        <div>
          <div>
            <p className="text-[20px] font-medium mb-2">All Post</p>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {userPost.map((post: any) => {
              return (
                <div
                  key={post?.id}
                  className="relative border rounded-md transition-all "
                >
                  <div className="relative w-full h-[201px]">
  {post?.feed?.media_url?.length > 0 ? (
    <MediaCarousel mediaUrls={post.feed.media_url} />
  ) : (
    <div className="w-full bg-black flex items-center justify-center h-full">
      <Avatar className="w-[72px] h-[72px]">
        <AvatarImage
          className="object-cover"
          src={userProfile.image}
          alt="@shadcn"
        />
        <AvatarFallback>
          {userProfile?.fullName ? userProfile.fullName[0] : "CN"}
        </AvatarFallback>
      </Avatar>
    </div>
  )}
</div>

                  <p className="text-[14px] my-2 text-[#5B5B5B] px-4">
                    {post?.feed?.text_content}
                    <span
                      onClick={() => {
                        setisOpen(true);
                        setPostdetail(post);
                      }}
                      className="cursor-pointer ml-2 text-[#F75803]"
                    >
                      view more.
                    </span>
                  </p>
                  <div className="flex space-x-4 my-2 px-4">
                    <p className="text-[#A4A4A4] text-[12px] flex items-center space-x-1">
                      <span className="mr-2">
                        <Image
                          src={"/icons/likeIcon.svg"}
                          height={14}
                          width={14}
                          alt="likeicon"
                        />
                      </span>
                      {post?.likes_count}
                    </p>
                    <div className="border-l border-[#E0E0E0] h-4"></div>
                    <p className="text-[#A4A4A4] text-[12px] flex items-center">
                      <span className="mr-2">
                        <Image
                          src={"/icons/messageIcon.svg"}
                          height={14}
                          width={14}
                          alt="messageicon"
                        />
                      </span>
                      {post?.comments_count}
                    </p>
                  </div>
                  <div
                    onClick={() => {
                      setisOpen(false);
                      setDeleteId(post?.feed?.id)
                      setisDeleteOpen(true);
                    }}
                    className="cursor-pointer absolute right-0 top-2 z-20"
                  >
                    <Image
                      src="/icons/whitetrash.svg"
                      alt="deletepost"
                      width={14}
                      height={14}
                      className="mr-3 z-40"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-[20px] font-medium mb-2">No Post</p>
      )}

      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[417px] sm:rounded-sm p-0 pb-4 ">
          <div className="flex px-4 pb-0 pt-6 items-center justify-between">
            <div className="flex items-center space-x-1">
              <Avatar>
                <AvatarImage
                  className="object-cover"
                  src={userProfile?.image}
                  alt="@shadcn"
                />
                <AvatarFallback>
                  {userProfile?.fullName ? userProfile.fullName[0] : "CN"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[14px] flex items-center space-x-2 font-semibold">
                  {userProfile.fullName}
                  <span className="flex items-center space-x-2">
                    <div className="h-1 w-1 ml-2 bg-[#A4A4A4] rounded-full"></div>
                    <p className="text-[#A4A4A4] text-[12px]">
                      {timeSincePost(postdetail?.feed?.created_at)}
                    </p>
                  </span>
                </p>
                <p className="text-[12px] text-[#A4A4A4]">{userProfile.type}</p>
              </div>
            </div>
            <div>
              <div
                onClick={() => {
                  setisOpen(false);
                  setDeleteId(postdetail?.feed?.id);
                  setisDeleteOpen(true);
                }}
                className="cursor-pointer"
              >
                <Image
                  src="/icons/delete.svg"
                  alt="deletepost"
                  width={14}
                  height={14}
                  className="mr-3"
                />
              </div>
            </div>
          </div>
          <div className=" rounded-md transition-all ">
          <div className="relative w-full h-[170px]">
  {postdetail?.feed?.media_url?.length > 0 ? (
   <MediaCarousel mediaUrls={postdetail?.feed?.media_url} />
  ) : (
    <div className="w-full bg-black flex items-center justify-center h-full">
      <Avatar className="w-[72px] h-[72px] bg-white z-20">
        <AvatarImage
          className="object-cover"
          src={userProfile.image}
          alt="@shadcn"
        />
        <AvatarFallback>
          {userProfile?.fullName ? userProfile.fullName[0] : "CN"}
        </AvatarFallback>
      </Avatar>
    </div>
  )}
</div>

            <div className="px-6">
              <p className="text-[14px] my-2 py-2 text-[#5B5B5B]  border-b">
                {postdetail?.feed?.text_content}
                <span className="text-[#F75803]">
                 
                </span>
              </p>
            </div>

            <div className="flex space-x-3 my-2 px-6">
              <p className="text-[#A4A4A4] text-[12px] flex items-center ">
                <span className="mr-[1px]">
                  <Image
                    src={"/icons/likeIcon.svg"}
                    height={14}
                    width={14}
                    alt="likeicon"
                  />
                </span>
                {postdetail?.likes_count}
              </p>

              <p className="text-[#A4A4A4] text-[12px] flex items-center">
                <span className="mr-[1px]">
                  <Image
                    src={"/icons/messageIcon.svg"}
                    height={14}
                    width={14}
                    alt="messageicon"
                  />
                </span>
                {postdetail?.comments_count}
              </p>
              <Image
                src={"/icons/shareIcon.svg"}
                height={14}
                width={14}
                alt="shareicon"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-[384px]">
          <div className="flex flex-col items-center justify-center gap-2 mt-7">
            <Image
              src={"/DASHBOARDASSETS/ILLUSTRATION/DELETE.png"}
              height={72}
              width={69.68}
              alt="trashIcon"
            />
            <p className="text-[20px] font-medium">Delete Post?</p>
            <p className="text-[14px] text-center text-[#808080]">
              Are you sure you want to delete this Post? This action is
              irreversible.
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-center items-center space-x-2">
              <Button
              onClick={() => {
                setisDeleteOpen(false);
              }}
                className="w-full shadow-md text-[14px] text-black bg-transparent hover:bg-transparent transition-all hover:scale-105 active:scale-95 border"
                type="submit"
              >
                Cancel
              </Button>
              <Button
              onClick={async() => {
                setisDeleteOpen(false);
                if (selected === "All Post") {
                  await deletePost(deleteId, 'all');
                } else {
                  await deletePost(deleteId, selected.toLowerCase());
                  }
              }}
                className="w-full shadow-md text-[14px] text-white bg-[#C83532] hover:bg-[#C83532] transition-all hover:scale-105 active:scale-95"
                type="submit"
                loading={userLoading}
              >
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRestoreOpen} onOpenChange={closeRestoreDialog}>
        <DialogContent className="sm:max-w-[384px]">
          <div className="flex flex-col items-center justify-center gap-2 mt-7">
            <Image
              src={"/icons/restoreIcon.svg"}
              height={72}
              width={47.61}
              alt="trashIcon"
            />
            <p className="text-[20px]">Restore Foul Post?</p>
            <p className="text-[14px] text-center text-[#808080]">
              Are you sure you want to restore this Foul Post? This action is
              irreversible.
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-center items-center space-x-2">
              <Button
                className="w-full text-[14px] text-black bg-transparent hover:bg-transparent transition-all hover:scale-105 active:scale-95 border"
                type="submit"
              >
                Cancel
              </Button>
              <Button
                className="w-full text-[14px] text-white bg-[#2BAC47] hover:bg-[#2BAC47] transition-all hover:scale-105 active:scale-95"
                type="submit"
              >
                Restore
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Posts;
