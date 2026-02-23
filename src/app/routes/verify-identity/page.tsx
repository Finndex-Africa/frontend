"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { verificationApi, type IdVerification, type SubmitIdVerificationDto } from "@/services/api/verification.api";
import { mediaApi } from "@/services/api/media.api";

const ID_TYPES = [
    { value: "passport", label: "Passport" },
    { value: "national_id", label: "National ID" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "voters_card", label: "Voter's Card" },
];

export default function VerifyIdentityPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existing, setExisting] = useState<IdVerification | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState<SubmitIdVerificationDto>({
        idType: "national_id",
        idNumber: "",
        idFrontImage: "",
        idBackImage: "",
        selfieImage: "",
        fullName: "",
    });

    const [uploadingFront, setUploadingFront] = useState(false);
    const [uploadingBack, setUploadingBack] = useState(false);
    const [uploadingSelfie, setUploadingSelfie] = useState(false);

    const frontRef = useRef<HTMLInputElement>(null);
    const backRef = useRef<HTMLInputElement>(null);
    const selfieRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            router.replace("/routes/login");
            return;
        }
        loadExisting();
    }, [router]);

    const loadExisting = async () => {
        try {
            const res = await verificationApi.getMyStatus();
            const data = (res.data as any)?.data ?? res.data;
            if (data) setExisting(data);
        } catch {
            // No existing verification
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (
        file: File,
        field: "idFrontImage" | "idBackImage" | "selfieImage",
        setUploading: (v: boolean) => void,
    ) => {
        setUploading(true);
        setError("");
        try {
            const result = await mediaApi.upload(file, "users");
            setForm((prev) => ({ ...prev, [field]: result.url }));
        } catch {
            setError("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.idNumber.trim()) {
            setError("ID number is required.");
            return;
        }
        if (!form.idFrontImage) {
            setError("Please upload the front of your ID.");
            return;
        }

        setSubmitting(true);
        try {
            await verificationApi.submit(form);
            setSuccess("Your ID has been submitted for verification. You will be notified once it's reviewed.");
            loadExisting();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const statusColor: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        expired: "bg-gray-100 text-gray-800",
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-8 pb-16 px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h1>
                    <p className="text-gray-600 mb-8">
                        Upload a government-issued ID so our team can verify your account.
                    </p>

                    {/* Existing verification status */}
                    {existing && (
                        <div className={`rounded-xl p-5 mb-8 ${statusColor[existing.status] || "bg-gray-100"}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-lg capitalize">{existing.status}</p>
                                    <p className="text-sm mt-1">
                                        {existing.status === "pending" && "Your ID is being reviewed. We'll notify you shortly."}
                                        {existing.status === "approved" && "Your identity has been verified!"}
                                        {existing.status === "rejected" && (existing.rejectionReason || "Your ID was rejected. Please resubmit.")}
                                        {existing.status === "expired" && "Your verification has expired. Please resubmit."}
                                    </p>
                                </div>
                                <span className="text-xs opacity-70">
                                    {new Date(existing.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Show form if no pending/approved verification */}
                    {(!existing || existing.status === "rejected" || existing.status === "expired") && (
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                    {success}
                                </div>
                            )}

                            {/* Full name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (as on ID)</label>
                                <input
                                    type="text"
                                    value={form.fullName || ""}
                                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Your full legal name"
                                />
                            </div>

                            {/* ID type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                                <select
                                    value={form.idType}
                                    onChange={(e) => setForm((p) => ({ ...p, idType: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    {ID_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ID number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                                <input
                                    type="text"
                                    required
                                    value={form.idNumber}
                                    onChange={(e) => setForm((p) => ({ ...p, idNumber: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Enter your ID number"
                                />
                            </div>

                            {/* Front of ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Front of ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    ref={frontRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUpload(f, "idFrontImage", setUploadingFront);
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => frontRef.current?.click()}
                                    disabled={uploadingFront}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                                >
                                    {uploadingFront ? (
                                        <span className="text-blue-600">Uploading...</span>
                                    ) : form.idFrontImage ? (
                                        <img src={form.idFrontImage} alt="Front" className="max-h-40 mx-auto rounded" />
                                    ) : (
                                        <span className="text-gray-500">Click to upload front of ID</span>
                                    )}
                                </button>
                            </div>

                            {/* Back of ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Back of ID (optional)</label>
                                <input
                                    ref={backRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUpload(f, "idBackImage", setUploadingBack);
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => backRef.current?.click()}
                                    disabled={uploadingBack}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                                >
                                    {uploadingBack ? (
                                        <span className="text-blue-600">Uploading...</span>
                                    ) : form.idBackImage ? (
                                        <img src={form.idBackImage} alt="Back" className="max-h-40 mx-auto rounded" />
                                    ) : (
                                        <span className="text-gray-500">Click to upload back of ID</span>
                                    )}
                                </button>
                            </div>

                            {/* Selfie */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selfie with ID (optional)</label>
                                <input
                                    ref={selfieRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUpload(f, "selfieImage", setUploadingSelfie);
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => selfieRef.current?.click()}
                                    disabled={uploadingSelfie}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                                >
                                    {uploadingSelfie ? (
                                        <span className="text-blue-600">Uploading...</span>
                                    ) : form.selfieImage ? (
                                        <img src={form.selfieImage} alt="Selfie" className="max-h-40 mx-auto rounded" />
                                    ) : (
                                        <span className="text-gray-500">Click to upload a selfie holding your ID</span>
                                    )}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#0000FF] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit for Verification"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
    );
}
