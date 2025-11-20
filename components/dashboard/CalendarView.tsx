"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface Appointment {
    _id: Id<"appointments">;
    _creationTime: number;
    date: string;
    type: string;
    status: string;
    brideId: Id<"brides">;
    reminderSent?: boolean;
}

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"day" | "week">("day");

    // Fetch appointments
    // Note: In a real app, we'd filter by date range on the backend.
    // For now, fetching all and filtering client-side is fine for low volume.
    const appointments = useQuery(api.appointments.getAllAppointments) || [];

    const handlePrev = () => {
        if (view === "day") {
            setCurrentDate((prev) => addDays(prev, -1));
        } else {
            setCurrentDate((prev) => subWeeks(prev, 1));
        }
    };

    const handleNext = () => {
        if (view === "day") {
            setCurrentDate((prev) => addDays(prev, 1));
        } else {
            setCurrentDate((prev) => addWeeks(prev, 1));
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Filter appointments for the current view
    const filteredAppointments = appointments.filter((appt: Appointment) => {
        const apptDate = new Date(appt.date);
        if (view === "day") {
            return isSameDay(apptDate, currentDate);
        } else {
            const start = startOfWeek(currentDate, { weekStartsOn: 0 });
            const end = addDays(start, 7);
            return apptDate >= start && apptDate < end;
        }
    });

    return (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-serif font-medium text-stone-900">
                        {view === "day"
                            ? format(currentDate, "EEEE, MMMM d, yyyy")
                            : `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`}
                    </h2>
                    <div className="flex items-center bg-white rounded-lg border border-stone-200 p-1 shadow-sm">
                        <button
                            onClick={() => setView("day")}
                            className={cn(
                                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                view === "day"
                                    ? "bg-stone-900 text-white"
                                    : "text-stone-600 hover:bg-stone-100"
                            )}
                        >
                            Day
                        </button>
                        <button
                            onClick={() => setView("week")}
                            className={cn(
                                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                                view === "week"
                                    ? "bg-stone-900 text-white"
                                    : "text-stone-600 hover:bg-stone-100"
                            )}
                        >
                            Week
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToday}
                        className="px-3 py-1.5 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                        Today
                    </button>
                    <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5">
                        <button
                            onClick={handlePrev}
                            className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="min-h-[600px] bg-white relative">
                {view === "day" ? (
                    <DayView currentDate={currentDate} appointments={filteredAppointments} />
                ) : (
                    <WeekView currentDate={currentDate} appointments={filteredAppointments} />
                )}
            </div>
        </div>
    );
}

