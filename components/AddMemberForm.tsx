"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, Check } from "lucide-react";
import PhoneInput, { CountryData as PhoneCountryData } from "react-phone-input-2";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAdminsetting from "@/hooks/useAdminsetting";
import { cn } from "@/lib/utils";
import { RootState } from "@/redux/store";
import { countries as countryData } from "@/utils/interface";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9]{7,15}$/;
type CountryOption = (typeof countryData)[number];

const availableCountries = countryData.filter(
  (country) => country.code && country.dial_code,
);
const defaultPhoneCountry =
  availableCountries.find((country) => country.code === "NG") || null;

const AddMemberForm = () => {
  const router = useRouter();
  const { adminRoles } = useSelector((state: RootState) => state.adminsetting);
  const { adminLoading, createAdmin, sendLink } = useAdminsetting();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<CountryOption | null>(
    defaultPhoneCountry,
  );
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [isSendLinkOpen, setIsSendLinkOpen] = useState(false);
  const [isSendSuccessOpen, setIsSendSuccessOpen] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [hasTouchedLinkEmail, setHasTouchedLinkEmail] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedLinkEmail = linkEmail.trim().toLowerCase();
  const isEmailValid = emailPattern.test(normalizedEmail);
  const isLinkEmailValid = emailPattern.test(normalizedLinkEmail);
  const isPhoneValid = Boolean(
    phoneCountry && phonePattern.test(phoneNumber.replace(/\D/g, "")),
  );
  const isFormValid = Boolean(
    firstName.trim() &&
      lastName.trim() &&
      selectedCountry &&
      isPhoneValid &&
      isEmailValid &&
      selectedRole,
  );

  const resetAdminForm = () => {
    setFirstName("");
    setLastName("");
    setSelectedCountry("");
    setPhoneNumber("");
    setPhoneCountry(defaultPhoneCountry);
    setEmail("");
    setSelectedRole("");
    setHasSubmitted(false);
  };

  const handleAddAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);

    if (!isFormValid || adminLoading) return;

    const wasCreated = await createAdmin(
      firstName.trim(),
      lastName.trim(),
      selectedCountry,
      `+${phoneNumber.replace(/\D/g, "")}`,
      normalizedEmail,
      Number(selectedRole),
    );

    if (wasCreated) resetAdminForm();
  };

  const handleSendLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasTouchedLinkEmail(true);

    if (!isLinkEmailValid || adminLoading) return;

    const wasSent = await sendLink(normalizedLinkEmail);
    if (wasSent) {
      setIsSendLinkOpen(false);
      setIsSendSuccessOpen(true);
      setLinkEmail("");
      setHasTouchedLinkEmail(false);
    }
  };

  const fieldClassName =
    "h-11 rounded-lg border-[#C8C8C8] placeholder:text-sm placeholder:text-[#C8C8C8] focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <div className="px-4">
      <form onSubmit={handleAddAdmin} className="mx-auto max-w-[562px]" noValidate>
        <button
          type="button"
          onClick={() => router.push("/adminsetting")}
          className="mb-5 flex items-center text-sm text-[#111810] transition-all active:scale-95"
        >
          <ArrowLeft width={20} height={20} className="mr-2" />
          Return to dashboard
        </button>

        <div className="form-background overflow-hidden border-t-8 border-t-[#547AFF] bg-white">
          <div className="flex items-center justify-between gap-4 border-b px-6 py-5">
            <h1 className="font-Recoleta text-xl font-medium text-[#111810]">
              Add Admin
            </h1>
            <div className="flex shrink-0 items-center gap-3">
              <Button
                type="button"
                className="btnPlain"
                onClick={() => setIsSendLinkOpen(true)}
                disabled={adminLoading}
              >
                Send link
              </Button>
              <Button
                type="submit"
                className={isFormValid ? "btnColored" : "btnColoredInactive"}
                disabled={!isFormValid || adminLoading}
                loading={adminLoading}
              >
                Add Admin
              </Button>
            </div>
          </div>

          <div className="space-y-5 px-6 py-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="First Name"
                htmlFor="firstName"
                error={hasSubmitted && !firstName.trim() ? "Enter a first name." : ""}
              >
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Enter First Name"
                  className={fieldClassName}
                />
              </FormField>

              <FormField
                label="Last Name"
                htmlFor="lastName"
                error={hasSubmitted && !lastName.trim() ? "Enter a last name." : ""}
              >
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Enter Last Name"
                  className={fieldClassName}
                />
              </FormField>
            </div>

            <FormField
              label="Country"
              htmlFor="country"
              error={hasSubmitted && !selectedCountry ? "Select a country." : ""}
            >
              <CountryPicker
                id="country"
                value={
                  availableCountries.find(
                    (country) => country.name === selectedCountry,
                  ) || null
                }
                onChange={(country) => setSelectedCountry(country.name)}
                invalid={hasSubmitted && !selectedCountry}
              />
            </FormField>

            <FormField
              label="Mobile No."
              htmlFor="mobile"
              error={hasSubmitted && !isPhoneValid ? "Enter a valid mobile number." : ""}
            >
              <PhoneInput
                country={phoneCountry?.code.toLowerCase()}
                value={phoneNumber}
                enableSearch
                autocompleteSearch
                countryCodeEditable={false}
                searchPlaceholder="Search country or code..."
                placeholder="Enter phone number"
                preferredCountries={["ng", "gb", "us"]}
                onChange={(phone, country) => {
                  setPhoneNumber(phone);

                  const phoneData = country as PhoneCountryData;
                  if (phoneData.countryCode) {
                    const matchedCountry = availableCountries.find(
                      (item) =>
                        item.code.toLowerCase() ===
                        phoneData.countryCode.toLowerCase(),
                    );
                    if (matchedCountry) setPhoneCountry(matchedCountry);
                  }
                }}
                inputProps={{
                  id: "mobile",
                  name: "mobile",
                  autoComplete: "tel",
                  "aria-invalid": hasSubmitted && !isPhoneValid,
                }}
                containerClass={cn(
                  "invite-phone-input",
                  hasSubmitted && !isPhoneValid && "invite-phone-input-error",
                )}
              />
            </FormField>

            <FormField
              label="Email"
              htmlFor="email"
              error={hasSubmitted && !isEmailValid ? "Enter a valid email address." : ""}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter Email Address"
                className={fieldClassName}
              />
            </FormField>

            <FormField
              label="Role"
              htmlFor="role"
              error={hasSubmitted && !selectedRole ? "Select a role." : ""}
            >
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger
                  id="role"
                  className="h-11 w-full rounded-lg border-[#C8C8C8] focus:ring-0 focus:ring-offset-0"
                >
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {adminRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>
      </form>

      <Dialog
        open={isSendLinkOpen}
        onOpenChange={(open) => {
          if (!adminLoading) {
            setIsSendLinkOpen(open);
            if (!open) setHasTouchedLinkEmail(false);
          }
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[440px]">
          <DialogHeader className="border-b px-4 py-5">
            <DialogTitle className="font-medium">Send form</DialogTitle>
            <DialogDescription className="sr-only">
              Email the admin profile form to a recipient.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendLink} noValidate>
            <div className="px-4 py-7">
              <FormField
                label="Email"
                htmlFor="link-email"
                error={
                  hasTouchedLinkEmail && !isLinkEmailValid
                    ? "Enter a valid email address."
                    : ""
                }
              >
                <Input
                  id="link-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={linkEmail}
                  onChange={(event) => setLinkEmail(event.target.value)}
                  onBlur={() => setHasTouchedLinkEmail(true)}
                  placeholder="Enter Email Address"
                  className={fieldClassName}
                />
              </FormField>
            </div>

            <DialogFooter className="border-t px-4 py-6">
              <Button
                type="button"
                className="btnPlain min-w-[98px]"
                onClick={() => setIsSendLinkOpen(false)}
                disabled={adminLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`${isLinkEmailValid ? "btnColored" : "btnColoredInactive"} min-w-[98px]`}
                disabled={!isLinkEmailValid || adminLoading}
                loading={adminLoading}
              >
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSendSuccessOpen} onOpenChange={setIsSendSuccessOpen}>
        <DialogContent className="gap-0 p-9 text-center sm:max-w-[362px] [&>button.absolute]:hidden">
          <DialogHeader className="items-center">
            <span className="mb-3 flex h-16 w-16 items-center justify-center text-[#25B84A]">
              <Check className="h-16 w-16 stroke-[3]" />
            </span>
            <DialogTitle className="font-Recoleta text-xl font-medium">
              Form sent
            </DialogTitle>
            <DialogDescription className="max-w-[260px] pt-1 text-sm leading-5 text-[#808080]">
              Form sent successfully! The recipient should check their email inbox.
            </DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            className="mt-6 h-10 w-full bg-[#25B84A] text-white hover:bg-[#25B84A]/90"
            onClick={() => setIsSendSuccessOpen(false)}
          >
            Okay!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface FormFieldProps {
  children: React.ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
}

const FormField = ({ children, error, htmlFor, label }: FormFieldProps) => (
  <div className="grid w-full gap-2">
    <Label className="text-sm font-medium text-[#10002E]" htmlFor={htmlFor}>
      {label}
    </Label>
    {children}
    {error ? (
      <p className="text-xs text-red-600" role="alert">
        {error}
      </p>
    ) : null}
  </div>
);

const CountryPicker = ({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string;
  value: CountryOption | null;
  onChange: (country: CountryOption) => void;
  invalid: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          aria-label="Select country"
          className={cn(
            "h-11 w-full justify-between border-[#C8C8C8] bg-white font-normal text-[#111810] shadow-none focus-visible:ring-[#F75803]",
            invalid && "border-red-500",
          )}
        >
          {value ? (
            <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <CountryFlag countryCode={value.code} />
              <span className="truncate">{value.name}</span>
            </span>
          ) : (
            <span className="text-[#A4A4A4]">Select country</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(360px,calc(100vw-32px))] p-0"
      >
        <Command>
          <CommandInput placeholder="Search country or code..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {availableCountries.map((country) => {
                const isSelected =
                  value?.code === country.code &&
                  value?.dial_code === country.dial_code;

                return (
                  <CommandItem
                    key={`${country.code}-${country.dial_code}-${country.name}`}
                    value={`${country.name} ${country.code} ${country.dial_code}`}
                    onSelect={() => {
                      onChange(country);
                      setOpen(false);
                    }}
                    className="gap-3 py-2.5"
                  >
                    <CountryFlag countryCode={country.code} />
                    <span className="min-w-0 flex-1 truncate text-[#111810]">
                      {country.name}
                    </span>
                    <span className="text-xs text-[#808080]">
                      {country.dial_code}
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4 text-[#F75803]",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const CountryFlag = ({ countryCode }: { countryCode: string }) => (
  <span className="react-tel-input flex !h-[14px] !w-5 shrink-0 items-center">
    <span
      aria-hidden="true"
      className={`flag ${countryCode.toLowerCase()} !m-0 !block`}
    />
  </span>
);

export default AddMemberForm;
