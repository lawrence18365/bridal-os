"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Star, Shirt } from "lucide-react";
import { toast } from "sonner";

interface TriedOnSectionProps {
    brideId: Id<"brides">;
}

export function TriedOnSection({ brideId }: TriedOnSectionProps) {
    const [showAdd, setShowAdd] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Id<"inventory"> | null>(null);
    const [notes, setNotes] = useState("");
    const [rating, setRating] = useState(0);

    const inventory = useQuery(api.inventory.listInventory) || [];
    const triedOnItems = useQuery(api.inventory.getTriedOnForBride, { brideId }) || [];
    const recordTriedOn = useMutation(api.inventory.recordTriedOn);
    const addInventoryItem = useMutation(api.inventory.addInventoryItem);

    // Quick add inventory state
    const [newItemName, setNewItemName] = useState("");

    const handleRecord = async () => {
        if (!selectedItem) return;

        await recordTriedOn({
            brideId,
            inventoryId: selectedItem,
            notes,
            rating,
        });

        toast.success("Recorded to history");
        setShowAdd(false);
        setSelectedItem(null);
        setNotes("");
        setRating(0);
    };

    const handleQuickAddInventory = async () => {
        if (!newItemName) return;
        const id = await addInventoryItem({
            name: newItemName,
            status: "Sample"
        });
        setNewItemName("");
        setSelectedItem(id);
        toast.success("Item created");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg">Tried On History</h3>
                <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Dress
                </Button>
            </div>

            {showAdd && (
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4">
                    {!selectedItem ? (
                        <div className="space-y-2">
                            <Label>Select Dress</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {inventory.map((item) => (
                                    <button
                                        key={item._id}
                                        onClick={() => setSelectedItem(item._id)}
                                        className="p-2 text-left text-sm bg-white border border-stone-200 rounded hover:border-stone-900 transition-colors"
                                    >
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-stone-500">{item.styleNumber}</div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-2 pt-2 border-t border-stone-200">
                                <Input
                                    placeholder="Or create new item..."
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="h-8 text-sm"
                                />
                                <Button size="sm" variant="secondary" onClick={handleQuickAddInventory} disabled={!newItemName}>Create</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">
                                    Selected: {inventory.find(i => i._id === selectedItem)?.name}
                                </span>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>Change</Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="What did she think?"
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Rating</Label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setRating(r)}
                                            className={`p-1 rounded hover:bg-stone-200 ${rating >= r ? "text-yellow-500" : "text-stone-300"}`}
                                        >
                                            <Star className="w-5 h-5 fill-current" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={handleRecord} className="w-full bg-stone-900 text-white">
                                Save to Profile
                            </Button>
                        </>
                    )}
                </div>
            )}

            <div className="space-y-2">
                {triedOnItems.length === 0 ? (
                    <p className="text-sm text-stone-400 italic">No dresses tried on yet.</p>
                ) : (
                    triedOnItems.map((record) => (
                        <div key={record._id} className="flex items-start gap-3 p-3 bg-white border border-stone-100 rounded-lg">
                            <div className="w-10 h-10 bg-stone-100 rounded flex items-center justify-center flex-shrink-0">
                                <Shirt className="w-5 h-5 text-stone-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm truncate">{record.inventory?.name || "Unknown Item"}</p>
                                    <div className="flex text-yellow-400">
                                        {Array.from({ length: record.rating || 0 }).map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                </div>
                                {record.notes && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{record.notes}</p>}
                                <p className="text-[10px] text-stone-400 mt-1">
                                    {new Date(record.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
