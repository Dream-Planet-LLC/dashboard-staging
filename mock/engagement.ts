import {
  EngagementFan,
  FanActivity,
  PayoutHistory,
  RewardBreakdown,
  RewardDistributionItem,
  TopEarningFan,
} from "@/types/engagement";

const fanSeeds = [
  ["Alex Rivera", "nightowl_alex"],
  ["Maya Chen", "cosmic_babe"],
  ["Jordan Okafor", "star_gazer"],
  ["Sam Williams", "digital_wave"],
  ["Taylor Brooks", "cyber_punk"],
  ["Noah Mensah", "noah_creates"],
  ["Ava Thompson", "ava_thompson"],
  ["Ethan Bello", "ethan_b"],
  ["Isabella Reed", "izzy_reed"],
  ["Liam Morgan", "liam_morgan"],
  ["Sophia Adeyemi", "sophia_a"],
  ["Lucas Martin", "lucas_live"],
  ["Amelia Clark", "amelia_c"],
  ["Elijah James", "elijah_j"],
  ["Harper Lewis", "harper_l"],
  ["Mateo Wilson", "mateo_w"],
  ["Evelyn Harris", "eve_harris"],
  ["Daniel King", "daniel_k"],
  ["Luna Scott", "luna_scott"],
  ["Henry Adams", "henry_a"],
  ["Camila Baker", "camila_b"],
  ["Sebastian Green", "seb_green"],
  ["Mia Nelson", "mia_nelson"],
  ["Jack Carter", "jack_carter"],
  ["Zoe Mitchell", "zoe_m"],
  ["Leo Roberts", "leo_roberts"],
  ["Nora Turner", "nora_turner"],
] as const;

export const engagementFans: EngagementFan[] = fanSeeds.map(
  ([name, username], index): EngagementFan => ({
    id: `fan-${String(index + 1).padStart(3, "0")}`,
    name,
    username,
    email: `${username}@email.com`,
    avatar: `https://i.pravatar.cc/96?img=${index + 12}`,
    joinedAt: new Date(Date.UTC(2025, (index * 2) % 12, (index % 24) + 1)).toISOString(),
    lastActive: new Date(Date.UTC(2026, 0, 19 - (index % 14))).toISOString(),
    totalMtd: 33 + ((index * 137) % 3200),
    allTime: 13567 + index * 1879,
    status: index % 8 === 7 ? "completed" : "active",
  }),
);

export const engagementOverview = {
  activeFans: 232000,
  totalRewardsAccrued: 148230,
  totalPayoutsProcessed: 132500,
};

export const topEarningFans: TopEarningFan[] = [
  { username: "nightowl_alex", amount: 3420, color: "#4F6EF7" },
  { username: "cosmic_babe", amount: 2980, color: "#F06421" },
  { username: "star_gazer", amount: 2450, color: "#2BAC62" },
  { username: "digital_wave", amount: 2100, color: "#D63B32" },
  { username: "cyber_punk", amount: 1850, color: "#164B98" },
  { username: "noah_creates", amount: 1735, color: "#A43D0A" },
  { username: "ava_thompson", amount: 1610, color: "#9D55E5" },
  { username: "ethan_b", amount: 1540, color: "#D99A0A" },
  { username: "izzy_reed", amount: 1475, color: "#2AA88C" },
  { username: "liam_morgan", amount: 1390, color: "#E83783" },
];

export const rewardDistribution: RewardDistributionItem[] = [
  { name: "Likes", value: 34, color: "#28A95B" },
  { name: "Comments", value: 22, color: "#D99A0A" },
  { name: "Shares-Forum", value: 18, color: "#F06421" },
  { name: "Shares-Social", value: 14, color: "#3F6EE8" },
  { name: "Time Spent", value: 12, color: "#064B9B" },
];

const activityTypes = ["Like", "Comment", "Share-Forum", "Share-Social", "Time Spent"];

const getFanIndex = (fanId: string) =>
  Math.max(0, engagementFans.findIndex((fan) => fan.id === fanId));

export const getFanActivities = (fanId: string): FanActivity[] => {
  const fanIndex = getFanIndex(fanId);

  return Array.from({ length: 42 }, (_, index) => ({
    id: `${fanId}-activity-${index + 1}`,
    activityType: activityTypes[index % activityTypes.length],
    timestamp: new Date(
      Date.UTC(2026, 0, 19 - Math.floor(index / 5), 14 - (index % 8), (index * 7) % 60),
    ).toISOString(),
    context: `dream-planet.forum/p/${1200 + fanIndex * 50 + index}`,
    units: (index % 4) + 1,
    eligible: index % 6 === 0 ? 0 : 1,
    reward: index % 5 === 0 ? 2 : 8 + ((index + fanIndex) % 6) * 5,
  }));
};

export const getRewardBreakdown = (fanId: string): RewardBreakdown[] => {
  const fanIndex = getFanIndex(fanId);

  return Array.from({ length: 28 }, (_, index) => {
    const activities = 5 + ((index * 3 + fanIndex) % 24);
    const eligibleActivities = Math.max(0, activities - (index % 4));
    const rate = [2, 5, 8, 10, 12][index % 5];

    return {
      id: `${fanId}-reward-${index + 1}`,
      activityType: activityTypes[index % activityTypes.length],
      activities,
      eligibleActivities,
      rate,
      reward: eligibleActivities * rate,
    };
  });
};

export const getPayoutHistory = (fanId: string): PayoutHistory[] => {
  const fanIndex = getFanIndex(fanId);

  return Array.from({ length: 24 }, (_, index) => ({
    id: `${fanId}-payout-${index + 1}`,
    reference: `DP-${2026000 + fanIndex * 100 + index + 1}`,
    date: new Date(Date.UTC(2026, 0, 18 - index)).toISOString(),
    amount: 35 + ((index * 27 + fanIndex * 11) % 480),
    status: index % 5 === 0 ? "Processing" : "Completed",
  }));
};

