"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useLogin from "@/hooks/login";
import Image from "next/image";
import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useLogin()
  const canSubmit = Boolean(email && password);
  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/pattern.svg')" }}
    >
      <div className="flex flex-col justify-center border p-8 items-center  rounded-md shadow-md">
        <div className="flex items-center flex-col mb-[32px]">
          <img
            src={"/DASHBOARDASSETS/LOGO/SIGNUP LOGO.svg"}
            alt="dreamplanetlogo"
          />

          <p className="text-[#A4A4A4] mt-[4px]">
            Please enter your details to sign in.
          </p>
        </div>

        <div className="mb-[32px] w-full space-y-[24px]">
          <div className="flex flex-col space-y-[8px] w-full">
            <Label htmlFor="email" className="font-semibold">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              className="text-[#A4A4A4] placeholder:text-[#A4A4A4] placeholder:text-[14px] focus-visible:ring-0 focus-visible:ring-offset-0 border-[#C8C8C8]"
            />
          </div>
          <div className="flex flex-col space-y-[8px] w-full ">
            <Label htmlFor="password" className="font-semibold">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              className="text-[#343434] placeholder:text-[#A4A4A4] placeholder:text-[14px] focus-visible:ring-0 focus-visible:ring-offset-0 border-[#C8C8C8]"
            />
          </div>
        </div>
        <Button
          onClick={async () => {
            const signedIn = await login(email, password);
            if (signedIn) {
              setEmail('');
              setPassword('');
            }
          }}
          className={`${canSubmit ? "btnColored" : "btnColoredInactive"} w-[370px]`}
          disabled={!canSubmit || loading}
          loading={loading}
        >
          Sign In
        </Button>
       
      </div>
    </div>
  );
};

export default Login;
