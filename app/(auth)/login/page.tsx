"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useLogin from "@/hooks/login";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useLogin()
  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/pattern.svg')" }}
    >
      {loading && <LoadingOverlay message="Processing..." />}
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
       {
        email && password ?  <button
        onClick={async() => {
          console.log("signin")
         await login(email, password);
          setEmail('');
          setPassword('');
        }}
        className="bg-[#F75803] transition-all text-[14px] active:scale-95 text-white w-[370px] py-2 rounded-md shadow-md"
      >
        Sign In
      </button> :
       <button
      //  onClick={() => {
      //    router.push("/broadcast");
      //  }}
       className="btnColoredInactive w-[370px]"
     >
       Sign In
     </button>
       }
       
      </div>
    </div>
  );
};

export default Login;
