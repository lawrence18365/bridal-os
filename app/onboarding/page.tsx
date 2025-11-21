"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Check,
  Sparkles,
  User,
  Mail,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const createBride = useMutation(api.brides.create);
  const createSampleData = useMutation(api.sampleData.createSampleData);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    weddingDate: "",
    totalPrice: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.weddingDate || !formData.totalPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      await createBride({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        weddingDate: formData.weddingDate,
        totalPrice: parseFloat(formData.totalPrice),
      });

      setStep(3); // Move to success step
    } catch (error) {
      toast.error("Failed to add bride. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await createSampleData();
      toast.success("Sample data added to help you explore!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 3) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50/30">
      <Toaster position="top-right" richColors />

      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-rose-50">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-stone-900">
                Bridal OS
              </span>
            </div>
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full bg-stone-900 transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-stone-600">
              Step {step} of 3
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <Check className="h-4 w-4" />
                Welcome to Bridal OS
              </div>
              <h1 className="text-4xl font-bold text-stone-900 md:text-5xl">
                Let&apos;s get you started
              </h1>
              <p className="mt-4 text-xl text-stone-600">
                We&apos;ll add your first bride so you can see how Bridal OS works.
                This takes about 2 minutes.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                    <span className="font-bold text-rose-700">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">
                      Add your first bride
                    </h3>
                    <p className="text-stone-600">
                      Enter basic info to create a bride profile and portal
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                    <span className="font-bold text-rose-700">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">
                      See the magic
                    </h3>
                    <p className="text-stone-600">
                      We&apos;ll show you what gets created automatically
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                    <span className="font-bold text-rose-700">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">
                      Explore your dashboard
                    </h3>
                    <p className="text-stone-600">
                      Tour your command center and start using Bridal OS
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  onClick={handleContinue}
                  className="flex-1 h-12 bg-stone-900 hover:bg-stone-800 text-white"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="px-6"
                >
                  Skip for now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Add First Bride */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
                <User className="h-4 w-4" />
                Add your first bride
              </div>
              <h1 className="text-4xl font-bold text-stone-900 md:text-5xl">
                Let&apos;s create a bride profile
              </h1>
              <p className="mt-4 text-xl text-stone-600">
                Enter her details below. You can always update this later.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-stone-700">
                    Bride&apos;s Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      id="name"
                      placeholder="e.g. Sarah Johnson"
                      className="pl-10 h-12 bg-stone-50 border-stone-200"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-stone-700">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="sarah@example.com"
                      className="pl-10 h-12 bg-stone-50 border-stone-200"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Phone (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-stone-700">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="h-12 bg-stone-50 border-stone-200"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Wedding Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold text-stone-700">
                      Wedding Date *
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10 h-12 bg-stone-50 border-stone-200"
                        value={formData.weddingDate}
                        onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Dress Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold text-stone-700">
                      Dress Price *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="2500"
                        className="pl-10 h-12 bg-stone-50 border-stone-200"
                        value={formData.totalPrice}
                        onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-stone-900 hover:bg-stone-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Bride Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleSkip}
                  variant="outline"
                  className="px-6"
                >
                  Skip
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-10 w-10 text-emerald-600" />
              </div>
              <h1 className="text-4xl font-bold text-stone-900 md:text-5xl">
                You&apos;re all set!
              </h1>
              <p className="mt-4 text-xl text-stone-600">
                Here&apos;s what we just created for {formData.name}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
                  <Check className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-stone-900">
                      Bride profile created
                    </p>
                    <p className="text-sm text-stone-600">
                      All her details are saved in your dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
                  <Check className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-stone-900">
                      Personal portal generated
                    </p>
                    <p className="text-sm text-stone-600">
                      She can track her dress journey anytime
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
                  <Check className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-stone-900">
                      Welcome email sent
                    </p>
                    <p className="text-sm text-stone-600">
                      She&apos;ll receive a link to her portal
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <h3 className="mb-4 font-semibold text-stone-900">
                  What&apos;s next?
                </h3>
                <div className="space-y-3 text-sm text-stone-700">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>Schedule her first fitting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>Upload her contract or invoice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>Set up her payment plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>Add dress details and measurements</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                className="mt-6 w-full h-12 bg-stone-900 hover:bg-stone-800 text-white"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
