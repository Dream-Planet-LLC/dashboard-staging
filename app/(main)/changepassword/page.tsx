"use client";

import Image from "next/image";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useLogin from "@/hooks/login";
import { toast } from "@/hooks/use-toast";

const changePassword = () => {
  const { changePassword, isOpen, setisOpen, loading } = useLogin();
   const [password, setPassword] = useState('');
   const [newpassword, setNewPassword] = useState('')
   const [renewpassword, setRenewPassword] = useState('')
  const closeDialog = () => setisOpen(false);
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

  const handleChangePassword = async () => {
    if (newpassword !== renewpassword) {
      toast({
        variant: "destructive",
        description: "Your new passwords don't match",
      });
      return;
    }

    await changePassword(password, newpassword);
    setPassword('');
    setNewPassword('');
    setRenewPassword('');
  };
  return (
    <div>
      <div className="flex w-3/6 flex-col space-y-[32px]">
        <div>
          <h2 className="text-2xl">Change Password</h2>
          <p className="text-[14px] text-[#A8A8A8]">
            Its a good idea to use a password you are not using elsewhere
          </p>
        </div>
        <div className="space-y-[40px]">
          <div className="w-full space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="border rounded-md flex items-center justify-between border-[#C8C8C8]">
              <Input
                className="focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8] placeholder:text-[14px]"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
                placeholder="Enter Password"
              />
              <Image
                src={"/icons/passwordeye.svg"}
                alt="passwordeye"
                width={14}
                height={14}
                className="mr-2"
              />
            </div>
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="border border-[#C8C8C8] rounded-md flex items-center justify-between">
              <Input
                className="focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8] placeholder:text-[14px]"
                type="password"
                value={newpassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                }}
                placeholder="Enter Password"
              />
              <Image
                src={"/icons/passwordeye.svg"}
                alt="passwordeye"
                width={14}
                height={14}
                className="mr-2"
              />
            </div>
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="retype">Re-type New Password</Label>
            <div className="border rounded-md flex items-center justify-between border-[#C8C8C8]">
              <Input
                className="focus-visible:ring-0 focus-visible:ring-offset-0 border-0 placeholder:text-[#C8C8C8] placeholder:text-[14px]"
                type="password"
                value={renewpassword}
                onChange={(e) => {
                  setRenewPassword(e.target.value)
                }}
                placeholder="Enter Password"
              />
              <Image
                src={"/icons/passwordeye.svg"}
                alt="passwordeye"
                width={14}
                height={14}
                className="mr-2"
              />
            </div>
          </div>
          <div className="flex justify-end  space-x-2">
            {newpassword && password && renewpassword ?
            <>
             <Button 
            onClick={() => {
              setPassword('');
              setNewPassword('');
              setRenewPassword('');
            }}
            className=" btnPlain">Cancel</Button>
            <Button
              className="btnColored"
              onClick={handleChangePassword}
              loading={loading}
            >
              Set New Password
            </Button>
            </>
            :  
            <>
             <Button 
            
            className=" btnPlainInactive">Cancel</Button>
            <Button
              className="btnColoredInactive"
            
            >
              Set New Password
            </Button>
            </>
            }
           
          </div>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[384px]">
          <div className="flex flex-col items-center justify-center gap-2 mt-7">
            <Image
              src={"/icons/passwordchanged.svg"}
              height={72}
              width={90}
              alt="passwordIcon"
            />
            <p className="text-[20px]">Password Changed</p>
            <p className="text-[14px] text-center text-[#808080]">
              Your password has been successfully changed. Keep it secure and do
              not share it with anyone.
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-center items-center space-x-2">
              <Button 
              onClick={closeDialog}
              className="w-full text-[14px] text-white bg-[#F75803] hover:bg-[#F75803] transition-all hover:scale-105 active:scale-95">
                Okay
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default changePassword;
