"use client";

import {
  engagementOverview,
  rewardDistribution,
  topEarningFans,
} from "@/mock/engagement";
import { UsersRound } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 0,
});

const EngagementOverviewPage = () => {
  const highestEarning = Math.max(...topEarningFans.map((fan) => fan.amount));

  const metrics = [
    {
      label: "Active fans",
      value: compactNumber.format(engagementOverview.activeFans),
    },
    {
      label: "Total Rewards Accrued",
      value: currency.format(engagementOverview.totalRewardsAccrued),
    },
    {
      label: "Total Payouts Processed",
      value: currency.format(engagementOverview.totalPayoutsProcessed),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1180px] space-y-8 pb-10">
      <header>
        <h1 className="text-[24px] font-medium leading-8 text-[#111810]">
          Engagement Overview
        </h1>
        <p className="mt-1 text-sm text-[#A4A4A4]">
          Monitor fan activity, rewards distribution, and platform health.
        </p>
      </header>

      <section className="grid gap-5 border-b border-[#EEEEEE] pb-7 sm:grid-cols-3">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={index === 0 ? "" : "sm:border-l sm:border-[#EEEEEE] sm:pl-5"}
          >
            <div className="flex items-center gap-1.5 text-sm text-[#6F6F6F]">
              <span>{metric.label}</span>
              <UsersRound className="h-4 w-4 text-[#F75803]" />
            </div>
            <p className="mt-1 text-[28px] font-medium leading-9 text-[#111810]">
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.85fr)]">
        <article className="rounded-lg border border-[#E4E4E4] bg-white p-5">
          <h2 className="mb-5 text-sm font-medium text-[#111810]">
            Top 10 Fans by earnings
          </h2>
          <div className="space-y-4">
            {topEarningFans.map((fan) => (
              <div
                key={fan.username}
                className="grid grid-cols-[110px_minmax(100px,1fr)_64px] items-center gap-4 text-xs"
              >
                <span className="truncate text-[#808080]">@{fan.username}</span>
                <div className="h-4 w-full overflow-hidden rounded bg-[#E4E4E4]">
                  <div
                    className="relative h-full rounded-l"
                    style={{
                      backgroundColor: fan.color,
                      width: `${Math.max(8, (fan.amount / highestEarning) * 100)}%`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          135deg,
                          transparent,
                          transparent 5px,
                          #FFFFFF 3px,
                          #FFFFFF 8px
                        )`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-right font-medium text-[#373737]">
                  {currency.format(fan.amount)}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#E4E4E4] bg-white p-5">
          <h2 className="text-sm font-medium text-[#111810]">
            Reward Distribution by Activity
          </h2>
          <div className="mx-auto h-[230px] max-w-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rewardDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="none"
                >
                  {rewardDistribution.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="divide-y divide-[#EEEEEE]">
            {rewardDistribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex items-center gap-2 text-[#808080]">
                  <span
                    className="h-4 w-1 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium text-[#111810]">{item.value}%</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
};

export default EngagementOverviewPage;
