'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    isE164Phone,
    USER_REPORT_CATEGORIES,
    userReportsApi,
    type SubmitUserReportDto,
    type UserReportCategory,
} from '@/services/api/user-reports.api';
import { getUserFriendlyErrorMessage } from '@/lib/error-messages';

interface UserReportModalProps {
    open: boolean;
    onClose: () => void;
}

type FormState = {
    fullName: string;
    email: string;
    phone: string;
    reportCategory: UserReportCategory | '';
    reportedTarget: string;
};

type FormFieldKey = keyof FormState;
type FormErrors = Partial<Record<FormFieldKey, string>>;

const FIELD_ORDER: FormFieldKey[] = ['fullName', 'email', 'phone', 'reportCategory', 'reportedTarget'];

const INITIAL_FORM: FormState = {
    fullName: '',
    email: '',
    phone: '',
    reportCategory: '',
    reportedTarget: '',
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

function validateFormFields(form: FormState): FormErrors {
    const errors: FormErrors = {};

    if (form.fullName.trim().length < 2) {
        errors.fullName = 'Please enter your full name (at least 2 characters).';
    }

    if (!form.email.trim()) {
        errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(form.email)) {
        errors.email = 'Please enter a valid email address.';
    }

    if (!form.phone.trim()) {
        errors.phone = 'Please enter your phone number.';
    } else if (!isE164Phone(form.phone)) {
        errors.phone = 'Use international format, e.g. +231886149241.';
    }

    if (!form.reportCategory) {
        errors.reportCategory = 'Please select a report category.';
    }

    if (form.reportedTarget.trim().length < 2) {
        errors.reportedTarget = 'Please enter the name or email of the person or listing you are reporting.';
    }

    return errors;
}

function scrollToFirstFieldError(errors: FormErrors) {
    const firstKey = FIELD_ORDER.find((key) => errors[key]);
    if (!firstKey) return;
    requestAnimationFrame(() => {
        document.getElementById(`user-report-field-${firstKey}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    });
}

const inputClass =
    'w-full rounded-lg border px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2';
const inputNormalClass = `${inputClass} border-gray-300 focus:border-blue-500 focus:ring-blue-500/20`;
const inputErrorClass = `${inputClass} border-red-500 focus:border-red-500 focus:ring-red-500/20`;
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
const fieldErrorClass = 'mt-1.5 text-xs text-red-600';

function FieldLabel({ htmlFor, required, children }: { htmlFor?: string; required?: boolean; children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className={labelClass}>
            {children}
            {required ? <span className="text-red-500"> *</span> : null}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className={fieldErrorClass} role="alert">
            {message}
        </p>
    );
}

function FormField({
    fieldKey,
    error,
    children,
}: {
    fieldKey: FormFieldKey;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div id={`user-report-field-${fieldKey}`}>
            {children}
            <FieldError message={error} />
        </div>
    );
}

function inputClassName(hasError: boolean): string {
    return hasError ? inputErrorClass : inputNormalClass;
}

export default function UserReportModal({ open, onClose }: UserReportModalProps) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const patchForm = useCallback((patch: Partial<FormState>) => {
        setForm((prev) => ({ ...prev, ...patch }));
        setFieldErrors((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(patch) as FormFieldKey[]) {
                delete next[key];
            }
            return next;
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        setError('');
        setFieldErrors({});
        setSubmitted(false);
        setForm(prefillFromUser(INITIAL_FORM));
    }, [open]);

    const handleClose = () => {
        setError('');
        setFieldErrors({});
        setSubmitted(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const errors = validateFormFields(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            scrollToFirstFieldError(errors);
            return;
        }

        setFieldErrors({});
        setLoading(true);

        const payload: SubmitUserReportDto = {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            reportCategory: form.reportCategory as UserReportCategory,
            reportedTarget: form.reportedTarget.trim(),
        };

        try {
            await userReportsApi.submit(payload);
            setSubmitted(true);
        } catch (err: unknown) {
            setError(getUserFriendlyErrorMessage(err, 'Failed to submit report. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-4 sm:px-6 sm:py-6"
            onClick={handleClose}
            role="presentation"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[min(920px,calc(100vh-2rem))] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-report-modal-title"
            >
                <div className="relative flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-200 shrink-0 bg-linear-to-r from-blue-700 to-blue-600 text-white sm:px-6 sm:py-5">
                    <div className="min-w-0 pr-10">
                        <h2 id="user-report-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight">
                            Findafriq User Report Form
                        </h2>
                        <p className="text-sm text-white/90 mt-1">
                            Report fraud, fake listings, or other concerns on the platform.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 shrink-0 rounded-lg p-2 text-white/90 hover:bg-white/15 hover:text-white transition-colors z-10"
                        aria-label="Close"
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
                            <h3 className="text-lg font-semibold text-gray-900">Report submitted</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Thank you. Our team will review your report and take appropriate action.
                            </p>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                                Close
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
                                    Please fix the highlighted fields below.
                                </div>
                            )}

                            <FormField fieldKey="fullName" error={fieldErrors.fullName}>
                                <FieldLabel htmlFor="user-report-fullName" required>
                                    Full Name
                                </FieldLabel>
                                <input
                                    id="user-report-fullName"
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => patchForm({ fullName: e.target.value })}
                                    className={inputClassName(!!fieldErrors.fullName)}
                                    placeholder="Jane Doe"
                                    aria-invalid={!!fieldErrors.fullName}
                                />
                            </FormField>

                            <FormField fieldKey="email" error={fieldErrors.email}>
                                <FieldLabel htmlFor="user-report-email" required>
                                    Email Address
                                </FieldLabel>
                                <input
                                    id="user-report-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => patchForm({ email: e.target.value })}
                                    className={inputClassName(!!fieldErrors.email)}
                                    placeholder="jane@example.com"
                                    aria-invalid={!!fieldErrors.email}
                                />
                            </FormField>

                            <FormField fieldKey="phone" error={fieldErrors.phone}>
                                <FieldLabel htmlFor="user-report-phone" required>
                                    Phone Number
                                </FieldLabel>
                                <input
                                    id="user-report-phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => patchForm({ phone: e.target.value })}
                                    className={inputClassName(!!fieldErrors.phone)}
                                    placeholder="+231886149241"
                                    aria-invalid={!!fieldErrors.phone}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    International format, e.g. +231886149241
                                </p>
                            </FormField>

                            <FormField fieldKey="reportCategory" error={fieldErrors.reportCategory}>
                                <FieldLabel htmlFor="user-report-category" required>
                                    Report Category
                                </FieldLabel>
                                <select
                                    id="user-report-category"
                                    value={form.reportCategory}
                                    onChange={(e) =>
                                        patchForm({ reportCategory: e.target.value as UserReportCategory | '' })
                                    }
                                    className={`${inputClassName(!!fieldErrors.reportCategory)} bg-white`}
                                    aria-invalid={!!fieldErrors.reportCategory}
                                >
                                    <option value="">Select a category</option>
                                    {USER_REPORT_CATEGORIES.map(({ value, label }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField fieldKey="reportedTarget" error={fieldErrors.reportedTarget}>
                                <FieldLabel htmlFor="user-report-target" required>
                                    Who Are You Reporting? (Name or Email of the Person/Listing)
                                </FieldLabel>
                                <input
                                    id="user-report-target"
                                    type="text"
                                    value={form.reportedTarget}
                                    onChange={(e) => patchForm({ reportedTarget: e.target.value })}
                                    className={inputClassName(!!fieldErrors.reportedTarget)}
                                    placeholder="john@example.com or listing name"
                                    aria-invalid={!!fieldErrors.reportedTarget}
                                />
                            </FormField>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Submitting…' : 'Submit Report'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
