import { authenticatedFetch } from "@/lib/authenticatedApi";
import {
  FanActivityLogRequest,
  FanActivityLogResponse,
  FanDirectoryRequest,
  FanDirectoryResponse,
  FanEngagementOverviewRequest,
  FanEngagementOverviewResponse,
  FanPayoutHistoryRequest,
  FanPayoutHistoryResponse,
  FanRewardBreakdownRequest,
  FanRewardBreakdownResponse,
} from "@/types/engagement";

const API_BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
const FAN_ENGAGEMENT_PATH = "/admin/analytics/fan-engagement";

interface ApiErrorPayload {
  error?: boolean;
  message?: string;
  errors?: Array<{
    path?: string;
    msg?: string;
  }>;
}

export class FanEngagementApiError extends Error {
  status: number;
  fieldErrors: ApiErrorPayload["errors"];

  constructor(status: number, payload?: ApiErrorPayload) {
    super(payload?.message || "Unable to load fan engagement data");
    this.name = "FanEngagementApiError";
    this.status = status;
    this.fieldErrors = payload?.errors;
  }
}

const postFanEngagement = async <TResponse>(
  path: string,
  body: object,
  signal?: AbortSignal,
): Promise<TResponse> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}${FAN_ENGAGEMENT_PATH}${path}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | (TResponse & ApiErrorPayload)
    | null;

  if (!response.ok || payload?.error || !payload) {
    throw new FanEngagementApiError(response.status, payload ?? undefined);
  }

  return payload;
};

export const fetchFanEngagementOverview = (
  request: FanEngagementOverviewRequest,
  signal?: AbortSignal,
) =>
  postFanEngagement<FanEngagementOverviewResponse>(
    "/overview",
    request,
    signal,
  );

export const fetchFanDirectory = (
  request: FanDirectoryRequest,
  signal?: AbortSignal,
) => postFanEngagement<FanDirectoryResponse>("/fans", request, signal);

export const fetchFanActivityLog = (
  request: FanActivityLogRequest,
  signal?: AbortSignal,
) =>
  postFanEngagement<FanActivityLogResponse>(
    "/fans/activity-log",
    request,
    signal,
  );

export const fetchFanRewardBreakdown = (
  request: FanRewardBreakdownRequest,
  signal?: AbortSignal,
) =>
  postFanEngagement<FanRewardBreakdownResponse>(
    "/fans/reward-breakdown",
    request,
    signal,
  );

export const fetchFanPayoutHistory = (
  request: FanPayoutHistoryRequest,
  signal?: AbortSignal,
) =>
  postFanEngagement<FanPayoutHistoryResponse>(
    "/fans/payout-history",
    request,
    signal,
  );

export const getFanEngagementErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Unable to load fan engagement data";
