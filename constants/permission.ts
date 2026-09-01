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

export const OVERVIEW_ROUTE = "/overview";
export const CHANGE_PASSWORD_ROUTE = "/changepassword";

const KNOWN_PERMISSIONS = new Set(Object.values(NAV_PERMISSIONS));

const ROUTE_PERMISSIONS: Array<{
  prefix: string;
  feature: string;
}> = [
  { prefix: "/broadcast", feature: "Broadcast" },
  { prefix: "/members", feature: "Users" },
  { prefix: "/challenge", feature: "Challenge" },
  { prefix: "/campaign", feature: "Invest (campaign)" },
  { prefix: "/payments", feature: "Payments" },
  { prefix: "/performance", feature: "Performance" },
  { prefix: "/report", feature: "Report" },
  { prefix: "/evaluationreport", feature: "Report" },
  { prefix: "/codegenerator", feature: "Code Generator" },
  { prefix: "/adminsetting", feature: "Admin Setting" },
  { prefix: "/addadmin", feature: "Admin Setting" },
  { prefix: "/ad", feature: "Admin Setting" },
  { prefix: "/investments", feature: "Investments" },
  { prefix: "/forum", feature: "Forum" },
  { prefix: "/overview", feature: "Overview" },
  { prefix: "/sellersstore", feature: "Sellers Store" },
  { prefix: "/products", feature: "Products" },
  { prefix: "/events", feature: "Events" },
  { prefix: "/orders", feature: "Orders" },
  { prefix: "/payouts", feature: "Payouts" },
  { prefix: "/withdrawal", feature: "Withdrawal" },
  { prefix: "/hire", feature: "Hire" },
  { prefix: "/buyers", feature: "Buyers" },
  { prefix: "/moderation", feature: "Moderation" },
  { prefix: "/accesscontrol", feature: "Access Control" },
];

export const normalizePermissions = (features: unknown): string[] => {
  if (!Array.isArray(features)) {
    return [];
  }

  const normalized = features
    .filter((feature): feature is string => typeof feature === "string")
    .map((feature) => feature.trim())
    .filter(Boolean)
    .map((feature) => NAV_PERMISSIONS[feature] ?? feature)
    .filter((feature) => KNOWN_PERMISSIONS.has(feature));

  if (normalized.includes(NAV_PERMISSIONS.full_access)) {
    return Array.from(new Set(Object.values(NAV_PERMISSIONS)));
  }

  return Array.from(new Set(normalized));
};

export const hasPermission = (
  permissions: string[] = [],
  featureName: string,
) => {
  if (
    permissions.includes(NAV_PERMISSIONS.full_access) ||
    permissions.includes("full_access")
  ) {
    return true;
  }

  const requiredPermission = NAV_PERMISSIONS[featureName];
  if (!requiredPermission) {
    return false;
  }

  return [
    requiredPermission,
    ...(LEGACY_NAV_PERMISSIONS[featureName] ?? []),
  ].some((permission) => permissions.includes(permission));
};

export const getLandingRoute = (permissions: string[] = []) =>
  hasPermission(permissions, "Overview")
    ? OVERVIEW_ROUTE
    : CHANGE_PASSWORD_ROUTE;

export const getRequiredPermissionForPath = (
  pathname: string,
): string | null => {
  const normalizedPath = pathname.toLowerCase();
  const rule = ROUTE_PERMISSIONS.find(
    ({ prefix }) =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );

  return rule?.feature ?? null;
};

export const canAccessPath = (
  permissions: string[] = [],
  pathname: string,
) => {
  if (pathname.toLowerCase() === CHANGE_PASSWORD_ROUTE) {
    return true;
  }

  const requiredPermission = getRequiredPermissionForPath(pathname);
  return requiredPermission
    ? hasPermission(permissions, requiredPermission)
    : true;
};
