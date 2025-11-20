"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface FileUploaderProps {
    brideId: Id<"brides">;
    onUploadComplete: () => void;
}

export function FileUploader({ brideId, onUploadComplete }: FileUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const addDocument = useMutation(api.brides.addDocument);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // Step 1: Get upload URL from Convex
            const uploadUrl = await generateUploadUrl();

            // Step 2: Upload file to Convex storage
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            const { storageId } = await result.json();

            // Step 3: Save document record
            await addDocument({
                brideId,
                title: file.name,
                storageId,
                type: getFileType(file.name),
                visibleToBride: false,
            });

            toast.success("File uploaded successfully!");
            onUploadComplete();

            // Reset input
            e.target.value = "";
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
        }
    };

    const getFileType = (filename: string): string => {
        const ext = filename.split(".").pop()?.toLowerCase();
        if (ext === "pdf") return "Contract";
        if (["jpg", "jpeg", "png"].includes(ext || "")) return "Photo";
        return "Document";
    };

    return (
        <div>
            <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                disabled={isUploading}
            />
            <label htmlFor="file-upload">
                <Button
                    type="button"
                    disabled={isUploading}
                    className="w-full bg-black hover:bg-stone-800 text-white"
                    asChild
                >
                    <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? "Uploading..." : "Upload PDF/Image"}
                    </span>
                </Button>
            </label>
        </div>
    );
}
