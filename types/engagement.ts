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
  status: "Completed" | "Processing";
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

