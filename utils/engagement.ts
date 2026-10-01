import { DecimalString, EngagementActivity } from "@/types/engagement";

interface RoundedDecimal {
  negative: boolean;
  whole: string;
  fraction: string;
}

const addOne = (value: string) => {
  const digits = value.split("");
  let carry = 1;

  for (let index = digits.length - 1; index >= 0 && carry; index -= 1) {
    const next = Number(digits[index]) + carry;
    digits[index] = String(next % 10);
    carry = next >= 10 ? 1 : 0;
  }

  return `${carry ? "1" : ""}${digits.join("")}`;
};

const roundDecimal = (value: DecimalString, scale: number): RoundedDecimal | null => {
  const match = value.trim().match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) return null;

  const [, sign, whole, rawFraction = ""] = match;
  const fraction = rawFraction.padEnd(scale + 1, "0");
  const keptFraction = fraction.slice(0, scale);
  const roundingDigit = Number(fraction[scale] || "0");
  let combined = `${whole}${keptFraction}`.replace(/^0+(?=\d)/, "");

  if (roundingDigit >= 5) combined = addOne(combined);
  combined = combined.padStart(scale + 1, "0");

  const roundedWhole =
    scale === 0 ? combined : combined.slice(0, Math.max(1, combined.length - scale));
  const roundedFraction = scale === 0 ? "" : combined.slice(-scale);
  const isZero = /^0+$/.test(`${roundedWhole}${roundedFraction}`);

  return {
    negative: sign === "-" && !isZero,
    whole: roundedWhole.replace(/^0+(?=\d)/, ""),
    fraction: roundedFraction,
  };
};

const withThousandsSeparators = (value: string) =>
  value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const getCurrencyPrefix = (currency: string) =>
  currency.toUpperCase() === "USD" ? "$" : `${currency.toUpperCase()} `;

export const formatDecimalCurrency = (
  value: DecimalString | null | undefined,
  currency = "USD",
  fractionDigits = 0,
) => {
  if (value === null || value === undefined) return "—";
  const rounded = roundDecimal(value, fractionDigits);
  if (!rounded) return "—";

  const fractionLabel =
    fractionDigits > 0 ? `.${rounded.fraction.padStart(fractionDigits, "0")}` : "";

  return `${rounded.negative ? "-" : ""}${getCurrencyPrefix(currency)}${withThousandsSeparators(
    rounded.whole,
  )}${fractionLabel}`;
};

export const formatCompactDecimalCurrency = (
  value: DecimalString | null | undefined,
  currency = "USD",
) => {
  if (value === null || value === undefined) return "—";
  const rounded = roundDecimal(value, 0);
  if (!rounded) return "—";

  const units = [
    { digits: 9, suffix: "B" },
    { digits: 6, suffix: "M" },
    { digits: 3, suffix: "K" },
  ];
  const unit = units.find((item) => rounded.whole.length > item.digits);

  if (!unit) return formatDecimalCurrency(value, currency, 0);

  const wholeLength = rounded.whole.length - unit.digits;
  const compactWhole = rounded.whole.slice(0, wholeLength);
  const decimal = rounded.whole[wholeLength] || "0";
  const compact = decimal === "0" ? compactWhole : `${compactWhole}.${decimal}`;

  return `${rounded.negative ? "-" : ""}${getCurrencyPrefix(currency)}${compact}${unit.suffix}`;
};

export const decimalToChartValue = (
  value: DecimalString | null | undefined,
) => {
  if (value === null || value === undefined || !/^-?\d+(?:\.\d+)?$/.test(value)) {
    return null;
  }

  const chartValue = Number.parseFloat(value);
  return Number.isFinite(chartValue) ? chartValue : null;
};

export const formatUtcDateInput = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getInclusiveUtcDateRange = (days: number) => {
  const end = new Date();
  const start = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() - Math.max(0, days - 1));

  return {
    start_date: formatUtcDateInput(start),
    end_date: formatUtcDateInput(end),
  };
};

export const engagementActivityLabels: Record<EngagementActivity, string> = {
  like: "Likes",
  comment: "Comments",
  forum_share: "Shares-Forum",
  social_share: "Shares-Social",
  time_spent: "Time Spent",
};
