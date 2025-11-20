"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMutation, useAction } from "convex/react";
import {
  Calendar,
  CreditCard,
  MapPin,
  FileText,
  Download,
  Sparkles,
  MessageCircle,
  Check,
  AlertTriangle,
  Clock,
  ChevronRight,
  Scissors,
  ShoppingBag
} from "lucide-react";
import { useEffect, useState, use } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PublicPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const portalData = useQuery(api.brides.getPortalData, { token });
  const confirmMeasurements = useMutation(api.brides.confirmMeasurements);
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const requestAppointment = useMutation(api.appointmentRequests.create);
  const triedOnItems = useQuery(api.inventory.getTriedOnByToken, { token }) || [];

  useEffect(() => {
    if (!portalData?.bride?.weddingDate) return;

    const calculateDays = () => {
      const weddingDate = new Date(portalData.bride.weddingDate).getTime();
      const now = new Date().getTime();
      const difference = weddingDate - now;
      const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
      setDaysRemaining(days);
    };

    calculateDays();
  }, [portalData?.bride?.weddingDate]);

  if (portalData === undefined) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-stone-200 border-t-stone-800 animate-spin" />
          <p className="font-serif text-lg text-stone-500 animate-pulse">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (portalData === null) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-stone-200/50">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-stone-400" />
          </div>
          <h1 className="text-3xl font-serif text-stone-900 mb-4">Access Expired</h1>
          <p className="text-stone-500 font-sans font-light leading-relaxed">
            This portal link is no longer active. Please contact the boutique for a new secure link.
          </p>
        </div>
      </div>
    );
  }

  const { bride, appointments, documents, settings, coverImageUrl, payments } = portalData;
  const remainingBalance = bride.totalPrice - bride.paidAmount;
  const progressPercent = Math.min(100, Math.max(5, (bride.paidAmount / bride.totalPrice) * 100));

  // Get brand color or default
  const brandColor = settings?.brandColor || "#1c1917"; // Default to stone-900
  const storeName = settings?.storeName || "Bridal Shop";
  const supportEmail = settings?.supportEmail || "shop@email.com";

  // Get next future appointment
  const now = new Date();
  const futureAppointments = appointments.filter(apt => new Date(apt.date) > now);
  const nextAppointment = futureAppointments.length > 0 ? futureAppointments[0] : null;

  // Status Logic
  const statusSteps = ["Onboarding", "Measurements", "In Progress", "Ready", "Completed"];
  const currentStepIndex = statusSteps.indexOf(bride.status) === -1 ? 0 : statusSteps.indexOf(bride.status);

  // Check if dress details exist
  const hasDressDetails = bride.dressDetails?.designer || bride.dressDetails?.styleNumber || bride.dressDetails?.size;

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await requestAppointment({
        token,
        requestedDate: formData.get("date") as string,
        requestedTime: formData.get("time") as string,
        type: formData.get("type") as string,
      });
      toast.success("Request sent! We'll be in touch shortly.");
    } catch {
      toast.error("Failed to send request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-800 font-sans selection:bg-stone-200">

      {/* IMMERSIVE HERO */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-stone-900/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF9] via-transparent to-transparent z-20" />

        <Image
          src={coverImageUrl || "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=2574&auto=format&fit=crop"}
          alt="Bridal Background"
          fill
          className="object-cover"
          sizes="100vw"
          priority
          unoptimized
        />

        <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-12 lg:p-20">
          {/* Top Bar */}
          <div className="flex justify-between items-start">
            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-sm">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-900">{storeName}</p>
            </div>
            <a
              href={`mailto:${supportEmail}`}
              className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-sm hover:bg-white transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-stone-900" />
            </a>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-medium tracking-wider uppercase">Your Bridal Journey</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[0.9] mb-8 drop-shadow-sm">
              Welcome, <br />
              <span className="italic font-light opacity-90">{bride.name.split(' ')[0]}</span>
            </h1>

            {/* Countdown */}
            <div className="flex items-end gap-4 text-white/90">
              <div>
                <p className="text-6xl md:text-7xl font-light tracking-tighter">{daysRemaining}</p>
              </div>
              <div className="pb-3 md:pb-4">
                <p className="text-sm md:text-base font-medium uppercase tracking-widest opacity-80">Days Until</p>
                <p className="text-lg md:text-xl font-serif italic">The Wedding</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 -mt-32 relative z-40">

        {/* JOURNEY TIMELINE */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-stone-200/50 mb-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-serif text-stone-900">Your Journey</h2>
            <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Step {currentStepIndex + 1} of {statusSteps.length}</span>
          </div>

          <div className="relative">
            {/* Progress Line Background */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step} className="relative flex md:flex-col items-center md:text-center gap-4 md:gap-6 group">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 relative z-10 bg-white",
                      isCurrent ? "border-stone-900 scale-110 shadow-lg" : isCompleted ? "border-stone-900" : "border-stone-200"
                    )}>
                      {isCompleted && !isCurrent ? (
                        <Check className="w-4 h-4 text-stone-900" />
                      ) : (
                        <span className={cn("text-sm font-bold", isCurrent ? "text-stone-900" : "text-stone-300")}>
                          {index + 1}
                        </span>
                      )}
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full border border-stone-900 animate-ping opacity-20" />
                      )}
                    </div>
                    <div className="flex-1 md:flex-none">
                      <p className={cn(
                        "text-sm font-medium uppercase tracking-widest transition-colors duration-300",
                        isCurrent ? "text-stone-900" : isCompleted ? "text-stone-600" : "text-stone-300"
                      )}>
                        {step}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-stone-500 mt-1 font-serif italic hidden md:block">Current Stage</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* NEXT APPOINTMENT CARD */}
            <div className="bg-stone-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-700" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-white/60 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">Next Appointment</span>
                  </div>

                  {nextAppointment ? (
                    <>
                      <h3 className="text-3xl md:text-4xl font-serif mb-2">
                        {new Date(nextAppointment.date).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h3>
                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{new Date(nextAppointment.date).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                        <span className="text-lg font-light opacity-60">|</span>
                        <span className="text-lg">{nextAppointment.type}</span>
                      </div>
                      {nextAppointment.notes && (
                        <p className="mt-4 text-white/60 text-sm max-w-md leading-relaxed">{nextAppointment.notes}</p>
                      )}
                    </>
                  ) : (
                    <div className="py-2">
                      <h3 className="text-2xl font-serif text-white/90 mb-2">No upcoming appointments</h3>
                      <p className="text-white/50 text-sm">Ready to schedule your next fitting?</p>
                    </div>
                  )}
                </div>

                {!nextAppointment && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="h-14 px-8 rounded-full bg-white text-stone-900 hover:bg-stone-100 font-medium tracking-wide transition-transform hover:scale-105">
                        Book Appointment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-stone-100">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-2xl">Request Appointment</DialogTitle>
                        <DialogDescription>
                          Select your preferred time for a fitting or consultation.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleRequestSubmit} className="grid gap-6 py-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select name="type" defaultValue="Fitting">
                            <SelectTrigger className="h-12 rounded-xl border-stone-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Fitting">Fitting</SelectItem>
                              <SelectItem value="Consultation">Consultation</SelectItem>
                              <SelectItem value="Pickup">Pickup</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input name="date" type="date" required min={new Date().toISOString().split('T')[0]} className="h-12 rounded-xl border-stone-200" />
                        </div>
                        <div className="space-y-2">
                          <Label>Time Preference</Label>
                          <Select name="time" defaultValue="Morning">
                            <SelectTrigger className="h-12 rounded-xl border-stone-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Morning">Morning (9am - 12pm)</SelectItem>
                              <SelectItem value="Afternoon">Afternoon (12pm - 4pm)</SelectItem>
                              <SelectItem value="Evening">Evening (4pm - 7pm)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="h-12 rounded-xl bg-stone-900 text-white hover:bg-stone-800">
                          Send Request
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DRESS DETAILS */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 flex flex-col">
                <div className="flex items-center gap-2 text-stone-400 mb-6">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-widest uppercase">My Dress</span>
                </div>

                {!hasDressDetails ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8 opacity-50">
                    <Sparkles className="w-8 h-8 mb-3 text-stone-300" />
                    <p className="text-sm font-serif italic">Details coming soon</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bride.dressDetails?.designer && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Designer</p>
                        <p className="text-xl font-serif text-stone-900">{bride.dressDetails.designer}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {bride.dressDetails?.styleNumber && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Style</p>
                          <p className="text-base font-medium text-stone-900">{bride.dressDetails.styleNumber}</p>
                        </div>
                      )}
                      {bride.dressDetails?.size && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Size</p>
                          <p className="text-base font-medium text-stone-900">{bride.dressDetails.size}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* TRIED ON HISTORY */}
              {triedOnItems.length > 0 && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 flex flex-col">
                  <div className="flex items-center gap-2 text-stone-400 mb-6">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">Tried On History</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {triedOnItems.map((item) => (
                      <div key={item._id} className="flex gap-4 p-4 rounded-xl border border-stone-100 bg-stone-50/50">
                        {/* Placeholder for image if we had one */}
                        <div className="w-16 h-20 bg-white rounded-lg border border-stone-100 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-6 h-6 text-stone-200" />
                        </div>
                        <div>
                          <p className="font-serif text-lg text-stone-900 leading-tight">{item.inventory?.name}</p>
                          <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">{item.inventory?.styleNumber}</p>
                          <div className="flex text-yellow-400 mt-2">
                            {Array.from({ length: item.rating || 0 }).map((_, i) => (
                              <span key={i} className="text-xs">★</span>
                            ))}
                          </div>
                          {item.notes && <p className="text-xs text-stone-500 mt-2 italic">"{item.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MEASUREMENTS */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Scissors className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">Measurements</span>
                  </div>
                  {bride.measurementsConfirmedAt && (
                    <span className="bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      Confirmed
                    </span>
                  )}
                </div>

                {bride.measurements ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      {bride.measurements.bust && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Bust</p>
                          <p className="text-xl font-serif text-stone-900">{bride.measurements.bust}&quot;</p>
                        </div>
                      )}
                      {bride.measurements.waist && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Waist</p>
                          <p className="text-xl font-serif text-stone-900">{bride.measurements.waist}&quot;</p>
                        </div>
                      )}
                      {bride.measurements.hips && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Hips</p>
                          <p className="text-xl font-serif text-stone-900">{bride.measurements.hips}&quot;</p>
                        </div>
                      )}
                      {bride.measurements.hollowToHem && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Hollow to Hem</p>
                          <p className="text-xl font-serif text-stone-900">{bride.measurements.hollowToHem}&quot;</p>
                        </div>
                      )}
                    </div>

                    {!bride.measurementsConfirmedAt && (
                      <div className="pt-4 border-t border-stone-100">
                        <button
                          onClick={async () => {
                            await confirmMeasurements({
                              token,
                              confirmedBy: navigator.userAgent,
                            });
                          }}
                          className="w-full py-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Confirm Measurements
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8 opacity-50">
                    <p className="text-sm font-serif italic">Pending fitting</p>
                  </div>
                )}
              </div>
            </div>

            {/* DOCUMENTS */}
            {documents.length > 0 && (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100">
                <div className="flex items-center gap-2 text-stone-400 mb-6">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-widest uppercase">Documents</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <a
                      key={doc._id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl border border-stone-100 hover:border-stone-300 hover:shadow-md transition-all group bg-stone-50/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-stone-900 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{doc.title}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-wider mt-0.5">PDF</p>
                      </div>
                      <Download className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (4 cols) - FINANCIALS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 h-full">
              <div className="flex items-center gap-2 text-stone-400 mb-8">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">Financials</span>
              </div>

              <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Remaining Balance</p>
                <p className="text-4xl font-serif text-stone-900">${remainingBalance.toLocaleString()}</p>
                <div className="w-full bg-stone-100 h-1.5 rounded-full mt-6 overflow-hidden">
                  <div
                    className="h-full bg-stone-900 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-stone-400">
                  <span>${bride.paidAmount.toLocaleString()} paid</span>
                  <span>${bride.totalPrice.toLocaleString()} total</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 mb-4">Payment Schedule</h3>
                <div className="relative pl-4 border-l border-stone-100 space-y-6">
                  {payments && payments.length > 0 ? (
                    payments.map((payment) => {
                      const isPaid = payment.status === "Paid";
                      const isOverdue = payment.status === "Overdue";

                      return (
                        <div key={payment._id} className="relative">
                          <div className={cn(
                            "absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white",
                            isPaid ? "border-stone-900 bg-stone-900" : isOverdue ? "border-red-400" : "border-stone-300"
                          )} />

                          <div className="flex justify-between items-start">
                            <div>
                              <p className={cn("text-sm font-medium", isPaid && "text-stone-400 line-through")}>
                                {payment.type}
                              </p>
                              <p className="text-xs text-stone-400 mt-0.5">
                                Due {new Date(payment.dueDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={cn("text-sm font-medium", isPaid && "text-stone-400 line-through")}>
                                ${payment.amount.toLocaleString()}
                              </p>
                              {payment.status === "Pending" && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const result = await createCheckoutSession({
                                        paymentId: payment._id,
                                        amount: payment.amount,
                                        title: `${payment.type} Payment`,
                                        brideEmail: bride.email,
                                        portalUrl: window.location.href,
                                      });
                                      if (result.url) window.location.href = result.url;
                                    } catch (error) {
                                      console.error(error);
                                      toast.error("Payment initialization failed");
                                    }
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-stone-900 hover:text-stone-600 underline mt-1"
                                >
                                  Pay Now
                                </button>
                              )}
                              {isOverdue && <span className="text-[10px] font-bold text-red-500 uppercase">Overdue</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-stone-400 italic">No scheduled payments</p>
                  )}
                </div>
              </div>

              {remainingBalance > 0 && bride.stripeLink && (
                <a
                  href={bride.stripeLink}
                  className="flex items-center justify-center w-full py-4 mt-8 rounded-xl bg-stone-900 text-white text-sm font-medium tracking-wide hover:bg-stone-800 transition-all shadow-lg shadow-stone-200/50"
                >
                  Make a Payment
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