function DayView({ currentDate, appointments }: { currentDate: Date; appointments: Appointment[] }) {
    // Generate hours from 9 AM to 6 PM
    const hours = Array.from({ length: 10 }, (_, i) => i + 9);

    return (
        <div className="flex h-full">
            {/* Time Column */}
            <div className="w-16 flex-shrink-0 border-r border-stone-100 bg-stone-50/30">
                {hours.map((hour) => (
                    <div key={hour} className="h-24 border-b border-stone-100 text-xs text-stone-400 font-medium p-2 text-right">
                        {hour > 12 ? hour - 12 : hour} {hour >= 12 ? "PM" : "AM"}
                    </div>
                ))}
            </div>

            {/* Appointments Column */}
            <div className="flex-1 relative">
                {/* Grid Lines */}
                {hours.map((hour) => (
                    <div key={hour} className="h-24 border-b border-stone-50" />
                ))}

                {/* Appointment Cards */}
                {appointments.map((appt) => {
                    const date = new Date(appt.date);
                    const startHour = date.getHours();
                    const startMinute = date.getMinutes();

                    // Calculate position
                    // 9 AM is 0px. Each hour is 96px (h-24).
                    const top = (startHour - 9) * 96 + (startMinute / 60) * 96;
                    // Default duration 90 mins if not specified
                    const duration = 90;
                    const height = (duration / 60) * 96;

                    return (
                        <div
                            key={appt._id}
                            className={cn(
                                "absolute left-2 right-2 rounded-lg border p-3 shadow-sm transition-all hover:shadow-md cursor-pointer",
                                appt.status === "Confirmed" ? "bg-emerald-50 border-emerald-200 text-emerald-900" :
                                    appt.status === "Completed" ? "bg-stone-100 border-stone-200 text-stone-600" :
                                        appt.status === "Cancelled" ? "bg-red-50 border-red-200 text-red-900 opacity-60" :
                                            "bg-blue-50 border-blue-200 text-blue-900"
                            )}
                            style={{ top: `${top}px`, height: `${height}px` }}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-semibold text-sm flex items-center gap-2">
                                        {format(date, "h:mm a")}
                                        <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                                        {appt.type}
                                    </div>
                                    <div className="text-xs opacity-80 mt-1 font-medium">
                                        {/* We'd fetch bride name here if we had it joined, for now assuming we might need to fetch or it's in the object */}
                                        Bride ID: {appt.brideId.slice(0, 8)}...
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                    appt.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
                                        appt.status === "Completed" ? "bg-stone-200 text-stone-600" :
                                            appt.status === "Cancelled" ? "bg-red-100 text-red-700" :
                                                "bg-blue-100 text-blue-700"
                                )}>
                                    {appt.status}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function WeekView({ currentDate, appointments }: { currentDate: Date; appointments: Appointment[] }) {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const hours = Array.from({ length: 10 }, (_, i) => i + 9);

    return (
        <div className="flex flex-col h-full overflow-x-auto">
            {/* Header */}
            <div className="flex border-b border-stone-200 bg-stone-50/50">
                <div className="w-12 flex-shrink-0 border-r border-stone-200" />
                {days.map((day) => (
                    <div key={day.toString()} className="flex-1 min-w-[120px] p-2 text-center border-r border-stone-100 last:border-r-0">
                        <div className="text-xs font-medium text-stone-500 uppercase">{format(day, "EEE")}</div>
                        <div className={cn(
                            "text-sm font-bold mt-0.5 w-8 h-8 flex items-center justify-center mx-auto rounded-full",
                            isSameDay(day, new Date()) ? "bg-stone-900 text-white" : "text-stone-900"
                        )}>
                            {format(day, "d")}
                        </div>
                    </div>
                ))}
            </div>

            {/* Body */}
            <div className="flex flex-1">
                {/* Time Column */}
                <div className="w-12 flex-shrink-0 border-r border-stone-200 bg-stone-50/30">
                    {hours.map((hour) => (
                        <div key={hour} className="h-20 border-b border-stone-100 text-[10px] text-stone-400 font-medium p-1 text-center">
                            {hour > 12 ? hour - 12 : hour}{hour >= 12 ? "p" : "a"}
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                {days.map((day) => {
                    const dayAppointments = appointments.filter(a => isSameDay(new Date(a.date), day));
                    return (
                        <div key={day.toString()} className="flex-1 min-w-[120px] border-r border-stone-100 last:border-r-0 relative bg-white">
                            {hours.map((hour) => (
                                <div key={hour} className="h-20 border-b border-stone-50" />
                            ))}

                            {dayAppointments.map((appt) => {
                                const date = new Date(appt.date);
                                const startHour = date.getHours();
                                const startMinute = date.getMinutes();
                                const top = (startHour - 9) * 80 + (startMinute / 60) * 80; // h-20 is 80px
                                const duration = 90;
                                const height = (duration / 60) * 80;

                                return (
                                    <div
                                        key={appt._id}
                                        className={cn(
                                            "absolute left-1 right-1 rounded-md border p-1.5 text-xs shadow-sm overflow-hidden hover:z-10 hover:shadow-md transition-all cursor-pointer",
                                            appt.status === "Confirmed" ? "bg-emerald-50 border-emerald-200 text-emerald-900" :
                                                appt.status === "Completed" ? "bg-stone-100 border-stone-200 text-stone-600" :
                                                    appt.status === "Cancelled" ? "bg-red-50 border-red-200 text-red-900 opacity-60" :
                                                        "bg-blue-50 border-blue-200 text-blue-900"
                                        )}
                                        style={{ top: `${top}px`, height: `${height}px` }}
                                    >
                                        <div className="font-bold truncate">{format(date, "h:mm a")}</div>
                                        <div className="truncate opacity-90">{appt.type}</div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
