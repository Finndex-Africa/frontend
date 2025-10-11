"use client";
import React, { useState } from "react";
import Button from "../../../../components/ui/Button";
import StatusBadge from "../../../../components/domain/StatusBadge";
import { useToast } from "../../../../components/ui/Toast";

export default function NewPropertyPage() {
    const { push } = useToast();
    const [status, setStatus] = useState<"pending" | "approved" | "rented">("pending");
    const [premium, setPremium] = useState(false);

    return (
        <div className="container-app py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form className="lg:col-span-2 card p-4 space-y-3" onSubmit={(e) => { e.preventDefault(); push({ title: "Property submitted", description: "We will review shortly.", variant: "success" }); }}>
                <h1 className="text-xl font-bold">Upload Property</h1>
                <input className="input" placeholder="Title" required />
                <input className="input" placeholder="Location" required />
                <input className="input" placeholder="Price e.g. 800/month" required />
                <textarea className="input" placeholder="Description" rows={4} />
                <div className="grid grid-cols-2 gap-3">
                    <input className="input" placeholder="Amenities (comma separated)" />
                    <input className="input" type="file" multiple accept="image/*,video/*" />
                </div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} /> Premium / Sponsored</label>
                <Button type="submit">Submit</Button>
            </form>
            <aside className="space-y-4">
                <div className="card p-4">
                    <div className="font-semibold mb-2">Status Tracker</div>
                    <div className="space-x-2">
                        <StatusBadge status={status} />
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Button className="btn-secondary" onClick={() => setStatus("pending")}>Mark Pending</Button>
                        <Button className="btn-secondary" onClick={() => setStatus("approved")}>Approve</Button>
                        <Button className="btn-secondary" onClick={() => setStatus("rented")}>Rented</Button>
                    </div>
                </div>
            </aside>
        </div>
    );
}



