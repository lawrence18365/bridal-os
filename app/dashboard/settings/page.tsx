"use client";

import { useState } from "react";
import { useQuery, useMutation, Authenticated } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Save, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function SettingsPage() {
    const settings = useQuery(api.settings.getSettings);
    const upsertSettings = useMutation(api.settings.upsertSettings);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const getFileUrl = useQuery(
        api.files.getFileUrl,
        settings?.logoStorageId ? { storageId: settings.logoStorageId } : "skip"
    );

    const user = useUser();

    const [formData, setFormData] = useState({
        storeName: "",
        supportEmail: "",
        brandColor: "#000000",
    });

    const [uploading, setUploading] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // Initialize form when settings load
    useState(() => {
        if (settings) {
            setFormData({
                storeName: settings.storeName || "",
                supportEmail: settings.supportEmail || user?.user?.primaryEmailAddress?.emailAddress || "",
                brandColor: settings.brandColor || "#000000",
            });
        }
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoFile(file);
    };

    const handleSave = async () => {
        try {
            let logoStorageId: Id<"_storage"> | undefined;

            // Upload logo if selected
            if (logoFile) {
                setUploading(true);
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": logoFile.type },
                    body: logoFile,
                });

                const { storageId } = await result.json();
                logoStorageId = storageId;
                setUploading(false);
            }

            await upsertSettings({
                storeName: formData.storeName || undefined,
                supportEmail: formData.supportEmail || undefined,
                brandColor: formData.brandColor || undefined,
                logoStorageId: logoStorageId || settings?.logoStorageId,
            });

            toast.success("Settings saved successfully!");
            setLogoFile(null);
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Failed to save settings");
        }
    };

    if (settings === undefined) {
        return (
            <div className="min-h-screen bg-rose-50/30 flex items-center justify-center">
                <p className="text-stone-400">Loading...</p>
            </div>
        );
    }

    return (
        <Authenticated>
            <Toaster position="top-right" richColors />
            <div className="min-h-screen bg-rose-50/30 font-sans">
                {/* Header */}
                <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-serif text-black tracking-tight">
                                Settings
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-6 py-10">
                    <div className="bg-white rounded-xl border border-stone-200 p-8 space-y-8">
                        <div>
                            <h2 className="font-serif text-xl mb-2">Portal Branding</h2>
                            <p className="text-sm text-stone-500">
                                Customize how your client portal looks to your brides
                            </p>
                        </div>

                        {/* Store Name */}
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name</Label>
                            <Input
                                id="storeName"
                                value={formData.storeName}
                                onChange={(e) =>
                                    setFormData({ ...formData, storeName: e.target.value })
                                }
                                placeholder="e.g., Bella Bridal Boutique"
                                className="bg-stone-50 border-stone-200"
                            />
                            <p className="text-xs text-stone-400">
                                This appears in the client portal header
                            </p>
                        </div>

                        {/* Support Email */}
                        <div className="space-y-2">
                            <Label htmlFor="supportEmail">Support Email</Label>
                            <Input
                                id="supportEmail"
                                type="email"
                                value={formData.supportEmail}
                                onChange={(e) =>
                                    setFormData({ ...formData, supportEmail: e.target.value })
                                }
                                placeholder="hello@yourboutique.com"
                                className="bg-stone-50 border-stone-200"
                            />
                            <p className="text-xs text-stone-400">
                                Shown to brides for questions
                            </p>
                        </div>

                        {/* Brand Color */}
                        <div className="space-y-2">
                            <Label htmlFor="brandColor">Brand Color</Label>
                            <div className="flex items-center gap-4">
                                <input
                                    id="brandColor"
                                    type="color"
                                    value={formData.brandColor}
                                    onChange={(e) =>
                                        setFormData({ ...formData, brandColor: e.target.value })
                                    }
                                    className="h-12 w-24 rounded border border-stone-200 cursor-pointer"
                                />
                                <Input
                                    value={formData.brandColor}
                                    onChange={(e) =>
                                        setFormData({ ...formData, brandColor: e.target.value })
                                    }
                                    placeholder="#000000"
                                    className="flex-1 bg-stone-50 border-stone-200"
                                />
                            </div>
                            <p className="text-xs text-stone-400">
                                Used for buttons and accents in the client portal
                            </p>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            {getFileUrl && (
                                <div className="mb-4">
                                    <img
                                        src={getFileUrl}
                                        alt="Current logo"
                                        className="h-16 object-contain bg-stone-100 rounded p-2"
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById("logo-upload")?.click()}
                                    className="w-full"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {logoFile ? logoFile.name : "Upload Logo"}
                                </Button>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                            </div>
                            <p className="text-xs text-stone-400">
                                Recommended: PNG or SVG, transparent background
                            </p>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 border-t border-stone-200">
                            <Button
                                onClick={handleSave}
                                disabled={uploading}
                                className="w-full bg-black hover:bg-stone-800"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {uploading ? "Uploading..." : "Save Settings"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
