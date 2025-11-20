"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, Authenticated } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { AddBrideModal } from "@/components/dashboard/AddBrideModal";
import { TriedOnSection } from "@/components/dashboard/TriedOnSection";
import { FileUploader } from "@/components/dashboard/file-uploader";
import Link from "next/link";
import {
  Plus,
  Copy,
  Check,
  Edit,
  Search,
  Calendar,
  Sparkles,
  Trash2,
  Send,
  Upload,
  FileText,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Id } from "@/convex/_generated/dataModel";
import { toast, Toaster } from "sonner";

// Enhanced Bride Type with Tier 1 features
type Bride = {
  _id: Id<"brides">;
  name: string;
  email: string;
  phoneNumber?: string;
  weddingDate: string;
  status: string;
  totalPrice: number;
  paidAmount: number;
  stripeLink?: string;
  token: string;
  measurements?: {
    bust?: number;
    waist?: number;
    hips?: number;
    hem?: number;
    hollowToHem?: number;
  };
  dressDetails?: {
    designer?: string;
    styleNumber?: string;
    size?: string;
    color?: string;
  };
};

type Appointment = {
  _id: Id<"appointments">;
  brideId: Id<"brides">;
  date: string;
  type: string;
  notes?: string;
  status: string;
};

type Document = {
  _id: Id<"documents">;
  brideId: Id<"brides">;
  title: string;
  url?: string;
  storageId?: Id<"_storage">;
  type: string;
  uploadedAt?: number;
  visibleToBride: boolean;
};

// Component to handle document download/view
function DocumentDownloadButton({ doc }: { doc: Document }) {
  const fileUrl = useQuery(
    api.files.getFileUrl,
    doc.storageId ? { storageId: doc.storageId } : "skip"
  );

  const handleDownload = () => {
    const url = doc.storageId ? fileUrl : doc.url;
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={doc.storageId && !fileUrl}
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
    >
      <Download className="w-4 h-4" />
    </Button>
  );
}

