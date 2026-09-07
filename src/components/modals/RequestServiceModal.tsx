'use client';

import { useTranslations } from "next-intl";
import { useEffect, useState } from 'react';
import {
    serviceRequestsApi,
    type CreateServiceRequestDto,
    type ServiceRequestCategory,
} from '@/services/api/service-requests.api';
import { isE164Phone } from '@/services/api/user-reports.api';
import { useErrorMessage } from "@/lib/error-messages";

interface RequestServiceModalProps {
    open: boolean;
    onClose: () => void;
    category: ServiceRequestCategory;
}

type FormState = {
    fullName: string;
    email: string;
    phone: string;
    details: string;
    location: string;
    budget: string;
};

type FormFieldKey = keyof FormState;
type FormErrors = Partial<Record<FormFieldKey, string>>;

const INITIAL_FORM: FormState = {
    fullName: '',
    email: '',
    phone: '',
    details: '',
    location: '',
    budget: '',
};

function getStoredUser(): { firstName?: string; lastName?: string; email?: string; phone?: string } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/** Signed-in visitors shouldn't retype what we already know about them. */
function prefillFromUser(form: FormState): FormState {
    const user = getStoredUser();
    if (!user) return form;
    const next = { ...form };
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (name) next.fullName = name;
    if (user.email) next.email = user.email;
    if (user.phone) next.phone = user.phone;
    return next;
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Returns catalog keys (under `requestService.errors`), not copy — this runs outside React. */
function validateFormFields(form: FormState): FormErrors {
    const errors: FormErrors = {};

    if (form.fullName.trim().length < 2) {
        errors.fullName = 'fullNameMin';
    }

    if (!form.email.trim()) {
        errors.email = 'emailRequired';
    } else if (!isValidEmail(form.email)) {
        errors.email = 'emailInvalid';
    }

    // Phone is optional here, but a supplied one still has to be dialable.
    if (form.phone.trim() && !isE164Phone(form.phone)) {
        errors.phone = 'phoneInvalid';
    }

    if (form.details.trim().length < 10) {
        errors.details = 'detailsMin';
    }

    return errors;
}

export default function RequestServiceModal({ open, onClose, category }: RequestServiceModalProps) {
    const t = useTranslations("requestService");
    const errorMessage = useErrorMessage();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(prefillFromUser(INITIAL_FORM));
            setFieldErrors({});
            setError('');
            setSubmitted(false);
        }
    }, [open]);

    // Esc closes, and the page behind must not scroll while the dialog is up.
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    const setField = (key: FormFieldKey, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setFieldErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const errors = validateFormFields(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setLoading(true);

        const payload: CreateServiceRequestDto = {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            category,
            details: form.details.trim(),
            ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
            ...(form.location.trim() ? { location: form.location.trim() } : {}),
            ...(form.budget.trim() ? { budget: form.budget.trim() } : {}),
        };

        try {
            await serviceRequestsApi.submit(payload);
            setSubmitted(true);
        } catch (err: unknown) {
            setError(errorMessage(err, "submitServiceRequest"));
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const inputClass = (key: FormFieldKey) =>
        `w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            fieldErrors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        }`;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-4 sm:px-6 sm:py-6"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[min(920px,calc(100vh-2rem))] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="request-service-modal-title"
            >
                <div className="relative flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-200 shrink-0 bg-linear-to-r from-blue-700 to-blue-600 text-white sm:px-6 sm:py-5">
                    <div className="min-w-0 pr-10">
                        <h2 id="request-service-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight">
                            {t("modalTitle")}
                        </h2>
                        <p className="text-sm text-white/90 mt-1">{t("modalSubtitle")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 shrink-0 rounded-lg p-2 text-white/90 hover:bg-white/15 hover:text-white transition-colors z-10"
                        aria-label={t("close")}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 p-5 sm:p-6">
                    {submitted ? (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{t("successTitle")}</h3>
                            <p className="mt-2 text-sm text-gray-600">{t("successBody")}</p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                                {t("close")}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                                    {error}
                                </div>
                            )}

                            {Object.keys(fieldErrors).length > 0 && !error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                                    {t("fixFields")}
                                </div>
                            )}

                            <div>
                                <label htmlFor="request-service-fullName" className="block text-sm font-medium text-gray-800 mb-1.5">
                                    {t("fullName")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="request-service-fullName"
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => setField('fullName', e.target.value)}
                                    placeholder={t("fullNamePlaceholder")}
                                    className={inputClass('fullName')}
                                    aria-invalid={Boolean(fieldErrors.fullName)}
                                />
                                {fieldErrors.fullName && (
                                    <p className="mt-1 text-xs text-red-600">{t(`errors.${fieldErrors.fullName}`)}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="request-service-email" className="block text-sm font-medium text-gray-800 mb-1.5">
                                    {t("email")} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="request-service-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setField('email', e.target.value)}
                                    placeholder={t("emailPlaceholder")}
                                    className={inputClass('email')}
                                    aria-invalid={Boolean(fieldErrors.email)}
                                />
                                {fieldErrors.email && (
                                    <p className="mt-1 text-xs text-red-600">{t(`errors.${fieldErrors.email}`)}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="request-service-phone" className="block text-sm font-medium text-gray-800 mb-1.5">
                                    {t("phoneOptional")}
                                </label>
                                <input
                                    id="request-service-phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setField('phone', e.target.value)}
                                    placeholder={t("phonePlaceholder")}
                                    className={inputClass('phone')}
                                    aria-invalid={Boolean(fieldErrors.phone)}
                                />
                                {fieldErrors.phone ? (
                                    <p className="mt-1 text-xs text-red-600">{t(`errors.${fieldErrors.phone}`)}</p>
                                ) : (
                                    <p className="mt-1 text-xs text-gray-500">{t("phoneHint")}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="request-service-details" className="block text-sm font-medium text-gray-800 mb-1.5">
                                    {t("details")} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="request-service-details"
                                    rows={4}
                                    value={form.details}
                                    onChange={(e) => setField('details', e.target.value)}
                                    placeholder={t("detailsPlaceholder")}
                                    className={inputClass('details')}
                                    aria-invalid={Boolean(fieldErrors.details)}
                                />
                                {fieldErrors.details && (
                                    <p className="mt-1 text-xs text-red-600">{t(`errors.${fieldErrors.details}`)}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="request-service-location" className="block text-sm font-medium text-gray-800 mb-1.5">
                                        {t("location")}
                                    </label>
                                    <input
                                        id="request-service-location"
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => setField('location', e.target.value)}
                                        placeholder={t("locationPlaceholder")}
                                        className={inputClass('location')}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="request-service-budget" className="block text-sm font-medium text-gray-800 mb-1.5">
                                        {t("budget")}
                                    </label>
                                    <input
                                        id="request-service-budget"
                                        type="text"
                                        value={form.budget}
                                        onChange={(e) => setField('budget', e.target.value)}
                                        placeholder={t("budgetPlaceholder")}
                                        className={inputClass('budget')}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? t("submitting") : t("submit")}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
