import {
  ForumIcon,
  AccountSetupIcon,
  BroadCastIcon,
  GeneratorIcon,
  InvestmentIcon,
  MemberIcon,
  PaymentIcon,
  PerformanceIcon,
  ReportIcon,
  CampaignIcon,
  AccessControlIcon,
  ChangePasswordIcon,
  ChallengeIcon,
  ModerationIcon,
  ProductsIcon,
  EventsIcon,
  OrdersIcon,
  PayoutsIcon,
  HireIcon,
  BuyersIcon,
  OverviewIcon,
  SellersStoreIcon,
  WithdrawalIcon,

} from "@/components/icons";

const userPermission:string[] = []

export const NavLinks = [
  {
    name: "Broadcast",
    icon: <BroadCastIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/broadcast",
    accordion: false,
    show: userPermission.includes("can-view-broadcast")
  },
  {
    name: "Users",
    icon: <MemberIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/members",
    accordion: false,
  },
  {
    name: "Challenge",
    icon: <ChallengeIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/challenge",
    accordion: false,
  },
  {
    name: "Invest (campaign)",
    icon: <CampaignIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/campaign",
    accordion: false,
  },
  {
    name: "Payments",
    icon: <PaymentIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/payments",
    accordion: true,
    sublink: [
      {
        title: "Subscription fee",
        href: "/payments/subscription",
      },
      {
        title: "Payment history",
        href: "/payments/paymenthistory",
      },
    ],
  },
  {
    name: "Performance",
    icon: <PerformanceIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/performance",
    accordion: true,
    sublink: [
      {
        title: "User Analytics",
        href: "/performance/useranalytics",
      },
      {
        title: "Forum Analytics",
        href: "/performance/analytics",
      },
    ],
  },
  {
    name: "Report",
    icon: <ReportIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/report",
    accordion: true,
    sublink: [
      {
        title: "Report Overview",
        href: "/report/overview",
      },
      {
        title: "Submitted Report",
        href: "/report/submitted",
      },
    ],
  },
  {
    name: "Code Generator",
    icon: <GeneratorIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/codegenerator",
    accordion: false,
  },
  {
    name: "Admin Setting",
    icon: <AccountSetupIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/adminsetting",
    accordion: false,

  },
  {
    name: "Investments",
    icon: <InvestmentIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/investments",
    accordion: false,
  },
  {
    name: "Forum",
    icon: <ForumIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/forum",
    accordion: false,
  },
    {
    name: "Overview",
    icon: <OverviewIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/overview",
    accordion: false,
  },
    {
    name: "Sellers Store",
    icon: <SellersStoreIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/sellersstore",
    accordion: false,
  },

  {
    name: "Products",
    icon: <ProductsIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/products",
    accordion: true,
    sublink: [
      {
        title: "Products catalogue",
        href: "/products/catalogue",
      },
      {
        title: "Featured Products",
        href: "/products/featuredproducts",
      },
    ],
  },

    {
    name: "Events",
    icon: <EventsIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/events",
    accordion: false,
  },

    {
    name: "Orders",
    icon: <OrdersIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/orders",
    accordion: false,
  },

    {
    name: "Payouts",
    icon: <PayoutsIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/payouts",
    accordion: false,
  },

  {
    name: "Withdrawal",
    icon: <WithdrawalIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/withdrawal",
    accordion: false,
  },

    {
    name: "Hire",
    icon: <HireIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/hire",
    accordion: false,
  },

  {
    name: "Buyers",
    icon: <BuyersIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/buyers",
    accordion: true,
    sublink: [
      {
        title: "Insight Overview",
        href: "/buyers/overview",
      },
      {
        title: "Purchase Preferences",
        href: "/buyers/preferences",
      },
    ],
  },

  //   {
  //   name: "Wallet",
  //   icon: <ForumIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
  //   href: "/wallet",
  //   accordion: false,
  // },

  {
    name: "Moderation",
    icon: <ModerationIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/moderation",
    accordion: false,
  },
  {
    name: "Engagement Overview",
    label: "Overview",
    permission: "full_access",
    section: "engagement",
    icon: <PerformanceIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/engagement/overview",
    accordion: false,
  },
  {
    name: "Engagement Fans",
    label: "Fans",
    permission: "full_access",
    section: "engagement",
    icon: <SellersStoreIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/engagement/fans",
    accordion: false,
  },
  {
    name: "Change Password",
    icon: <ChangePasswordIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/changepassword",
    accordion: false,
  },
  {
    name: "Access Control",
    icon: <AccessControlIcon className="mr-2 h-7 w-4" pathColor="#808080" />,
    href: "/accesscontrol",
    accordion: true,
    sublink: [
      {
        title: "Access Mangagement",
        href: "/accesscontrol/management",
      },
      {
        title: "Foul Words",
        href: "/accesscontrol/foulwords",
      },
      {
        title: "Foul Post",
        href: "/accesscontrol/foulpost",
      },
    ],
  },
];
