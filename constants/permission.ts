// constants/navPermissions.ts

export const NAV_PERMISSIONS: Record<string, string> = {
  full_access: "full_access",
  Broadcast: "Broadcast",
  Users: "Members",
  Challenge: "Challenge",
  Campaign: "Invest (campaign)",
  "Invest (campaign)": "Invest (campaign)",
  Payments: "Payments",
  Performance: "Performance",
  Report: "Report",
  "Code Generator": "Code Generator",
  "Admin Setting": "Admin Setting",
  Investments: "Investments",
  Forum: "Forum",
  "Change Password": "Change Password",
  "Access Control": "Access Control",
  Overview: "Overview",
  "Sellers Store": "Sellers Store",
  Products: "Products",
  Events: "Events",
  Orders: "Orders",
  Payouts: "Payouts",
  Withdrawal: "Withdrawal",
  Hire: "Hire",
  Buyers: "Buyers",
  Wallet: "Wallet",
  Moderation: "Moderation",
};

export const LEGACY_NAV_PERMISSIONS: Record<string, string[]> = {
  "Invest (campaign)": ["Campaign"],
};
