import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Check, AlertCircle, Calendar, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

// Re-defining Bride type locally to avoid circular deps or complex imports if not centralized
// ideally this should come from a shared types file
type Bride = {
    _id: Id<"brides">;
    name: string;
    email: string;
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

interface BridesTableProps {
    brides: Bride[];
    onEdit: (bride: Bride) => void;
    onCopyPortalLink: (token: string) => void;
    copiedToken: string | null;
}

export function BridesTable({ brides, onEdit, onCopyPortalLink, copiedToken }: BridesTableProps) {
    const getStatusColor = (
        status: string,
        paidAmount: number,
        totalPrice: number
    ) => {
        if (status === "Ready for Pickup" || status === "Completed") {
            return "bg-green-100 text-green-800 border-green-200";
        }
        if (status === "Onboarding") {
            return "bg-blue-50 text-blue-700 border-blue-100";
        }
        if (paidAmount < totalPrice) {
            return "bg-amber-50 text-amber-800 border-amber-100";
        }
        return "bg-stone-100 text-stone-600 border-stone-200";
    };

    const getNextStep = (bride: Bride) => {
        if (bride.status === "Onboarding") return "Needs Initial Consult";
        if (bride.status === "Measurements") return "Schedule Fitting";
        if (bride.status === "In Progress") return "Next Fitting";
        if (bride.status === "Ready for Pickup") return "Ready";
        if (bride.status === "Completed") return "Complete";
        return "In Progress";
    };

    return (
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-stone-50/50 hover:bg-stone-50/50">
                        <TableHead className="font-serif text-stone-900 font-medium">
                            Client
                        </TableHead>
                        <TableHead className="font-serif text-stone-900 font-medium">
                            Wedding Date
                        </TableHead>
                        <TableHead className="font-serif text-stone-900 font-medium">
                            Status
                        </TableHead>
                        <TableHead className="font-serif text-stone-900 font-medium">
                            Balance
                        </TableHead>
                        <TableHead className="font-serif text-stone-900 font-medium">
                            Next Step
                        </TableHead>
                        <TableHead className="text-right font-serif text-stone-900 font-medium">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {brides.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center text-stone-500">
                                    <p className="font-medium">No brides found</p>
                                    <p className="text-xs text-stone-400">
                                        Try adjusting your filters
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        brides.map((bride) => {
                            const remainingBalance = bride.totalPrice - bride.paidAmount;
                            const statusColor = getStatusColor(
                                bride.status,
                                bride.paidAmount,
                                bride.totalPrice
                            );

                            return (
                                <TableRow
                                    key={bride._id}
                                    className="hover:bg-stone-50/50 transition-colors cursor-pointer group"
                                    onClick={() => onEdit(bride)}
                                >
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-stone-900">
                                                {bride.name}
                                            </span>
                                            <span className="text-xs text-stone-500">
                                                {bride.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-stone-600">
                                            <Calendar className="w-3 h-3 text-stone-400" />
                                            {new Date(bride.weddingDate).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                statusColor
                                            )}
                                        >
                                            {bride.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {remainingBalance <= 0 ? (
                                            <div className="flex items-center gap-1.5 text-green-600">
                                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-medium">Paid</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-stone-900">
                                                    ${remainingBalance.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-stone-400">
                                                    of ${bride.totalPrice.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-stone-600">
                                            {getNextStep(bride) === "Needs Initial Consult" && (
                                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                            )}
                                            {getNextStep(bride)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCopyPortalLink(bride.token);
                                                }}
                                            >
                                                {copiedToken === bride.token ? (
                                                    <>
                                                        <Check className="w-3 h-3 mr-1.5 text-green-600" />
                                                        <span className="text-xs text-green-600">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3 mr-1.5 text-stone-400" />
                                                        <span className="text-xs text-stone-600">Link</span>
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(bride);
                                                }}
                                            >
                                                <Edit className="w-3 h-3 mr-1.5 text-stone-400" />
                                                <span className="text-xs text-stone-600">Edit</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