export default function DashboardPage() {
  // HOOKS
  const brides = useQuery(api.brides.list);
  const createBride = useMutation(api.brides.create);
  const updateBride = useMutation(api.brides.update);
  const updateMeasurements = useMutation(api.brides.updateMeasurements);
  const updateDressDetails = useMutation(api.brides.updateDressDetails);
  const addAppointment = useMutation(api.brides.addAppointment);
  const deleteAppointment = useMutation(api.brides.deleteAppointment);
  const addDocument = useMutation(api.brides.addDocument);
  const updateDocument = useMutation(api.brides.updateDocument);
  const deleteDocument = useMutation(api.brides.deleteDocument);
  const bulkImportBrides = useMutation(api.import.bulkImportBrides);
  const addPayment = useMutation(api.payments.addPayment);
  const updatePayment = useMutation(api.payments.updatePayment);
  const deletePayment = useMutation(api.payments.deletePayment);

  // Alterations
  const addAlteration = useMutation(api.alterations.addAlteration);
  const updateAlteration = useMutation(api.alterations.updateAlteration);
  const deleteAlteration = useMutation(api.alterations.deleteAlteration);

  // Appointment Requests
  const pendingRequests = useQuery(api.appointmentRequests.listPending);
  const approveRequest = useMutation(api.appointmentRequests.approve);
  const rejectRequest = useMutation(api.appointmentRequests.reject);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [selectedBride, setSelectedBride] = useState<Bride | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [workflowFilter, setWorkflowFilter] = useState<
    "all" | "attention" | "payments" | "fittings"
  >("all");

  // Fetch appointments and documents for selected bride
  const appointments = useQuery(
    api.brides.getAppointments,
    selectedBride ? { brideId: selectedBride._id } : "skip"
  );

  const documents = useQuery(
    api.brides.getDocuments,
    selectedBride ? { brideId: selectedBride._id } : "skip"
  );

  const alterations = useQuery(
    api.alterations.getAlterations,
    selectedBride ? { brideId: selectedBride._id } : "skip"
  );

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    weddingDate: "",
    status: "",
    totalPrice: "",
    paidAmount: "",
    stripeLink: "",
  });

  const [measurementsData, setMeasurementsData] = useState({
    bust: "",
    waist: "",
    hips: "",
    hem: "",
    hollowToHem: "",
  });

  const [dressData, setDressData] = useState({
    designer: "",
    styleNumber: "",
    size: "",
    color: "",
  });

  const [newAppointment, setNewAppointment] = useState({
    date: "",
    type: "Fitting",
    notes: "",
  });

  const [newDocument, setNewDocument] = useState({
    title: "",
    url: "",
    type: "Contract",
  });

  const [newAlteration, setNewAlteration] = useState({
    description: "",
    cost: "",
    status: "Scheduled",
    scheduledDate: "",
    notes: "",
    seamstress: "",
  });

  // Check availability for new appointment (must be before any conditional logic)
  const availability = useQuery(
    api.appointments.checkAvailability,
    newAppointment.date
      ? {
          date: new Date(newAppointment.date).toISOString(),
          duration: 90,
        }
      : "skip"
  );

  // Filter logic
  const filteredBrides = useMemo(() => {
    if (!brides) return [];

    let filtered = brides;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((bride) =>
        bride.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bride.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply workflow filter
    switch (workflowFilter) {
      case "attention":
        // Brides with 'Onboarding' status or no future appointments
        filtered = filtered.filter((bride) => bride.status === "Onboarding");
        break;
      case "payments":
        // Brides where paidAmount < totalPrice
        filtered = filtered.filter((bride) => bride.paidAmount < bride.totalPrice);
        break;
      case "fittings":
        // Mock logic for now - could be based on appointment dates
        // For now, show brides in "Measurements" or "In Progress" status
        filtered = filtered.filter(
          (bride) =>
            bride.status === "Measurements" || bride.status === "In Progress"
        );
        break;
      case "all":
      default:
        // Show all active (non-completed) brides
        filtered = filtered.filter((bride) => bride.status !== "Completed");
        break;
    }

    return filtered;
  }, [brides, searchQuery, workflowFilter]);

  // Calculate workflow filter counts
  const workflowCounts = useMemo(() => {
    if (!brides) return { all: 0, attention: 0, payments: 0, fittings: 0 };
    return {
      all: brides.filter((b) => b.status !== "Completed").length,
      attention: brides.filter((b) => b.status === "Onboarding").length,
      payments: brides.filter((b) => b.paidAmount < b.totalPrice).length,
      fittings: brides.filter(
        (b) => b.status === "Measurements" || b.status === "In Progress"
      ).length,
    };
  }, [brides]);

  // LOADING GUARD
  if (brides === undefined || brides === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-rose-50">
        <div className="text-center animate-pulse">
          <p className="text-stone-400 font-serif text-lg mb-2">Bridal OS</p>
          <p className="text-stone-600">Loading your boutique...</p>
        </div>
      </div>
    );
  }

  const activeBrides = brides.filter((b) => b.status !== "Completed");
  const totalRevenue = brides.reduce((acc, b) => acc + b.totalPrice, 0);
  const totalCollected = brides.reduce((acc, b) => acc + b.paidAmount, 0);
  const collectionRate = totalRevenue
    ? Math.round((totalCollected / totalRevenue) * 100)
    : 0;
  const avgBalance = activeBrides.length
    ? Math.round(
      activeBrides.reduce(
        (acc, b) => acc + (b.totalPrice - b.paidAmount),
        0
      ) / activeBrides.length
    )
    : 0;
  const upcomingRequests = pendingRequests?.length || 0;
  const upcomingAppointments = appointments?.filter(a => new Date(a.date) > new Date()).length || 0;

  const onboardingCount = brides.filter((b) => b.status === "Onboarding").length;
  const fittingCount = brides.filter(
    (b) => b.status === "Measurements" || b.status === "In Progress"
  ).length;
  const filterChips = [
    { key: "all" as const, label: "Active", helper: `${workflowCounts.all} in motion` },
    { key: "attention" as const, label: "Needs consult", helper: `${onboardingCount} onboarding` },
    { key: "payments" as const, label: "Balance due", helper: `${workflowCounts.payments} owing` },
    { key: "fittings" as const, label: "In fittings", helper: `${fittingCount} in progress` },
  ];

  // HANDLERS


  const handleEditClick = (bride: Bride) => {
    setSelectedBride(bride);
    setEditFormData({
      name: bride.name,
      email: bride.email,
      weddingDate: bride.weddingDate,
      status: bride.status,
      totalPrice: bride.totalPrice.toString(),
      paidAmount: bride.paidAmount.toString(),
      stripeLink: bride.stripeLink || "",
    });
    setMeasurementsData({
      bust: bride.measurements?.bust?.toString() || "",
      waist: bride.measurements?.waist?.toString() || "",
      hips: bride.measurements?.hips?.toString() || "",
      hem: bride.measurements?.hem?.toString() || "",
      hollowToHem: bride.measurements?.hollowToHem?.toString() || "",
    });
    setDressData({
      designer: bride.dressDetails?.designer || "",
      styleNumber: bride.dressDetails?.styleNumber || "",
      size: bride.dressDetails?.size || "",
      color: bride.dressDetails?.color || "",
    });
    setActiveTab("overview");
    setShowEditSheet(true);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBride) return;

    // Update basic info
    await updateBride({
      id: selectedBride._id,
      status: editFormData.status,
      totalPrice: parseFloat(editFormData.totalPrice),
      paidAmount: parseFloat(editFormData.paidAmount),
      stripeLink: editFormData.stripeLink || undefined,
    });

    // Update measurements
    await updateMeasurements({
      brideId: selectedBride._id,
      measurements: {
        bust: measurementsData.bust ? parseFloat(measurementsData.bust) : undefined,
        waist: measurementsData.waist ? parseFloat(measurementsData.waist) : undefined,
        hips: measurementsData.hips ? parseFloat(measurementsData.hips) : undefined,
        hem: measurementsData.hem ? parseFloat(measurementsData.hem) : undefined,
        hollowToHem: measurementsData.hollowToHem
          ? parseFloat(measurementsData.hollowToHem)
          : undefined,
      },
    });

    // Update dress details
    await updateDressDetails({
      brideId: selectedBride._id,
      dressDetails: {
        designer: dressData.designer || undefined,
        styleNumber: dressData.styleNumber || undefined,
        size: dressData.size || undefined,
        color: dressData.color || undefined,
      },
    });

    toast.success("Changes saved successfully");
    setShowEditSheet(false);
    setSelectedBride(null);
  };

  // THE ROBOT ASSISTANT: Save & Notify Bride
  const handleSaveAndNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBride) return;

    // Save all changes first
    await updateBride({
      id: selectedBride._id,
      status: editFormData.status,
      totalPrice: parseFloat(editFormData.totalPrice),
      paidAmount: parseFloat(editFormData.paidAmount),
      stripeLink: editFormData.stripeLink || undefined,
    });

    await updateMeasurements({
      brideId: selectedBride._id,
      measurements: {
        bust: measurementsData.bust ? parseFloat(measurementsData.bust) : undefined,
        waist: measurementsData.waist ? parseFloat(measurementsData.waist) : undefined,
        hips: measurementsData.hips ? parseFloat(measurementsData.hips) : undefined,
        hem: measurementsData.hem ? parseFloat(measurementsData.hem) : undefined,
        hollowToHem: measurementsData.hollowToHem
          ? parseFloat(measurementsData.hollowToHem)
          : undefined,
      },
    });

    await updateDressDetails({
      brideId: selectedBride._id,
      dressDetails: {
        designer: dressData.designer || undefined,
        styleNumber: dressData.styleNumber || undefined,
        size: dressData.size || undefined,
        color: dressData.color || undefined,
      },
    });

    // Simulate sending email notification
    toast.success(
      `📧 Email sent to ${selectedBride.name}: "Your dress is ${editFormData.status}! Click here to view your portal."`,
      {
        duration: 5000,
      }
    );

    setShowEditSheet(false);
    setSelectedBride(null);
  };

  const handleAddAppointment = async () => {
    if (!selectedBride || !newAppointment.date) return;

    await addAppointment({
      brideId: selectedBride._id,
      date: newAppointment.date,
      type: newAppointment.type,
      notes: newAppointment.notes || undefined,
    });

    setNewAppointment({ date: "", type: "Fitting", notes: "" });
    toast.success("Appointment added");
  };

  const handleDeleteAppointment = async (id: Id<"appointments">) => {
    await deleteAppointment({ id });
    toast.success("Appointment deleted");
  };

  const handleAddDocument = async () => {
    if (!selectedBride || !newDocument.title || !newDocument.url) {
      toast.error("Please fill in all document fields");
      return;
    }

    await addDocument({
      brideId: selectedBride._id,
      title: newDocument.title,
      url: newDocument.url,
      type: newDocument.type,
      visibleToBride: false, // Default to hidden
    });

    setNewDocument({ title: "", url: "", type: "Contract" });
    toast.success("Document uploaded");
  };

  const handleToggleVisibility = async (doc: Document) => {
    await updateDocument({
      id: doc._id,
      visibleToBride: !doc.visibleToBride,
    });
    toast.success(
      doc.visibleToBride
        ? "Document hidden from bride"
        : "Document now visible to bride"
    );
  };

  const handleDeleteDocument = async (id: Id<"documents">) => {
    await deleteDocument({ id });
    toast.success("Document deleted");
  };

  const handleAddAlteration = async () => {
    if (!selectedBride || !newAlteration.description) {
      toast.error("Please fill in alteration details");
      return;
    }
    await addAlteration({
      brideId: selectedBride._id,
      description: newAlteration.description,
      cost: newAlteration.cost ? parseFloat(newAlteration.cost) : undefined,
      status: newAlteration.status,
      scheduledDate: newAlteration.scheduledDate || undefined,
      notes: newAlteration.notes || undefined,
      seamstress: newAlteration.seamstress || undefined,
    });
    setNewAlteration({
      description: "",
      cost: "",
      status: "Scheduled",
      scheduledDate: "",
      notes: "",
      seamstress: "",
    });
    toast.success("Alteration added");
  };

  const handleUpdateAlterationStatus = async (id: Id<"alterations">, status: string) => {
    await updateAlteration({
      id,
      status,
      completedDate: status === "Complete" ? new Date().toISOString() : undefined,
    });
    toast.success("Status updated");
  };

  const handleDeleteAlteration = async (id: Id<"alterations">) => {
    await deleteAlteration({ id });
    toast.success("Alteration deleted");
  };

  const copyPortalLink = (token: string) => {
    const link = `${window.location.origin}/p/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
    toast.success("Portal link copied to clipboard");
  };

  const getStatusColor = (
    status: string,
    paidAmount: number,
    totalPrice: number
  ) => {
    if (status === "Ready for Pickup" || status === "Completed") {
      return "bg-rose-50 text-rose-700 border-rose-100";
    }
    if (status === "Onboarding") {
      return "bg-stone-100 text-stone-700 border-stone-200";
    }
    if (paidAmount < totalPrice) {
      return "bg-rose-50 text-rose-700 border-rose-100";
    }
    return "bg-stone-100 text-stone-600 border-stone-200";
  };

  // Get next step for a bride
  const getNextStep = (bride: Bride) => {
    if (bride.status === "Onboarding") return "Needs Initial Consult";
    if (bride.status === "Measurements") return "Schedule Fitting";
    if (bride.status === "In Progress") return "Next Fitting";
    if (bride.status === "Ready for Pickup") return "Ready";
    if (bride.status === "Completed") return "Complete";
    return "In Progress";
  };

  // RENDER
  return (
    <Authenticated>
      <Toaster position="top-right" richColors />
      <div className="relative min-h-screen bg-[#FDF6F9] font-sans text-stone-900">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl" />
          <div className="absolute right-6 top-20 h-64 w-64 rounded-full bg-rose-100/60 blur-3xl" />
          <div className="absolute left-1/2 bottom-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white/80 blur-3xl" />
        </div>

        {/* HEADER */}
        <div className="sticky top-0 z-20 border-b border-white/70 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-lg font-serif text-rose-50 shadow-lg shadow-rose-200/60">
                B
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
                  Bridal OS
                </p>
                <p className="text-sm text-stone-500">
                  Calm ops for modern bridal houses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-8 md:pt-12">
          <div className="mb-10 grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 px-6 py-7 text-rose-50 shadow-2xl shadow-rose-200/50 md:px-8 md:py-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/20 blur-2xl" />
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-100">
                Pulse
              </div>
              <h1 className="mt-6 text-3xl leading-tight md:text-4xl">
                Calm control for every bride journey
              </h1>
              <p className="mt-3 text-rose-100/90">
                Orchestrate fittings, invoices, and portal moments so your team feels steady and brides feel guided.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-rose-100/70">
                    Active brides
                  </p>
                  <p className="text-2xl font-serif">{workflowCounts.all}</p>
                  <p className="text-sm text-rose-100/80">
                    {onboardingCount} onboarding · {fittingCount} in fittings
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-rose-100/70">
                    Collection rate
                  </p>
                  <p className="text-2xl font-serif">{collectionRate}%</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-rose-200/90 transition-all"
                      style={{ width: `${collectionRate}%` }}
                    />
                  </div>
                  <p className="text-sm text-rose-100/80 mt-1">
                    ${totalCollected.toLocaleString()} collected of ${totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-rose-50">
                <span className="rounded-full bg-white/10 px-3 py-1">Balances · {workflowCounts.payments}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Requests · {upcomingRequests}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Team calm · concierge templates</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-6 shadow-xl shadow-rose-200/50 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                    Ops snapshot
                  </p>
                  <h2 className="text-xl font-serif text-stone-900">Today&apos;s priorities</h2>
                  <p className="text-sm text-stone-600">
                    Keep fittings flowing, balances in motion, and clients seen.
                  </p>
                </div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  {upcomingRequests} requests
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-stone-500">
                    Balances
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                      avg ${avgBalance.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-stone-900">
                    ${Math.max(totalRevenue - totalCollected, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-stone-600">Open across all active brides</p>
                </div>
                <div className="rounded-2xl border border-stone-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-stone-500">
                    Appointments
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                      {upcomingRequests} pending
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-stone-900">
                    {pendingRequests?.[0]?.requestedDate
                      ? new Date(pendingRequests[0].requestedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      : "No upcoming"}
                  </p>
                  <p className="text-sm text-stone-600">Requests awaiting approval</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-1 text-rose-50 shadow-sm shadow-rose-200/40">
                  <Sparkles className="h-4 w-4" />
                  Concierge workflows on
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-800">
                  <Calendar className="h-4 w-4" />
                  Measurements + fittings are tracked
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8 space-y-4 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-lg shadow-rose-200/50 ring-1 ring-white/60 backdrop-blur md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-stone-400" />
                <Input
                  type="text"
                  placeholder="Search brides, emails, or tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 rounded-full border-stone-200 bg-white pl-10 text-sm shadow-inner shadow-rose-100/60 focus:border-rose-500 focus:ring-rose-500/20"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="h-11 rounded-full bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500 px-6 text-white shadow-lg shadow-rose-200/80 transition hover:-translate-y-[1px] hover:from-rose-800 hover:to-rose-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new bride
                </Button>
                <Button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".csv";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;

                      const text = await file.text();
                      const lines = text.split("\n").slice(1);
                      const bridesData = lines
                        .filter((line) => line.trim())
                        .map((line) => {
                          const [name, email, weddingDate, budget] = line
                            .split(",")
                            .map((s) => s.trim());
                          return {
                            name,
                            email,
                            weddingDate,
                            totalPrice: parseFloat(budget) || 0,
                          };
                        });

                      if (bridesData.length > 0) {
                        await bulkImportBrides({ brides: bridesData });
                        toast.success(`Imported ${bridesData.length} brides!`);
                      }
                    };
                    input.click();
                  }}
                  variant="outline"
                  className="h-11 rounded-full border-stone-200 px-6"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filterChips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setWorkflowFilter(chip.key)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${workflowFilter === chip.key
                    ? "border-rose-500 bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500 text-white shadow-md shadow-rose-200/70"
                    : "border-stone-200 bg-white/80 text-stone-800 hover:-translate-y-[1px] hover:border-rose-200 hover:bg-rose-50/60"
                    }`}
                  type="button"
                >
                  <span>{chip.label}</span>
                  <span className="text-xs text-stone-500">
                    {chip.helper}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* PENDING REQUESTS INBOX */}
          {pendingRequests && pendingRequests.length > 0 && (
            <div className="mb-8 overflow-hidden rounded-3xl border border-rose-100 bg-white/85 shadow-lg shadow-rose-200/50 backdrop-blur">
              <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/60 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                  <h2 className="text-lg font-serif text-stone-900">
                    Pending appointment requests
                  </h2>
                </div>
                <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                  {pendingRequests.length} new
                </span>
              </div>
              <div className="divide-y divide-stone-100">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex flex-col gap-3 p-6 transition-colors hover:bg-rose-50/50 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-stone-900">
                          {req.brideName}
                        </p>
                        <span className="text-sm text-stone-500">•</span>
                        <p className="text-sm text-stone-600">{req.type}</p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-stone-600">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                          <Calendar className="h-4 w-4 text-stone-500" />
                          {new Date(req.requestedDate).toLocaleDateString()}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2 py-1 text-stone-600">
                          {req.requestedTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={async () => {
                          await rejectRequest({ requestId: req._id });
                          toast.success("Request rejected");
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-stone-900 text-white hover:bg-stone-800"
                        onClick={async () => {
                          await approveRequest({ requestId: req._id });
                          toast.success("Request approved & appointment scheduled!");
                        }}
                      >
                        Approve & Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Dashboard */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-serif text-stone-900">Performance Analytics</h2>
            <AnalyticsDashboard />
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/80 bg-gradient-to-br from-white to-rose-50 p-5 shadow-md shadow-rose-100/70 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.26em] text-stone-500">
                Total brides
              </p>
              <p className="mt-2 text-3xl font-serif text-stone-900">{brides.length}</p>
              <p className="text-sm text-stone-600">All clients including completed</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-gradient-to-br from-white to-rose-50 p-5 shadow-md shadow-rose-100/70 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.26em] text-stone-500">
                Active
              </p>
              <p className="mt-2 text-3xl font-serif text-stone-900">{activeBrides.length}</p>
              <p className="text-sm text-stone-600">Onboarding through pickup</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-gradient-to-br from-white to-rose-50 p-5 shadow-md shadow-rose-100/70 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.26em] text-stone-500">
                Revenue
              </p>
              <p className="mt-2 text-3xl font-serif text-stone-900">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-stone-600">All booked value</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-gradient-to-br from-white to-rose-50 p-5 shadow-md shadow-rose-100/70 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.26em] text-stone-500">
                Collected
              </p>
              <p className="mt-2 text-3xl font-serif text-rose-700">
                ${totalCollected.toLocaleString()}
              </p>
              <p className="text-sm text-stone-600">Collection health at {collectionRate}%</p>
            </div>
          </div>

          {/* BRIDE CARD GRID */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBrides.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-stone-200 bg-white/80 py-20 text-center backdrop-blur">
                <Sparkles className="mx-auto mb-4 h-10 w-10 text-stone-200" />
                <p className="font-medium text-stone-600">No brides found</p>
                <p className="mt-1 text-sm text-stone-500">
                  Get started by adding a new client or importing CSV.
                </p>
              </div>
            ) : (
              filteredBrides.map((bride) => {
                const remainingBalance = bride.totalPrice - bride.paidAmount;
                const statusColor = getStatusColor(
                  bride.status,
                  bride.paidAmount,
                  bride.totalPrice
                );
                const paidPercent = Math.min(
                  100,
                  Math.round((bride.paidAmount / bride.totalPrice) * 100)
                );
                const nextStep = getNextStep(bride);

                return (
                  <div
                    key={bride._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/85 shadow-sm shadow-rose-200/40 backdrop-blur transition hover:-translate-y-[2px] hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between border-b border-stone-50 px-5 py-4">
                      <div>
                        <p className="text-lg font-serif text-stone-900">
                          {bride.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(bride.weddingDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusColor}`}
                      >
                        {bride.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 p-5">
                      <div className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                        <div className="flex justify-between text-xs text-stone-600">
                          <span>Total</span>
                          <span className="font-semibold text-stone-900">
                            ${bride.totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-stone-600">
                          <span>Paid</span>
                          <span className="font-semibold text-stone-900">
                            ${bride.paidAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500"
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs">
                          <span className="text-stone-600">Paid {paidPercent}%</span>
                          {remainingBalance > 0 ? (
                            <span className="font-semibold text-rose-700">
                              ${remainingBalance.toLocaleString()} due
                            </span>
                          ) : (
                            <span className="font-semibold text-stone-800">All paid</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-stone-100 bg-white px-3 py-2 text-xs text-stone-600">
                        <span className="font-semibold text-stone-800">Next step</span>
                        <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold text-rose-50">
                          {nextStep}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-stone-100 bg-stone-50 px-4 py-3">
                      <Link href={`/dashboard/brides/${bride._id}`}>
                        <Button
                          variant="outline"
                          className="h-9 w-full rounded-full border-stone-200 bg-white text-xs hover:bg-stone-100"
                        >
                          <Edit className="mr-2 h-3.5 w-3.5" />
                          Details
                        </Button>
                      </Link>
                      <Button
                        onClick={() => copyPortalLink(bride.token)}
                        className={`h-9 w-full rounded-full text-xs ${copiedToken === bride.token
                          ? "bg-rose-600 text-white hover:bg-rose-700"
                          : "bg-stone-900 text-rose-50 hover:bg-stone-800"
                          }`}
                      >
                        {copiedToken === bride.token ? (
                          <>
                            <Check className="mr-2 h-3.5 w-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Portal link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* EDIT SHEET WITH 4 TABS */}
        <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
          <SheetContent className="sm:max-w-2xl bg-white overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-serif text-2xl text-black">
                Manage Client
              </SheetTitle>
              <SheetDescription>
                Robot Assistant Control Center for {selectedBride?.name}
              </SheetDescription>
            </SheetHeader>

            {selectedBride && (
              <form onSubmit={handleSaveAll}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="overview" className="text-xs font-medium">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="dress" className="text-xs font-medium">
                      Dress
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="text-xs font-medium">
                      Appts
                    </TabsTrigger>
                    <TabsTrigger value="alterations" className="text-xs font-medium">
                      Alterations
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="text-xs font-medium">
                      Docs
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: OVERVIEW */}
                  <TabsContent value="overview" className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Full Name
                          </Label>
                          <Input
                            value={editFormData.name}
                            disabled
                            className="bg-stone-100 border-stone-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Email
                          </Label>
                          <Input
                            value={editFormData.email}
                            disabled
                            className="bg-stone-100 border-stone-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Wedding Date
                          </Label>
                          <Input
                            type="date"
                            value={editFormData.weddingDate}
                            disabled
                            className="bg-stone-100 border-stone-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Status
                          </Label>
                          <Select
                            value={editFormData.status}
                            onValueChange={(value) =>
                              setEditFormData({ ...editFormData, status: value })
                            }
                          >
                            <SelectTrigger className="bg-stone-50 border-stone-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Onboarding">Onboarding</SelectItem>
                              <SelectItem value="Measurements">
                                Measurements
                              </SelectItem>
                              <SelectItem value="In Progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="Ready for Pickup">
                                Ready for Pickup
                              </SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Total Price
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editFormData.totalPrice}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                totalPrice: e.target.value,
                              })
                            }
                            className="bg-stone-50 border-stone-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Paid Amount
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editFormData.paidAmount}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                paidAmount: e.target.value,
                              })
                            }
                            className="bg-stone-50 border-stone-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                          Stripe Payment Link
                        </Label>
                        <Input
                          type="url"
                          placeholder="https://buy.stripe.com/..."
                          value={editFormData.stripeLink}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              stripeLink: e.target.value,
                            })
                          }
                          className="bg-stone-50 border-stone-200"
                        />
                        <p className="text-[10px] text-stone-400">
                          Link for bride to make payments
                        </p>
                      </div>

                      {/* ROBOT ASSISTANT FEATURE */}
                      <div className="pt-4 border-t border-stone-200">
                        <Button
                          type="button"
                          onClick={handleSaveAndNotify}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 font-medium"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Save & Notify Bride
                        </Button>
                        <p className="text-[10px] text-stone-400 mt-2 text-center">
                          Saves changes and sends automated email update
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2: DRESS & MEASURES */}
                  <TabsContent value="dress" className="space-y-6">
                    <div className="space-y-6">
                      {/* Dress Details */}
                      <div>
                        <h3 className="font-serif text-lg mb-4">Dress Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Designer
                            </Label>
                            <Input
                              placeholder="Vera Wang"
                              value={dressData.designer}
                              onChange={(e) =>
                                setDressData({
                                  ...dressData,
                                  designer: e.target.value,
                                })
                              }
                              className="bg-stone-50 border-stone-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Style Number
                            </Label>
                            <Input
                              placeholder="VW12345"
                              value={dressData.styleNumber}
                              onChange={(e) =>
                                setDressData({
                                  ...dressData,
                                  styleNumber: e.target.value,
                                })
                              }
                              className="bg-stone-50 border-stone-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Size Ordered
                            </Label>
                            <Input
                              placeholder="8"
                              value={dressData.size}
                              onChange={(e) =>
                                setDressData({ ...dressData, size: e.target.value })
                              }
                              className="bg-stone-50 border-stone-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Color
                            </Label>
                            <Input
                              placeholder="Ivory"
                              value={dressData.color}
                              onChange={(e) =>
                                setDressData({
                                  ...dressData,
                                  color: e.target.value,
                                })
                              }
                              className="bg-stone-50 border-stone-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Measurements */}
                      <div>
                        <h3 className="font-serif text-lg mb-4">
                          Measurements (inches)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Bust
                            </Label>
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="36"
                              value={measurementsData.bust}
                              onChange={(e) =>
                                setMeasurementsData({
                                  ...measurementsData,
                                  bust: e.target.value,
                                })
                              }
                              className="bg-stone-50 border-stone-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Waist
                            </Label>
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="28"
                              value={measurementsData.waist}
                              onChange={(e) =>
                                setMeasurementsData({
                                  ...measurementsData,
                                  waist: e.target.value,
                                })
                              }
                              className="bg-stone-50 border-stone-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Hips
                            </Label>
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="38"
                              value={measurementsData.hips}
                              onChange={(e) =>
                                setMeasurementsData({
                                  ...measurementsData,
                                  hips: e.target.value,
                                })
                              }
                              className="bg-stone-50 border-stone-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Hem
                            </Label>
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="60"
                              value={measurementsData.hem}
                              onChange={(e) =>
                                setMeasurementsData({
                                  ...measurementsData,
                                  hem: e.target.value,
                                })
                              }
                              className="bg-stone-50 border-stone-200"
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Hollow to Hem
                            </Label>
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="58"
                              value={measurementsData.hollowToHem}
                              onChange={(e) =>
                                setMeasurementsData({
                                  ...measurementsData,
                                  hollowToHem: e.target.value,
                                })
                              }
                              className="bg-stone-50 border-stone-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: APPOINTMENTS */}
                  <TabsContent value="appointments" className="space-y-6">
                    {/* Add New Appointment */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <h3 className="font-serif text-lg mb-4">
                        Schedule Appointment
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Date & Time
                            </Label>
                            <Input
                              type="datetime-local"
                              value={newAppointment.date}
                              onChange={(e) =>
                                setNewAppointment({
                                  ...newAppointment,
                                  date: e.target.value,
                                })
                              }
                              className="bg-white border-stone-200"
                            />
                            {availability && !availability.available && (
                              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2">
                                <span className="font-bold">Conflict Detected!</span>
                                <span>Another appointment overlaps with this time.</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Type
                            </Label>
                            <Select
                              value={newAppointment.type}
                              onValueChange={(value) =>
                                setNewAppointment({
                                  ...newAppointment,
                                  type: value,
                                })
                              }
                            >
                              <SelectTrigger className="bg-white border-stone-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Consultation">
                                  Consultation
                                </SelectItem>
                                <SelectItem value="Measurements">
                                  Measurements
                                </SelectItem>
                                <SelectItem value="Fitting">Fitting</SelectItem>
                                <SelectItem value="Final Pickup">
                                  Final Pickup
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Notes
                          </Label>
                          <Input
                            placeholder="Additional details..."
                            value={newAppointment.notes}
                            onChange={(e) =>
                              setNewAppointment({
                                ...newAppointment,
                                notes: e.target.value,
                              })
                            }
                            className="bg-white border-stone-200"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddAppointment}
                          disabled={availability && !availability.available}
                          className="w-full bg-black hover:bg-stone-800 h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Appointment
                        </Button>
                      </div>
                    </div>

                    {/* Existing Appointments */}
                    <div>
                      <h3 className="font-serif text-lg mb-4">
                        Scheduled Appointments
                      </h3>
                      <div className="space-y-3">
                        {appointments === undefined ? (
                          <p className="text-sm text-stone-400">Loading...</p>
                        ) : appointments.length === 0 ? (
                          <p className="text-sm text-stone-400">
                            No appointments scheduled yet
                          </p>
                        ) : (
                          appointments.map((apt) => (
                            <div
                              key={apt._id}
                              className="bg-white p-4 rounded-lg border border-stone-200 flex items-start justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-stone-400" />
                                  <p className="font-medium text-sm">
                                    {new Date(apt.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                                <p className="text-xs text-stone-600 font-medium">
                                  {apt.type}
                                </p>
                                {apt.notes && (
                                  <p className="text-xs text-stone-400 mt-1">
                                    {apt.notes}
                                  </p>
                                )}
                                <span className="inline-block mt-2 px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] rounded-full">
                                  {apt.status}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAppointment(apt._id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 4: DOCUMENTS (THE DIGITAL BINDER) */}
                  <TabsContent value="documents" className="space-y-6">
                    {/* Upload New Document */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <h3 className="font-serif text-lg mb-4">
                        Upload Document
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Document Title
                          </Label>
                          <Input
                            placeholder="e.g., Contract - May 2024"
                            value={newDocument.title}
                            onChange={(e) =>
                              setNewDocument({
                                ...newDocument,
                                title: e.target.value,
                              })
                            }
                            className="bg-white border-stone-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Type
                          </Label>
                          <Select
                            value={newDocument.type}
                            onValueChange={(value) =>
                              setNewDocument({
                                ...newDocument,
                                type: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-white border-stone-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Invoice">Invoice</SelectItem>
                              <SelectItem value="Receipt">Receipt</SelectItem>
                              <SelectItem value="Sketch">Sketch</SelectItem>
                              <SelectItem value="Photo">Photo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                            Upload File
                          </Label>
                          <FileUploader
                            brideId={selectedBrideId}
                            onUploadComplete={() => {
                              toast.success("Document uploaded successfully");
                              setNewDocument({ title: "", url: "", type: "Contract" });
                            }}
                          />
                          <p className="text-[10px] text-stone-400">
                            Supported: PDF, JPG, PNG, DOC, DOCX
                          </p>
                        </div>
                        <div className="pt-2 border-t border-stone-200">
                          <p className="text-xs text-stone-500 mb-2">Or paste a URL:</p>
                          <div className="space-y-2">
                            <Input
                              placeholder="https://... (optional)"
                              value={newDocument.url}
                              onChange={(e) =>
                                setNewDocument({
                                  ...newDocument,
                                  url: e.target.value,
                                })
                              }
                              className="bg-white border-stone-200"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleAddDocument}
                            disabled={!newDocument.url}
                            className="w-full bg-stone-600 hover:bg-stone-700 h-9 mt-2"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Add from URL
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Existing Documents */}
                    <div>
                      <h3 className="font-serif text-lg mb-4">
                        Document Library
                      </h3>
                      <div className="space-y-3">
                        {documents === undefined ? (
                          <p className="text-sm text-stone-400">Loading...</p>
                        ) : documents.length === 0 ? (
                          <p className="text-sm text-stone-400">
                            No documents uploaded yet
                          </p>
                        ) : (
                          documents.map((doc) => (
                            <div
                              key={doc._id}
                              className="bg-white p-4 rounded-lg border border-stone-200"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <FileText className="w-5 h-5 text-stone-400 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-black">
                                      {doc.title}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                      {doc.type} {doc.storageId ? "(uploaded)" : "(URL)"}
                                    </p>
                                    {doc.uploadedAt && (
                                      <p className="text-[10px] text-stone-400 mt-1">
                                        {new Date(
                                          doc.uploadedAt
                                        ).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {(doc.url || doc.storageId) && (
                                    <DocumentDownloadButton doc={doc} />
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteDocument(doc._id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* THE LIABILITY SHIELD: Visibility Toggle */}
                              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                                <div className="flex items-center gap-2">
                                  {doc.visibleToBride ? (
                                    <Eye className="w-4 h-4 text-rose-600" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-stone-400" />
                                  )}
                                  <span className="text-xs text-stone-600">
                                    {doc.visibleToBride
                                      ? "Bride can see this"
                                      : "Hidden from bride"}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={
                                    doc.visibleToBride ? "default" : "outline"
                                  }
                                  onClick={() => handleToggleVisibility(doc)}
                                  className={`text-xs h-8 ${doc.visibleToBride
                                    ? "bg-rose-600 hover:bg-rose-700"
                                    : ""
                                    }`}
                                >
                                  {doc.visibleToBride
                                    ? "Hide from Bride"
                                    : "Show to Bride"}
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 5: ALTERATIONS */}
                  <TabsContent value="alterations" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Add New Alteration */}
                      <div className="bg-stone-50/50 p-6 rounded-xl border border-stone-100">
                        <h3 className="font-serif text-lg mb-4">
                          Add Alteration
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Description*
                            </Label>
                            <Input
                              placeholder="e.g. Hem 2 inches, take in bodice"
                              value={newAlteration.description}
                              onChange={(e) =>
                                setNewAlteration({
                                  ...newAlteration,
                                  description: e.target.value,
                                })
                              }
                              className="bg-white border-stone-200"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                                Cost
                              </Label>
                              <Input
                                type="number"
                                placeholder="150"
                                value={newAlteration.cost}
                                onChange={(e) =>
                                  setNewAlteration({
                                    ...newAlteration,
                                    cost: e.target.value,
                                  })
                                }
                                className="bg-white border-stone-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                                Scheduled Date
                              </Label>
                              <Input
                                type="date"
                                value={newAlteration.scheduledDate}
                                onChange={(e) =>
                                  setNewAlteration({
                                    ...newAlteration,
                                    scheduledDate: e.target.value,
                                  })
                                }
                                className="bg-white border-stone-200"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Seamstress/Tailor
                            </Label>
                            <Input
                              placeholder="Name"
                              value={newAlteration.seamstress}
                              onChange={(e) =>
                                setNewAlteration({
                                  ...newAlteration,
                                  seamstress: e.target.value,
                                })
                              }
                              className="bg-white border-stone-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-stone-500 font-bold">
                              Notes
                            </Label>
                            <Input
                              placeholder="Additional details..."
                              value={newAlteration.notes}
                              onChange={(e) =>
                                setNewAlteration({
                                  ...newAlteration,
                                  notes: e.target.value,
                                })
                              }
                              className="bg-white border-stone-200"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleAddAlteration}
                            className="w-full bg-black hover:bg-stone-800 h-10"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Alteration
                          </Button>
                        </div>
                      </div>

                      {/* Existing Alterations */}
                      <div>
                        <h3 className="font-serif text-lg mb-4">
                          Alteration History
                        </h3>
                        <div className="space-y-3">
                          {alterations === undefined ? (
                            <p className="text-sm text-stone-400">Loading...</p>
                          ) : alterations.length === 0 ? (
                            <p className="text-sm text-stone-400">
                              No alterations tracked yet
                            </p>
                          ) : (
                            alterations.map((alt) => (
                              <div
                                key={alt._id}
                                className="bg-white p-4 rounded-lg border border-stone-200"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-black">
                                      {alt.description}
                                    </p>
                                    <div className="flex gap-4 mt-2 text-xs text-stone-500">
                                      {alt.cost && <span>${alt.cost}</span>}
                                      {alt.seamstress && <span>By: {alt.seamstress}</span>}
                                      {alt.scheduledDate && (
                                        <span>
                                          Scheduled: {new Date(alt.scheduledDate).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                    {alt.notes && (
                                      <p className="text-xs text-stone-400 mt-2">
                                        {alt.notes}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAlteration(alt._id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      alt.status === "Complete"
                                        ? "bg-green-100 text-green-700"
                                        : alt.status === "In Progress"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-stone-100 text-stone-700"
                                    }`}
                                  >
                                    {alt.status}
                                  </span>
                                  {alt.status !== "Complete" && (
                                    <div className="flex gap-2">
                                      {alt.status === "Scheduled" && (
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={() =>
                                            handleUpdateAlterationStatus(alt._id, "In Progress")
                                          }
                                          className="text-xs h-7 bg-blue-600 hover:bg-blue-700"
                                        >
                                          Start Work
                                        </Button>
                                      )}
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                          handleUpdateAlterationStatus(alt._id, "Complete")
                                        }
                                        className="text-xs h-7 bg-green-600 hover:bg-green-700"
                                      >
                                        Mark Complete
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Save/Cancel Buttons */}
                <div className="flex gap-3 pt-6 border-t border-stone-200 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditSheet(false)}
                    className="flex-1 h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-black hover:bg-stone-800 text-white h-11"
                  >
                    Save All Changes
                  </Button>
                </div>
              </form>
            )}
          </SheetContent>
        </Sheet>
      </div>

      <AddBrideModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
      />
    </Authenticated>
  );
}
