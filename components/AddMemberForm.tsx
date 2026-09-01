"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAdminsetting from "@/hooks/useAdminsetting";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AddMemberForm = () => {
  const router = useRouter();
  const { adminLoading, sendLink } = useAdminsetting();
  const [email, setEmail] = useState("");
  const [hasTouchedEmail, setHasTouchedEmail] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const isEmailValid = emailPattern.test(normalizedEmail);
  const showEmailError = hasTouchedEmail && !isEmailValid;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasTouchedEmail(true);

    if (!isEmailValid || adminLoading) return;

    const wasSent = await sendLink(normalizedEmail);
    if (wasSent) {
      setEmail("");
      setHasTouchedEmail(false);
    }
  };

  return (
    <div className="px-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-[500px]">
        <button
          type="button"
          onClick={() => router.push("/adminsetting")}
          className="mb-5 flex items-center text-sm text-[#111810] transition-all active:scale-95"
        >
          <ArrowLeft width={20} height={20} className="mr-2" />
          Return to dashboard
        </button>

        <div className="form-background overflow-hidden border-t-8 border-t-[#547AFF] bg-white">
          <div className="border-b px-7 py-5">
            <h1 className="font-Recoleta text-xl font-medium text-[#111810]">
              Add Admin
            </h1>
            <p className="mt-1 text-sm text-[#808080]">
              Send an invitation for the new admin to complete their profile.
            </p>
          </div>

          <div className="space-y-6 px-7 py-10">
            <div className="grid gap-2">
              <Label
                className="INT500 text-sm text-[#10002E]"
                htmlFor="admin-email"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A4A4A4]"
                />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => setHasTouchedEmail(true)}
                  placeholder="Enter admin email"
                  aria-invalid={showEmailError}
                  aria-describedby={showEmailError ? "admin-email-error" : undefined}
                  className="h-11 border-[#C8C8C8] pl-10 placeholder:text-[#A4A4A4] focus-visible:ring-[#F75803]"
                />
              </div>
              {showEmailError ? (
                <p id="admin-email-error" className="text-xs text-red-600" role="alert">
                  Enter a valid email address.
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className={`${isEmailValid ? "btnColored" : "btnColoredInactive"} h-11 w-full`}
              disabled={!isEmailValid || adminLoading}
              loading={adminLoading}
            >
              Send Email
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddMemberForm;
