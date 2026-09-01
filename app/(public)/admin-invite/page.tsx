"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import PhoneInput, { CountryData as PhoneCountryData } from "react-phone-input-2";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AdminInvitationError,
  acceptAdminInvitation,
} from "@/lib/adminInvitations";
import { cn } from "@/lib/utils";
import { countries as countryData } from "@/utils/interface";

type CountryOption = (typeof countryData)[number];

const availableCountries = countryData.filter(
  (country) => country.code && country.dial_code,
);

type PageStatus =
  | "ready"
  | "invalid"
  | "expired"
  | "used"
  | "error"
  | "success";

type FieldName =
  | "firstName"
  | "lastName"
  | "country"
  | "phoneNumber"
  | "password"
  | "confirmPassword";

interface FormValues {
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const initialFormValues: FormValues = {
  firstName: "",
  lastName: "",
  country: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

const allFields: FieldName[] = [
  "firstName",
  "lastName",
  "country",
  "phoneNumber",
  "password",
  "confirmPassword",
];

const getFormErrors = (
  values: FormValues,
  phoneCountry: CountryOption | null,
): Partial<Record<FieldName, string>> => {
  const errors: Partial<Record<FieldName, string>> = {};
  const phonePattern = /^[0-9]{7,15}$/;

  if (values.firstName.trim().length < 2) {
    errors.firstName = "Enter at least 2 characters.";
  }
  if (values.lastName.trim().length < 2) {
    errors.lastName = "Enter at least 2 characters.";
  }
  if (!values.country) {
    errors.country = "Select your country.";
  }
  if (!phoneCountry || !phonePattern.test(values.phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }
  if (
    values.password.length < 8 ||
    !/[a-z]/.test(values.password) ||
    !/[A-Z]/.test(values.password) ||
    !/[0-9]/.test(values.password)
  ) {
    errors.password =
      "Use 8+ characters with uppercase, lowercase, and a number.";
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};

const invitationStateCopy: Record<
  Exclude<PageStatus, "ready" | "success">,
  { title: string; description: string }
> = {
  invalid: {
    title: "Invitation not found",
    description:
      "This invitation link is invalid. Ask the super admin to send you a new one.",
  },
  expired: {
    title: "Invitation expired",
    description:
      "This invitation was valid for 30 minutes. Ask the super admin to send it again.",
  },
  used: {
    title: "Invitation already used",
    description:
      "This invitation has already been completed. Contact the super admin if you need help.",
  },
  error: {
    title: "We could not check your invitation",
    description:
      "There was a problem connecting to DreamPlanet. Check your connection and try again.",
  },
};

const AdminInvitationPageContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const emailFromQuery = searchParams.get("email")?.trim().toLowerCase() || "";
  const isPreview =
    process.env.NODE_ENV === "development" && token === "preview";
  const [status, setStatus] = useState<PageStatus>("ready");
  const [values, setValues] = useState<FormValues>(initialFormValues);
  const [phoneCountry, setPhoneCountry] = useState<CountryOption | null>(
    availableCountries.find((country) => country.code === "NG") || null,
  );
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const formErrors = useMemo(
    () => getFormErrors(values, phoneCountry),
    [phoneCountry, values],
  );
  const canSubmit = Object.keys(formErrors).length === 0;

  const updateValue = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSubmitError("");
  };

  const markTouched = (field: FieldName) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!canSubmit) {
      setTouched(
        allFields.reduce<Partial<Record<FieldName, boolean>>>(
          (result, field) => {
            result[field] = true;
            return result;
          },
          {},
        ),
      );
      toast.error("Please correct the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (isPreview) {
        toast.success("Your admin profile was submitted successfully.");
        setStatus("success");
        return;
      }

      if (!token || !emailFromQuery) {
        toast.error("This invitation link is invalid or incomplete.");
        setStatus("invalid");
        return;
      }

      const message = await acceptAdminInvitation({
        token,
        email: emailFromQuery,
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        country: values.country,
        phone_number: `+${values.phoneNumber.replace(/\D/g, "")}`,
        password: values.password,
      });
      toast.success(message);
      setStatus("success");
    } catch (error) {
      if (error instanceof AdminInvitationError) {
        toast.error(error.message);
        if (["invalid", "expired", "used"].includes(error.reason)) {
          setStatus(error.reason as "invalid" | "expired" | "used");
        } else {
          setSubmitError(error.message);
        }
      } else {
        const message = "We could not submit your request. Please try again.";
        toast.error(message);
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (field: FieldName) =>
    touched[field] && formErrors[field] ? (
      <p className="text-xs text-red-600" role="alert">
        {formErrors[field]}
      </p>
    ) : null;

  if (status === "success") {
    return (
      <InvitationShell>
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0E8] text-[#F75803]">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="font-Recoleta text-2xl font-medium text-[#111810]">
            Request submitted
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#6F6F6F]">
            Your profile is complete and has been sent to the super admin for
            approval. You will be able to sign in after your request is
            accepted.
          </p>
        </div>
      </InvitationShell>
    );
  }

  if (status !== "ready") {
    const copy = invitationStateCopy[status];
    return (
      <InvitationShell>
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </span>
          <h1 className="font-Recoleta text-2xl font-medium text-[#111810]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#6F6F6F]">
            {copy.description}
          </p>
          {status === "error" ? (
            <Button
              type="button"
              className="btnColored mt-6"
              onClick={() => {
                setStatus("ready");
                setSubmitError("");
              }}
            >
              Back to form
            </Button>
          ) : null}
        </div>
      </InvitationShell>
    );
  }

  return (
    <InvitationShell>
      <div className="border-b border-[#ECECEC] px-5 py-6 sm:px-8">
        <h1 className="font-Recoleta text-2xl font-medium text-[#111810]">
          Complete your admin profile
        </h1>
        <p className="mt-2 text-sm leading-5 text-[#808080]">
          Enter your details to submit your account for approval.
        </p>
      </div>

      <form
        className="space-y-5 px-5 py-7 sm:px-8"
        onSubmit={submitForm}
        noValidate
      >
        <div className="grid gap-2 rounded-lg bg-[#F8F8F8] p-4">
          <Label htmlFor="invitedEmail" className="text-xs text-[#808080]">
            Email address
          </Label>
          <Input
            id="invitedEmail"
            type="email"
            value={emailFromQuery}
            placeholder="Email address was not included in the link"
            readOnly
            aria-readonly="true"
            className="h-10 border-[#E2E2E2] bg-white text-[#111810] focus-visible:ring-0"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="First name"
            htmlFor="firstName"
            error={renderFieldError("firstName")}
          >
            <Input
              id="firstName"
              autoComplete="given-name"
              placeholder="Enter first name"
              value={values.firstName}
              onBlur={() => markTouched("firstName")}
              onChange={(event) => updateValue("firstName", event.target.value)}
              aria-invalid={Boolean(touched.firstName && formErrors.firstName)}
              className="h-11 border-[#C8C8C8] placeholder:text-[#A4A4A4] focus-visible:ring-[#F75803]"
            />
          </FormField>

          <FormField
            label="Last name"
            htmlFor="lastName"
            error={renderFieldError("lastName")}
          >
            <Input
              id="lastName"
              autoComplete="family-name"
              placeholder="Enter last name"
              value={values.lastName}
              onBlur={() => markTouched("lastName")}
              onChange={(event) => updateValue("lastName", event.target.value)}
              aria-invalid={Boolean(touched.lastName && formErrors.lastName)}
              className="h-11 border-[#C8C8C8] placeholder:text-[#A4A4A4] focus-visible:ring-[#F75803]"
            />
          </FormField>
        </div>

        <FormField
          label="Country"
          htmlFor="country"
          error={renderFieldError("country")}
        >
          <CountryPicker
            id="country"
            value={
              availableCountries.find(
                (country) => country.name === values.country,
              ) || null
            }
            onChange={(country) => {
              updateValue("country", country.name);
              markTouched("country");
            }}
            invalid={Boolean(touched.country && formErrors.country)}
          />
        </FormField>

        <FormField
          label="Phone number"
          htmlFor="phoneNumber"
          error={renderFieldError("phoneNumber")}
        >
          <PhoneInput
            country={phoneCountry?.code.toLowerCase()}
            value={values.phoneNumber}
            enableSearch
            autocompleteSearch
            countryCodeEditable={false}
            searchPlaceholder="Search country or code..."
            placeholder="Enter phone number"
            preferredCountries={["ng", "gb", "us"]}
            onBlur={() => markTouched("phoneNumber")}
            onChange={(phone, country) => {
              updateValue("phoneNumber", phone);

              const phoneData = country as PhoneCountryData;
              if (phoneData.countryCode) {
                const matchedCountry = availableCountries.find(
                  (item) =>
                    item.code.toLowerCase() === phoneData.countryCode.toLowerCase(),
                );
                if (matchedCountry) setPhoneCountry(matchedCountry);
              }
            }}
            inputProps={{
              id: "phoneNumber",
              name: "phoneNumber",
              autoComplete: "tel",
              "aria-invalid": Boolean(
                touched.phoneNumber && formErrors.phoneNumber,
              ),
            }}
            containerClass={cn(
              "invite-phone-input",
              touched.phoneNumber && formErrors.phoneNumber &&
                "invite-phone-input-error",
            )}
          />
        </FormField>

       
          <FormField
            label="Password"
            htmlFor="password"
            error={renderFieldError("password")}
          >
            <PasswordInput
              id="password"
              value={values.password}
              visible={showPassword}
              onToggle={() => setShowPassword((current) => !current)}
              onBlur={() => markTouched("password")}
              onChange={(value) => updateValue("password", value)}
              autoComplete="new-password"
              invalid={Boolean(touched.password && formErrors.password)}
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="confirmPassword"
            error={renderFieldError("confirmPassword")}
          >
            <PasswordInput
              id="confirmPassword"
              value={values.confirmPassword}
              visible={showConfirmation}
              onToggle={() => setShowConfirmation((current) => !current)}
              onBlur={() => markTouched("confirmPassword")}
              onChange={(value) => updateValue("confirmPassword", value)}
              autoComplete="new-password"
              invalid={Boolean(
                touched.confirmPassword && formErrors.confirmPassword,
              )}
            />
          </FormField>
       

        {submitError ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {submitError}
          </div>
        ) : null}

        <Button
          type="submit"
          className={`${canSubmit ? "btnColored" : "btnColoredInactive"} h-11 w-full`}
          disabled={!canSubmit || isSubmitting}
          loading={isSubmitting}
        >
          Submit request
        </Button>
      </form>
    </InvitationShell>
  );
};

const InvitationShell = ({ children }: { children: React.ReactNode }) => (
  <main className="flex min-h-screen items-center justify-center bg-[#F7F7F7] bg-[url('/pattern.svg')] bg-cover bg-center px-4 py-10 INT400">
    <div className="w-full max-w-[620px]">
      <div className="mb-6 flex justify-center">
        <Image
          src="/DASHBOARDASSETS/LOGO/SIGNUP LOGO.svg"
          alt="DreamPlanet"
          width={170}
          height={48}
          priority
        />
      </div>
      <section className="overflow-hidden rounded-xl border border-[#E8E8E8] border-t-8 border-t-[#547AFF] bg-white shadow-md">
        {children}
      </section>
    </div>
  </main>
);

const FormField = ({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="grid gap-2">
    <Label htmlFor={htmlFor} className="INT500 text-sm text-[#10002E]">
      {label}
    </Label>
    {children}
    {error}
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
}) => (
  <CountryCombobox
    id={id}
    value={value}
    onChange={onChange}
    invalid={invalid}
  />
);

const CountryCombobox = ({
  id,
  value,
  onChange,
  invalid = false,
}: {
  id?: string;
  value: CountryOption | null;
  onChange: (country: CountryOption) => void;
  invalid?: boolean;
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

const PasswordInput = ({
  id,
  value,
  visible,
  onToggle,
  onChange,
  onBlur,
  autoComplete,
  invalid,
}: {
  id: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  autoComplete: string;
  invalid: boolean;
}) => (
  <div className="relative">
    <Input
      id={id}
      type={visible ? "text" : "password"}
      value={value}
      autoComplete={autoComplete}
      placeholder={id === "password" ? "Create password" : "Repeat password"}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid}
      className="h-11 border-[#C8C8C8] pr-11 placeholder:text-[#A4A4A4] focus-visible:ring-[#F75803]"
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#808080]"
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
);

const AdminInvitationPage = () => (
  <Suspense
    fallback={
      <InvitationShell>
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#F75803]" />
          <p className="INT500 text-[#111810]">Loading invitation form...</p>
        </div>
      </InvitationShell>
    }
  >
    <AdminInvitationPageContent />
  </Suspense>
);

export default AdminInvitationPage;
