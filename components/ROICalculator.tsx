"use client";

import { useState } from "react";
import { DollarSign, Clock, TrendingUp } from "lucide-react";

export function ROICalculator() {
  const [bridesPerMonth, setBridesPerMonth] = useState(10);
  const [hoursPerBride, setHoursPerBride] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(50);

  // Calculate savings
  const timeSavedPerBride = hoursPerBride * 0.6; // Bridal OS saves ~60% of admin time
  const totalTimeSavedPerMonth = timeSavedPerBride * bridesPerMonth;
  const moneySavedPerMonth = totalTimeSavedPerMonth * hourlyRate;
  const yearlyROI = moneySavedPerMonth * 12 - 49 * 12; // $49/month plan

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-rose-50">
          Calculate your ROI
        </h3>
        <p className="mt-2 text-rose-100">
          See how much time and money Bridal OS saves your boutique
        </p>
      </div>

      <div className="space-y-6">
        {/* Input: Brides per month */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-rose-100">
            How many brides do you serve per month?
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={bridesPerMonth}
            onChange={(e) => setBridesPerMonth(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-sm text-rose-200">
            <span>5</span>
            <span className="font-bold text-rose-50">{bridesPerMonth} brides</span>
            <span>50</span>
          </div>
        </div>

        {/* Input: Hours per bride */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-rose-100">
            How many hours do you spend on admin per bride?
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={hoursPerBride}
            onChange={(e) => setHoursPerBride(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-sm text-rose-200">
            <span>1h</span>
            <span className="font-bold text-rose-50">{hoursPerBride} hours</span>
            <span>10h</span>
          </div>
        </div>

        {/* Input: Hourly value */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-rose-100">
            What's your time worth per hour?
          </label>
          <input
            type="range"
            min="25"
            max="150"
            step="25"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-sm text-rose-200">
            <span>$25</span>
            <span className="font-bold text-rose-50">${hourlyRate}/hour</span>
            <span>$150</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <Clock className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <p className="text-sm text-emerald-200">Time saved per month</p>
            <p className="text-2xl font-bold text-emerald-50">
              {totalTimeSavedPerMonth.toFixed(1)} hours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <DollarSign className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <p className="text-sm text-emerald-200">Money saved per month</p>
            <p className="text-2xl font-bold text-emerald-50">
              ${moneySavedPerMonth.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <p className="text-sm text-emerald-200">Yearly ROI</p>
            <p className="text-2xl font-bold text-emerald-50">
              ${yearlyROI.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-rose-200">
        Based on industry averages, Bridal OS reduces admin time by ~60%
      </p>
    </div>
  );
}
