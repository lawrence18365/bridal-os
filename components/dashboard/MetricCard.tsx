import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
}

export function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: MetricCardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/80 bg-gradient-to-br from-white to-rose-50 p-5 shadow-md shadow-rose-100/70 backdrop-blur",
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-stone-500">
                        {title}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-3xl font-serif text-stone-900">{value}</p>
                        {trend && (
                            <span
                                className={cn(
                                    "text-xs font-medium",
                                    trend.isPositive ? "text-emerald-600" : "text-rose-600"
                                )}
                            >
                                {trend.value}
                            </span>
                        )}
                    </div>
                </div>
                {Icon && (
                    <div className="rounded-full bg-rose-100/50 p-2 text-rose-600">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </div>
            {description && (
                <p className="mt-2 text-sm text-stone-600">{description}</p>
            )}
        </div>
    );
}
