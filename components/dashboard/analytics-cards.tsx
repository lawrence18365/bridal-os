"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  vsIndustry?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  valueColor?: string;
}

export function AnalyticsCard({
  title,
  value,
  subtitle,
  vsIndustry,
  trend,
  icon,
  valueColor = "text-stone-900",
}: AnalyticsCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-stone-400";
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const formatVsIndustry = (diff: number) => {
    const absDiff = Math.abs(diff);
    const sign = diff > 0 ? "+" : "";
    return `${sign}${absDiff.toFixed(1)}`;
  };

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className="text-stone-400">{icon}</div>}
          <p className="text-sm font-medium text-stone-600">{title}</p>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
        {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}

        {vsIndustry !== undefined && vsIndustry !== 0 && (
          <div className="pt-2 border-t border-stone-100 mt-3">
            <p className={`text-xs font-medium ${vsIndustry > 0 ? "text-green-600" : "text-red-600"}`}>
              {formatVsIndustry(vsIndustry)} vs industry avg
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
  comparison?: string;
  comparisonType?: "good" | "bad" | "neutral";
}

export function MetricRow({ label, value, comparison, comparisonType = "neutral" }: MetricRowProps) {
  const getComparisonColor = () => {
    if (comparisonType === "good") return "text-green-600 bg-green-50";
    if (comparisonType === "bad") return "text-red-600 bg-red-50";
    return "text-stone-600 bg-stone-50";
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
      <span className="text-sm text-stone-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-stone-900">{value}</span>
        {comparison && (
          <span className={`text-xs font-medium px-2 py-1 rounded ${getComparisonColor()}`}>
            {comparison}
          </span>
        )}
      </div>
    </div>
  );
}
