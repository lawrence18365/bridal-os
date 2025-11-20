"use client";

import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, EyeOff, Trash2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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

interface DocumentListItemProps {
    document: Document;
    onToggleVisibility: (id: Id<"documents">, currentVisibility: boolean) => void;
    onDelete: (id: Id<"documents">) => void;
}

export function DocumentListItem({
    document,
    onToggleVisibility,
    onDelete,
}: DocumentListItemProps) {
    // Get file URL if using Convex storage
    const fileUrl = useQuery(
        api.files.getFileUrl,
        document.storageId ? { storageId: document.storageId } : "skip"
    );

    const downloadUrl = document.storageId ? fileUrl : document.url;

    const getTypeBadge = (type: string) => {
        const badges: Record<string, { variant: string; className: string }> = {
            Contract: { variant: "default", className: "bg-blue-100 text-blue-800 border-blue-200" },
            Invoice: { variant: "default", className: "bg-green-100 text-green-800 border-green-200" },
            Receipt: { variant: "default", className: "bg-green-100 text-green-800 border-green-200" },
            Photo: { variant: "default", className: "bg-purple-100 text-purple-800 border-purple-200" },
            Sketch: { variant: "default", className: "bg-pink-100 text-pink-800 border-pink-200" },
            Document: { variant: "default", className: "bg-stone-100 text-stone-800 border-stone-200" },
        };

        const config = badges[type] || badges.Document;

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${config.className}`}>
                {type}
            </span>
        );
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-stone-200 hover:border-stone-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                    <FileText className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        {downloadUrl ? (
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-sm text-black hover:text-blue-600 hover:underline block truncate"
                            >
                                {document.title}
                            </a>
                        ) : (
                            <p className="font-medium text-sm text-black truncate">{document.title}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            {getTypeBadge(document.type)}
                            {document.uploadedAt && (
                                <span className="text-[10px] text-stone-400">
                                    {new Date(document.uploadedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {downloadUrl && (
                        <a
                            href={downloadUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-stone-500 hover:text-blue-600 hover:bg-blue-50"
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        </a>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(document._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                    {document.visibleToBride ? (
                        <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                        <EyeOff className="w-4 h-4 text-stone-400" />
                    )}
                    <span className="text-xs text-stone-600">
                        {document.visibleToBride ? "Bride can see this" : "Hidden from bride"}
                    </span>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleVisibility(document._id, document.visibleToBride)}
                    className="h-7 text-xs"
                >
                    {document.visibleToBride ? "Hide from Bride" : "Show to Bride"}
                </Button>
            </div>
        </div>
    );
}
