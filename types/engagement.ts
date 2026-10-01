export type FanStatus = "active" | "completed";

export interface EngagementFan {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  joinedAt: string;
  lastActive: string;
  totalMtd: number;
  allTime: number;
  status: FanStatus;
}

export interface FanActivity {
  id: string;
  activityType: string;
  timestamp: string;
  context: string;
  units: number;
  eligible: number;
  reward: number;
}

export interface RewardBreakdown {
  id: string;
  activityType: string;
  activities: number;
  eligibleActivities: number;
  rate: number;
  reward: number;
}

export interface PayoutHistory {
  id: string;
  reference: string;
  date: string;
  amount: number;
  status: "Completed" | "Processing" | "Failed";
}

export interface TopEarningFan {
  username: string;
  amount: number;
  color: string;
}

export interface RewardDistributionItem {
  name: string;
  value: number;
  color: string;
}

export type DecimalString = string;
export type SortOrder = "asc" | "desc";
export type FanSortField =
  | "current_month_earnings"
  | "all_time_earnings"
  | "last_active_at";
export type EngagementActivity =
  | "like"
  | "comment"
  | "forum_share"
  | "social_share"
  | "time_spent";
export type EligibilityStatus =
  | "pending"
  | "eligible"
  | "rejected"
  | "voided";
export type PayoutStatus = "processing" | "completed" | "failed";

export interface DateRangeRequest {
  start_date?: string;
  end_date?: string;
}

export interface ApiPagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface FanEngagementOverviewRequest extends DateRangeRequest {}

export interface FanEngagementOverviewResponse {
  error: boolean;
  message: string;
  overview: {
    currency: string;
    date_range: {
      start_date: string;
      end_date: string;
    };
    stats: {
      active_fans: number;
      total_rewards_accrued: DecimalString;
      total_payout_processed: DecimalString;
    };
    top_fans: Array<{
      username: string | null;
      reward_earnings: DecimalString;
    }>;
    reward_distribution: Array<{
      activity: EngagementActivity;
      percentage: number;
    }>;
  };
}

export interface FanDirectoryRequest {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: FanSortField;
  sort_order?: SortOrder;
}

export interface FanDirectoryItem {
  user_id: number;
  name: string | null;
  username: string | null;
  user_type: string;
  image: string | null;
  email: string;
  createdAt: string;
  last_active_at: string | null;
  current_month_earnings: DecimalString;
  all_time_earnings: DecimalString;
}

export interface FanDirectoryResponse {
  error: boolean;
  message: string;
  fans: ApiPagination & {
    currency: string;
    month: string;
    docs: FanDirectoryItem[];
  };
}

export interface FanActivityLogRequest extends DateRangeRequest {
  user_id: number;
  page?: number;
  per_page?: number;
  activity?: EngagementActivity;
  status?: EligibilityStatus;
}

export interface FanActivityLogItem {
  activity: EngagementActivity;
  time: string;
  units: number;
  unit_type: "actions" | "hours";
  eligible: number;
  eligibility_status: EligibilityStatus;
  reward: DecimalString;
}

export interface FanActivityLogResponse {
  error: boolean;
  message: string;
  activity_log: ApiPagination & {
    user_id: number;
    docs: FanActivityLogItem[];
  };
}

export interface FanRewardBreakdownRequest extends DateRangeRequest {
  user_id: number;
}

export interface RewardRateSegment {
  eligible_units: number;
  threshold_units: number;
  reward_amount: DecimalString;
  reward: DecimalString;
}

export interface FanRewardBreakdownItem {
  activity: EngagementActivity;
  eligible_units: number;
  unit_type: "actions" | "hours";
  reward: DecimalString;
  rate_segments: RewardRateSegment[];
}

export interface FanRewardBreakdownResponse {
  error: boolean;
  message: string;
  reward_breakdown: {
    user_id: number;
    currency: string;
    date_range: {
      start_date: string;
      end_date: string;
    };
    period_earnings: DecimalString;
    mtd_earnings: DecimalString;
    breakdown: FanRewardBreakdownItem[];
  };
}

export interface FanPayoutHistoryRequest extends DateRangeRequest {
  user_id: number;
  page?: number;
  per_page?: number;
  status?: PayoutStatus;
}

export interface FanPayoutHistoryItem {
  payout_id: number;
  settlement_month: string;
  period_start: string;
  period_end: string;
  amount: DecimalString;
  status: PayoutStatus;
  created_at: string;
  completed_at: string | null;
}

export interface FanPayoutHistoryResponse {
  error: boolean;
  message: string;
  payout_history: ApiPagination & {
    user_id: number;
    currency: string;
    stats: {
      total_paid_out: DecimalString;
      pending_payout: DecimalString;
      last_payout_date: string | null;
    };
    docs: FanPayoutHistoryItem[];
  };
}

