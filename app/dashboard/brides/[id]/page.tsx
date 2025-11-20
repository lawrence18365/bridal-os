"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Plus, Trash2, Send, Calendar as CalendarIcon, Save, Calendar, FileText, Eye, EyeOff, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function BrideCommandCenter({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const bride = useQuery(api.brides.get, { id: id as Id<"brides"> });
    const payments = useQuery(api.payments.getPayments, bride?._id ? { brideId: bride._id } : "skip");
    const appointments = useQuery(api.brides.getAppointments, bride?._id ? { brideId: bride._id } : "skip");
    const documents = useQuery(api.brides.getDocuments, bride?._id ? { brideId: bride._id } : "skip");
    const updateBride = useMutation(api.brides.update);
    const addPayment = useMutation(api.payments.addPayment);
    const updatePayment = useMutation(api.payments.updatePayment);
    const deletePayment = useMutation(api.payments.deletePayment);
    const updateMeasurements = useMutation(api.brides.updateMeasurements);
    const updateDressDetails = useMutation(api.brides.updateDressDetails);
    const addAppointment = useMutation(api.brides.addAppointment);
    const deleteAppointment = useMutation(api.brides.deleteAppointment);
    const addDocument = useMutation(api.brides.addDocument);
    const updateDocument = useMutation(api.brides.updateDocument);
    const deleteDocument = useMutation(api.brides.deleteDocument);
    const sendBrideNotification = useAction(api.emails.sendBrideNotification);

    const [copied, setCopied] = useState(false);
    const [calendarCopied, setCalendarCopied] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    // Dress & Measurements state
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

    // Appointment form state
    const [newAppointment, setNewAppointment] = useState({
        date: "",
        type: "Fitting",
        notes: "",
    });

    // Document form state
    const [newDocument, setNewDocument] = useState({
        title: "",
        url: "",
        type: "Contract",
    });

    // Populate form data when bride loads
    useEffect(() => {
        if (bride) {
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
        }
    }, [bride]);

    if (!bride) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-stone-50">
                <p className="text-stone-400">Loading...</p>
            </div>
        );
    }

    const portalUrl = `${window.location.origin}/p/${bride.token}`;
    const weddingDate = new Date(bride.weddingDate);
    const today = new Date();
    const daysUntilWedding = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysBadgeLabel =
        daysUntilWedding >= 0
            ? `${daysUntilWedding} days until wedding`
            : `${Math.abs(daysUntilWedding)} days since wedding`;

    const totalContract = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const totalPaid =
        payments?.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0) || 0;
    const outstanding =
        payments?.filter((p) => p.status !== "Paid").reduce((sum, p) => sum + p.amount, 0) || 0;
    const paidProgress = totalContract > 0 ? Math.min(100, Math.round((totalPaid / totalContract) * 100)) : 0;

    const handleCopyPortalLink = () => {
        navigator.clipboard.writeText(portalUrl);
        setCopied(true);
        toast.success("Portal link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNotifyBride = async () => {
        if (!bride) return;

        setSendingEmail(true);
        try {
            await sendBrideNotification({
                to: bride.email,
                brideName: bride.name,
                portalUrl: portalUrl,
                message: `Your dress status has been updated to "${bride.status}". Check your portal for the latest details!`,
            });
            toast.success(`Email sent to ${bride.name}!`);
        } catch (error) {
            console.error("Failed to send email:", error);
            toast.error("Failed to send email. Please check your Resend API key.");
        } finally {
            setSendingEmail(false);
        }
    };

    const handleCopyCalendarLink = () => {
        // Convex HTTP endpoint URL format: https://[deployment].convex.cloud/calendar/[ownerId]
        // Use environment variable (available via process.env in Next.js client components)
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || '';

        if (!convexUrl) {
            toast.error("Calendar feed not configured. Contact support.");
            return;
        }

        const calendarUrl = `${convexUrl}/calendar/${bride.ownerId}`;

        navigator.clipboard.writeText(calendarUrl);
        setCalendarCopied(true);
        toast.success("Calendar feed URL copied! Add this to Google/Apple Calendar.");
        setTimeout(() => setCalendarCopied(false), 3000);
    };

    const handleSaveDressAndMeasurements = async () => {
        if (!bride) return;

        try {
            // Update measurements
            await updateMeasurements({
                brideId: bride._id,
                measurements: {
                    bust: measurementsData.bust ? parseFloat(measurementsData.bust) : undefined,
                    waist: measurementsData.waist ? parseFloat(measurementsData.waist) : undefined,
                    hips: measurementsData.hips ? parseFloat(measurementsData.hips) : undefined,
                    hem: measurementsData.hem ? parseFloat(measurementsData.hem) : undefined,
                    hollowToHem: measurementsData.hollowToHem ? parseFloat(measurementsData.hollowToHem) : undefined,
                },
            });

            // Update dress details
            await updateDressDetails({
                brideId: bride._id,
                dressDetails: {
                    designer: dressData.designer || undefined,
                    styleNumber: dressData.styleNumber || undefined,
                    size: dressData.size || undefined,
                    color: dressData.color || undefined,
                },
            });

            toast.success("Dress details and measurements saved!");
        } catch (error) {
            console.error("Failed to save:", error);
            toast.error("Failed to save changes");
        }
    };

    const handleAddAppointment = async () => {
        if (!bride || !newAppointment.date) {
            toast.error("Please select a date");
            return;
        }

        try {
            await addAppointment({
                brideId: bride._id,
                date: newAppointment.date,
                type: newAppointment.type,
                notes: newAppointment.notes || undefined,
            });

            setNewAppointment({ date: "", type: "Fitting", notes: "" });
            toast.success("Appointment added!");
        } catch (error) {
            console.error("Failed to add appointment:", error);
            toast.error("Failed to add appointment");
        }
    };

    const handleDeleteAppointment = async (appointmentId: Id<"appointments">) => {
        try {
            await deleteAppointment({ id: appointmentId });
            toast.success("Appointment deleted");
        } catch (error) {
            console.error("Failed to delete appointment:", error);
            toast.error("Failed to delete appointment");
        }
    };

    const handleAddDocument = async () => {
        if (!bride || !newDocument.title || !newDocument.url) {
            toast.error("Please fill in title and URL");
            return;
        }

        try {
            await addDocument({
                brideId: bride._id,
                title: newDocument.title,
                url: newDocument.url,
                type: newDocument.type,
                visibleToBride: false, // Default to hidden for privacy
            });

            setNewDocument({ title: "", url: "", type: "Contract" });
            toast.success("Document added!");
        } catch (error) {
            console.error("Failed to add document:", error);
            toast.error("Failed to add document");
        }
    };

    const handleToggleDocumentVisibility = async (documentId: Id<"documents">, currentVisibility: boolean) => {
        try {
            await updateDocument({
                id: documentId,
                visibleToBride: !currentVisibility,
            });
            toast.success(
                currentVisibility
                    ? "Document hidden from bride"
                    : "Document now visible to bride"
            );
        } catch (error) {
            console.error("Failed to update visibility:", error);
            toast.error("Failed to update visibility");
        }
    };

    const handleDeleteDocument = async (documentId: Id<"documents">) => {
        try {
            await deleteDocument({ id: documentId });
            toast.success("Document deleted");
        } catch (error) {
            console.error("Failed to delete document:", error);
            toast.error("Failed to delete document");
        }
    };

    const statusOptions = [
        "Initial Contact",
        "Measurements",
        "In Progress",
        "Final Fitting",
        "Ready for Pickup",
        "Completed",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 lg:flex-row lg:px-8">
                {/* Profile / Actions */}
                <div className="lg:sticky lg:top-6 lg:w-80">
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-rose-200/50 backdrop-blur">
                        {/* Back Button */}
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-stone-700">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>

                        {/* Profile Card */}
                        <div className="text-center border-b border-stone-100 pb-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full bg-stone-900 mx-auto mb-4 flex items-center justify-center text-3xl font-serif text-white shadow-md shadow-rose-200/60">
                                {bride.name[0]}
                            </div>

                            {/* Name */}
                            <h2 className="text-xl font-serif text-stone-900 mb-1">{bride.name}</h2>

                            {/* Email */}
                            <p className="text-sm text-stone-600 mb-2">{bride.email}</p>

                            {/* Wedding Date */}
                            <p className="text-xs text-stone-500">
                                {weddingDate.toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                })}
                            </p>
                        </div>

                        {/* Countdown Badge */}
                        <div className={`text-white text-center py-3 px-4 rounded-2xl shadow-md ${daysUntilWedding >= 0 ? "bg-gradient-to-r from-stone-900 to-rose-900" : "bg-gradient-to-r from-red-700 to-rose-600"}`}>
                            <p className="text-2xl font-serif">{Math.abs(daysUntilWedding)}</p>
                            <p className="text-xs uppercase tracking-wider opacity-80">
                                {daysBadgeLabel}
                            </p>
                        </div>

                        {/* Status Dropdown */}
                        <div className="mt-6">
                            <p className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Status</p>
                            <Select
                                value={bride.status}
                                onValueChange={async (value) => {
                                    const result = await updateBride({ id: bride._id, status: value });

                                    // WORKFLOW 4: Frontend notification for automated workflows
                                    if (result?.automationTriggered) {
                                        toast.success("🎉 Status updated & Bride notified via Email", {
                                            duration: 5000,
                                        });
                                    } else {
                                        toast.success("Status updated");
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                            <Button
                                onClick={handleCopyPortalLink}
                                variant="outline"
                                className="w-full"
                            >
                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? "Copied!" : "Copy Portal Link"}
                            </Button>

                            <Button
                                onClick={handleNotifyBride}
                                disabled={sendingEmail}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200/70"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {sendingEmail ? "Sending..." : "Notify Bride"}
                            </Button>

                            <Button
                                onClick={handleCopyCalendarLink}
                                variant="outline"
                                className="w-full"
                            >
                                {calendarCopied ? <Check className="w-4 h-4 mr-2" /> : <CalendarIcon className="w-4 h-4 mr-2" />}
                                {calendarCopied ? "Copied!" : "Calendar Feed"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 space-y-6 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-rose-200/60 backdrop-blur lg:p-10">
                    {/* Page Header */}
                    <div className="flex flex-col gap-2 border-b border-stone-100 pb-4">
                        <h1 className="text-3xl font-serif text-stone-900 md:text-4xl">Manage {bride.name}</h1>
                        <p className="text-stone-600">Complete bride management and workflow tracking</p>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="mb-6 inline-flex rounded-full border border-stone-200 bg-white/70 p-1 shadow-sm">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-rose-100 data-[state=active]:text-stone-900 rounded-full px-4 py-2 text-sm font-medium">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="dress" className="data-[state=active]:bg-rose-100 data-[state=active]:text-stone-900 rounded-full px-4 py-2 text-sm font-medium">
                                Dress & Measurements
                            </TabsTrigger>
                            <TabsTrigger value="appointments" className="data-[state=active]:bg-rose-100 data-[state=active]:text-stone-900 rounded-full px-4 py-2 text-sm font-medium">
                                Appointments
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="data-[state=active]:bg-rose-100 data-[state=active]:text-stone-900 rounded-full px-4 py-2 text-sm font-medium">
                                Documents
                            </TabsTrigger>
                        </TabsList>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Payment Plan Table */}
                            <div className="rounded-2xl border border-stone-200 bg-white/90 p-6 shadow-md shadow-rose-100/60 md:p-8">
                                <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="text-2xl font-serif text-stone-900">Payment Schedule</h2>
                                        <p className="text-sm text-stone-600">Manage installments and track payments</p>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
                                        <span className="font-semibold text-stone-900">{paidProgress}%</span> paid
                                        <div className="h-2 w-32 overflow-hidden rounded-full bg-stone-200">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                                                style={{ width: `${paidProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 gap-4 rounded-xl border border-stone-100 bg-gradient-to-r from-white to-rose-50 p-4 md:grid-cols-3 md:p-6">
                                    <div className="rounded-lg border border-white/80 bg-white/80 p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">Total Contract</p>
                                        <p className="text-3xl font-serif text-stone-900">
                                            ${totalContract.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-white/80 bg-white/80 p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">Total Paid</p>
                                        <p className="text-3xl font-serif text-emerald-600">
                                            ${totalPaid.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-white/80 bg-white/80 p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">Outstanding</p>
                                        <p className="text-3xl font-serif text-rose-600">
                                            ${outstanding.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Add Payment Button */}
                                <div className="mt-8 flex flex-col gap-3 border-b border-stone-100 pb-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-stone-900">Installments</h3>
                                        <p className="text-sm text-stone-600">Keep every installment aligned and visible.</p>
                                    </div>
                                    <Button
                                        onClick={async () => {
                                            await addPayment({
                                                brideId: bride._id,
                                                amount: 0,
                                                dueDate: new Date().toISOString().split('T')[0],
                                                type: "Installment",
                                                status: "Pending",
                                            });
                                            toast.success("Payment added");
                                        }}
                                        size="sm"
                                        className="bg-rose-600 text-white hover:bg-rose-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Payment
                                    </Button>
                                </div>

                                {/* Payment Table */}
                                {payments && payments.length > 0 ? (
                                    <div className="mt-4 overflow-hidden rounded-xl border border-stone-200">
                                        <table className="w-full">
                                            <thead className="bg-stone-50">
                                                <tr>
                                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-stone-600">Type</th>
                                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-stone-600">Amount</th>
                                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-stone-600">Due Date</th>
                                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-stone-600">Status</th>
                                                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-stone-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map((payment) => (
                                                    <tr key={payment._id} className="border-t border-stone-100 hover:bg-rose-50/40">
                                                        <td className="p-4">
                                                            <select
                                                                value={payment.type}
                                                                onChange={(e) => updatePayment({ id: payment._id, type: e.target.value })}
                                                                className="text-sm border rounded px-3 py-2 w-full"
                                                            >
                                                                <option value="Deposit">Deposit</option>
                                                                <option value="Installment">Installment</option>
                                                                <option value="Balance">Balance</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4">
                                                            <input
                                                                type="number"
                                                                value={payment.amount}
                                                                onChange={(e) => updatePayment({ id: payment._id, amount: parseFloat(e.target.value) || 0 })}
                                                                className="w-32 text-sm border rounded px-3 py-2"
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <input
                                                                type="date"
                                                                value={payment.dueDate}
                                                                onChange={(e) => updatePayment({ id: payment._id, dueDate: e.target.value })}
                                                                className="text-sm border rounded px-3 py-2"
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <select
                                                                value={payment.status}
                                                                onChange={(e) => updatePayment({ id: payment._id, status: e.target.value })}
                                                                className={`text-sm border rounded px-3 py-2 font-medium ${payment.status === "Paid" ? "text-green-600" :
                                                                        payment.status === "Overdue" ? "text-red-600" : "text-orange-600"
                                                                    }`}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Paid">Paid</option>
                                                                <option value="Overdue">Overdue</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <Button
                                                                onClick={() => {
                                                                    deletePayment({ id: payment._id });
                                                                    toast.success("Payment deleted");
                                                                }}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-rose-600 hover:bg-rose-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="mt-4 text-center rounded-xl border border-dashed border-stone-200 bg-stone-50/60 py-10 text-stone-500">
                                        <p className="font-medium">No payment schedule yet.</p>
                                        <p className="text-sm text-stone-400 mt-1">Click “Add Payment” to create installments.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                    {/* DRESS TAB */}
                    <TabsContent value="dress">
                        <div className="bg-white rounded-xl border border-stone-200 p-8 space-y-8">
                            {/* Dress Details Section */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-serif text-stone-900">Dress Details</h2>
                                        <p className="text-sm text-stone-600">Designer, style, and color information</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Designer</Label>
                                        <Input
                                            placeholder="e.g., Vera Wang"
                                            value={dressData.designer}
                                            onChange={(e) => setDressData({ ...dressData, designer: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Style Number</Label>
                                        <Input
                                            placeholder="e.g., VW12345"
                                            value={dressData.styleNumber}
                                            onChange={(e) => setDressData({ ...dressData, styleNumber: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Size Ordered</Label>
                                        <Input
                                            placeholder="e.g., 8"
                                            value={dressData.size}
                                            onChange={(e) => setDressData({ ...dressData, size: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Color</Label>
                                        <Input
                                            placeholder="e.g., Ivory"
                                            value={dressData.color}
                                            onChange={(e) => setDressData({ ...dressData, color: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Measurements Section */}
                            <div className="pt-8 border-t border-stone-200">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-serif text-stone-900">Measurements</h2>
                                    <p className="text-sm text-stone-600">Body measurements in inches</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Bust</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="36"
                                            value={measurementsData.bust}
                                            onChange={(e) => setMeasurementsData({ ...measurementsData, bust: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Waist</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="28"
                                            value={measurementsData.waist}
                                            onChange={(e) => setMeasurementsData({ ...measurementsData, waist: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Hips</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="38"
                                            value={measurementsData.hips}
                                            onChange={(e) => setMeasurementsData({ ...measurementsData, hips: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Hem</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="60"
                                            value={measurementsData.hem}
                                            onChange={(e) => setMeasurementsData({ ...measurementsData, hem: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Hollow to Hem</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            placeholder="58"
                                            value={measurementsData.hollowToHem}
                                            onChange={(e) => setMeasurementsData({ ...measurementsData, hollowToHem: e.target.value })}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                {/* Confirmation Status */}
                                {bride.measurementsConfirmedAt && (
                                    <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-green-900">Measurements Confirmed by Bride</p>
                                                <p className="text-sm text-green-700">
                                                    Confirmed on {new Date(bride.measurementsConfirmedAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Save Button */}
                            <div className="pt-6 border-t border-stone-200">
                                <Button
                                    onClick={handleSaveDressAndMeasurements}
                                    className="w-full bg-black hover:bg-stone-800 text-white h-12"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Dress Details & Measurements
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* APPOINTMENTS TAB */}
                    <TabsContent value="appointments">
                        <div className="bg-white rounded-xl border border-stone-200 p-8 space-y-8">
                            {/* Add New Appointment Form */}
                            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                                <h3 className="text-lg font-serif text-stone-900 mb-4">Schedule New Appointment</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Date & Time</Label>
                                            <Input
                                                type="datetime-local"
                                                value={newAppointment.date}
                                                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                                                className="mt-2 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Type</Label>
                                            <Select
                                                value={newAppointment.type}
                                                onValueChange={(value) => setNewAppointment({ ...newAppointment, type: value })}
                                            >
                                                <SelectTrigger className="mt-2 bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Consultation">Consultation</SelectItem>
                                                    <SelectItem value="Measurements">Measurements</SelectItem>
                                                    <SelectItem value="Fitting">Fitting</SelectItem>
                                                    <SelectItem value="Final Fitting">Final Fitting</SelectItem>
                                                    <SelectItem value="Pickup">Pickup</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Notes (Optional)</Label>
                                        <Input
                                            placeholder="e.g., Bring veil for fitting"
                                            value={newAppointment.notes}
                                            onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                                            className="mt-2 bg-white"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleAddAppointment}
                                        className="w-full bg-black hover:bg-stone-800 text-white h-11"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Appointment
                                    </Button>
                                </div>
                            </div>

                            {/* Appointments Timeline */}
                            <div>
                                <h3 className="text-lg font-serif text-stone-900 mb-4">Scheduled Appointments</h3>
                                {!appointments || appointments.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-stone-200 rounded-lg">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                                        <p className="text-stone-500 font-medium">No appointments scheduled yet</p>
                                        <p className="text-sm text-stone-400 mt-1">Add your first appointment above</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {appointments.map((appointment) => {
                                            const appointmentDate = new Date(appointment.date);
                                            const isPast = appointmentDate < new Date();
                                            const isUpcoming = !isPast;

                                            return (
                                                <div
                                                    key={appointment._id}
                                                    className={`p-4 rounded-lg border ${
                                                        isPast
                                                            ? "bg-stone-50 border-stone-200"
                                                            : "bg-blue-50 border-blue-200"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Calendar className={`w-4 h-4 ${isPast ? "text-stone-400" : "text-blue-600"}`} />
                                                                <p className="font-medium text-sm">
                                                                    {appointmentDate.toLocaleDateString("en-US", {
                                                                        weekday: "long",
                                                                        month: "long",
                                                                        day: "numeric",
                                                                        year: "numeric",
                                                                    })}
                                                                </p>
                                                                {isUpcoming && (
                                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                                        UPCOMING
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="ml-6">
                                                                <p className="text-xs text-stone-600 font-medium mb-1">
                                                                    {appointment.type} at {appointmentDate.toLocaleTimeString("en-US", {
                                                                        hour: "numeric",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </p>
                                                                {appointment.notes && (
                                                                    <p className="text-xs text-stone-500 mt-1">{appointment.notes}</p>
                                                                )}
                                                                <p className="text-xs text-stone-400 mt-2">
                                                                    Status: {appointment.status}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            onClick={() => handleDeleteAppointment(appointment._id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* DOCUMENTS TAB */}
                    <TabsContent value="documents">
                        <div className="bg-white rounded-xl border border-stone-200 p-8 space-y-8">
                            {/* Add New Document Form */}
                            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                                <h3 className="text-lg font-serif text-stone-900 mb-4">Add New Document</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Document Title</Label>
                                            <Input
                                                placeholder="e.g., Signed Contract"
                                                value={newDocument.title}
                                                onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                                                className="mt-2 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Type</Label>
                                            <Select
                                                value={newDocument.type}
                                                onValueChange={(value) => setNewDocument({ ...newDocument, type: value })}
                                            >
                                                <SelectTrigger className="mt-2 bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Contract">Contract</SelectItem>
                                                    <SelectItem value="Invoice">Invoice</SelectItem>
                                                    <SelectItem value="Receipt">Receipt</SelectItem>
                                                    <SelectItem value="Photo">Photo</SelectItem>
                                                    <SelectItem value="Inspiration">Inspiration</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Document URL</Label>
                                        <Input
                                            placeholder="https://drive.google.com/... or https://dropbox.com/..."
                                            value={newDocument.url}
                                            onChange={(e) => setNewDocument({ ...newDocument, url: e.target.value })}
                                            className="mt-2 bg-white"
                                        />
                                        <p className="text-xs text-stone-500 mt-2">
                                            Upload files to Google Drive, Dropbox, or any cloud storage and paste the shareable link here.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleAddDocument}
                                        className="w-full bg-black hover:bg-stone-800 text-white h-11"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Add Document
                                    </Button>
                                </div>
                            </div>

                            {/* Documents Grid */}
                            <div>
                                <h3 className="text-lg font-serif text-stone-900 mb-4">Document Library</h3>
                                {!documents || documents.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-stone-200 rounded-lg">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                                        <p className="text-stone-500 font-medium">No documents uploaded yet</p>
                                        <p className="text-sm text-stone-400 mt-1">Add your first document above</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc._id}
                                                className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-5 h-5 text-stone-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-sm text-stone-900 truncate">
                                                                {doc.title}
                                                            </h4>
                                                            <p className="text-xs text-stone-500 mt-0.5">
                                                                {doc.type}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleDeleteDocument(doc._id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1 -mr-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                {/* Visibility Status */}
                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {doc.visibleToBride ? (
                                                            <>
                                                                <Eye className="w-4 h-4 text-green-600" />
                                                                <span className="text-xs font-medium text-green-700">
                                                                    Visible to bride
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeOff className="w-4 h-4 text-stone-400" />
                                                                <span className="text-xs font-medium text-stone-500">
                                                                    Hidden from bride
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={() => handleToggleDocumentVisibility(doc._id, doc.visibleToBride)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                    >
                                                        {doc.visibleToBride ? "Hide" : "Show"}
                                                    </Button>
                                                </div>

                                                {/* View Document Button */}
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium py-2 rounded-md transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    View Document
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
        </div>
    );
}
