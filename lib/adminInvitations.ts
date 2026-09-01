const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

export type InvitationFailureReason =
  | "expired"
  | "invalid"
  | "used"
  | "unknown";

export interface AcceptAdminInvitationPayload {
  token: string;
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  phone_number: string;
  password: string;
}

interface ApiEnvelope<T> {
  error?: boolean;
  code?: number | string;
  message?: string;
  data?: T | { response?: T };
  response?: T;
}

export class AdminInvitationError extends Error {
  reason: InvitationFailureReason;

  constructor(message: string, reason: InvitationFailureReason = "unknown") {
    super(message);
    this.name = "AdminInvitationError";
    this.reason = reason;
  }
}

const getFailureReason = (
  status: number,
  code?: number | string,
  message?: string,
): InvitationFailureReason => {
  const description = `${code ?? ""} ${message ?? ""}`.toLowerCase();

  if (status === 410 || description.includes("expir")) return "expired";
  if (
    status === 409 ||
    description.includes("used") ||
    description.includes("completed")
  ) {
    return "used";
  }
  if (status === 400 || status === 404 || description.includes("invalid")) {
    return "invalid";
  }

  return "unknown";
};

const readJson = async <T>(response: Response): Promise<ApiEnvelope<T>> => {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return {};
  }
};

const throwRequestError = (
  response: Response,
  envelope: ApiEnvelope<unknown>,
) => {
  const message = envelope.message || "Unable to process this invitation.";
  throw new AdminInvitationError(
    message,
    getFailureReason(response.status, envelope.code, message),
  );
};

export const acceptAdminInvitation = async (
  payload: AcceptAdminInvitationPayload,
): Promise<string> => {
  const response = await fetch(
    `${API_BASE_URL}/admin-settings/accept-admin-invitation`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const envelope = await readJson<unknown>(response);

  if (!response.ok || envelope.error) {
    throwRequestError(response, envelope);
  }

  return envelope.message || "Your admin profile was submitted successfully.";
};
