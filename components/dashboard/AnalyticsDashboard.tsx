"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MetricCard } from "./MetricCard";
import { Clock, DollarSign, UserX, TrendingUp, Calendar, AlertCircle } from "lucide-react";

export function AnalyticsDashboard() {
    const metrics = useQuery(api.analytics.getDashboardMetrics);

    if (!metrics) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-32 animate-pulse rounded-2xl bg-stone-100"
                    />
                ))}
            </div>
        );
    }

    // === COLLECTION RATE ===
    const collectionRateDisplay = `${metrics.collectionRate.toFixed(1)}%`;
    const isCollectionGood = metrics.collectionRate >= 70;
    const collectionComparison = metrics.collectionRateVsIndustry > 0
        ? `${metrics.collectionRateVsIndustry.toFixed(1)}% above industry`
        : metrics.collectionRateVsIndustry < 0
        ? `${Math.abs(metrics.collectionRateVsIndustry).toFixed(1)}% below industry`
        : "At industry average";

    // === PAYMENT SPEED ===
    const paymentSpeedValue = Math.abs(Math.round(metrics.avgPaymentSpeedDays));
    const paymentSpeedLabel = metrics.avgPaymentSpeedDays >= 0 ? "days early" : "days late";
    const isPaymentSpeedGood = metrics.avgPaymentSpeedDays >= 0;

    // === PICKUP TIME ===
    const pickupDays = metrics.avgPickupDays || 0;
    const pickupComparison = metrics.avgPickupDaysVsIndustry < 0
        ? `${Math.abs(metrics.avgPickupDaysVsIndustry)} days faster`
        : metrics.avgPickupDaysVsIndustry > 0
        ? `${metrics.avgPickupDaysVsIndustry} days slower`
        : "At industry average";

    // === NO-SHOW RATE ===
    const noShowRate = metrics.noShowRate;
    const isNoShowGood = metrics.noShowRate < 15;
    const noShowComparison = metrics.noShowRateVsIndustry < 0
        ? `${Math.abs(metrics.noShowRateVsIndustry).toFixed(1)}% better`
        : metrics.noShowRateVsIndustry > 0
        ? `${metrics.noShowRateVsIndustry.toFixed(1)}% worse`
        : "At industry average";

    return (
        <div className="space-y-6">
            {/* Main Performance Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Collection Rate"
                    value={collectionRateDisplay}
                    description={`${collectionComparison} (target: 75%)`}
                    icon={DollarSign}
                    trend={{
                        value: isCollectionGood ? "Excellent" : "Needs improvement",
                        isPositive: isCollectionGood,
                    }}
                />
                <MetricCard
                    title="Payment Speed"
                    value={`${paymentSpeedValue} ${paymentSpeedLabel}`}
                    description="Average payment timing"
                    icon={TrendingUp}
                    trend={{
                        value: isPaymentSpeedGood ? "Ahead of schedule" : "Behind schedule",
                        isPositive: isPaymentSpeedGood,
                    }}
                />
                <MetricCard
                    title="Time to Pickup"
                    value={pickupDays > 0 ? `${pickupDays} days` : "N/A"}
                    description={pickupDays > 0 ? pickupComparison : "No completed pickups yet"}
                    icon={Clock}
                />
                <MetricCard
                    title="No-Show Rate"
                    value={`${noShowRate.toFixed(1)}%`}
                    description={noShowComparison}
                    icon={UserX}
                    trend={{
                        value: isNoShowGood ? "Healthy" : "High",
                        isPositive: isNoShowGood,
                    }}
                />
            </div>

            {/* Additional Insights */}
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Upcoming Work */}
                <div className="bg-white border border-stone-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-stone-600" />
                        <h3 className="font-semibold text-stone-900">This Week</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-stone-600">Upcoming appointments</span>
                            <span className="text-lg font-bold text-stone-900">{metrics.upcomingAppointments}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-stone-600">Active brides</span>
                            <span className="text-lg font-bold text-stone-900">{metrics.activeBrides}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-stone-600">Total brides</span>
                            <span className="text-lg font-bold text-stone-900">{metrics.totalBrides}</span>
                        </div>
                    </div>
                </div>

                {/* Overdue Payments Alert */}
                <div className={`border rounded-lg p-6 ${
                    metrics.overduePayments > 0
                        ? "bg-red-50 border-red-200"
                        : "bg-green-50 border-green-200"
                }`}>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className={`w-5 h-5 ${
                            metrics.overduePayments > 0 ? "text-red-600" : "text-green-600"
                        }`} />
                        <h3 className="font-semibold text-stone-900">Payment Status</h3>
                    </div>
                    {metrics.overduePayments > 0 ? (
                        <div className="space-y-2">
                            <p className="text-2xl font-bold text-red-600">
                                {metrics.overduePayments} overdue
                            </p>
                            <p className="text-sm text-red-700">
                                ${metrics.totalOverdue.toLocaleString()} needs attention
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-2xl font-bold text-green-600">
                                All caught up!
                            </p>
                            <p className="text-sm text-green-700">
                                No overdue payments
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
