"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, Mail, User, Sparkles, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";

interface AddBrideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddBrideModal({ isOpen, onClose }: AddBrideModalProps) {
    const createBride = useMutation(api.brides.create);
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
        setIsLoading(true);

        try {
            await createBride({
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber || undefined,
                weddingDate: formData.weddingDate,
                totalPrice: parseFloat(formData.totalPrice),
            });

            toast.success("✨ Client added! Welcome email sent & tasks created.", {
                duration: 5000,
            });

            setFormData({ name: "", email: "", phoneNumber: "", weddingDate: "", totalPrice: "" });
            onClose();
        } catch (error) {
            toast.error("Failed to add bride. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] border-0 bg-white/95 backdrop-blur-xl shadow-2xl shadow-rose-200/50 rounded-3xl overflow-hidden p-0 gap-0">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-8 py-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-rose-200" />
                        </div>
                        <p className="text-xs font-bold tracking-[0.2em] text-rose-200 uppercase">New Client</p>
                    </div>
                    <DialogTitle className="text-2xl font-serif relative z-10">Welcome a new bride</DialogTitle>
                    <DialogDescription className="text-rose-100/70 mt-1 relative z-10">
                        Start their journey with a personalized portal.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
                    <div className="space-y-4">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-stone-500">Full Name</Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-rose-500 transition-colors" />
                                <Input
                                    id="name"
                                    placeholder="e.g. Olivia Grace"
                                    className="pl-10 h-11 rounded-xl border-stone-200 bg-stone-50/50 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-stone-500">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-rose-500 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="olivia@example.com"
                                    className="pl-10 h-11 rounded-xl border-stone-200 bg-stone-50/50 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Number Input */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-stone-500">Phone Number (Optional)</Label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-rose-500 transition-colors" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="(555) 123-4567"
                                    className="pl-10 h-11 rounded-xl border-stone-200 bg-stone-50/50 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 transition-all"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Wedding Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-stone-500">Wedding Date</Label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-rose-500 transition-colors" />
                                    <Input
                                        id="date"
                                        type="date"
                                        className="pl-10 h-11 rounded-xl border-stone-200 bg-stone-50/50 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 transition-all"
                                        value={formData.weddingDate}
                                        onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Budget/Price */}
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-xs font-semibold uppercase tracking-wider text-stone-500">Dress Value</Label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-rose-500 transition-colors" />
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="2500"
                                        className="pl-10 h-11 rounded-xl border-stone-200 bg-stone-50/50 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 transition-all"
                                        value={formData.totalPrice}
                                        onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-11 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-11 px-8 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500 text-white shadow-lg shadow-rose-200/80 hover:shadow-rose-300/50 hover:-translate-y-[1px] transition-all duration-300"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Profile"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
