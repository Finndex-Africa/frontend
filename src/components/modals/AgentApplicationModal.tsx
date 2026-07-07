'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    agentApplicationsApi,
    isE164Phone,
    type AgentApplication,
    type AgentApplicationGender,
    type SubmitAgentApplicationDto,
} from '@/services/api/agent-applications.api';
import { getUserFriendlyErrorMessage } from '@/lib/error-messages';

interface AgentApplicationModalProps {
    open: boolean;
    onClose: () => void;
}

type FormState = {
    fullName: string;
    email: string;
    location: string;
    phone: string;
    gender: AgentApplicationGender | '';
};

type FormFieldKey = keyof FormState;
type FormErrors = Partial<Record<FormFieldKey, string>>;

const FIELD_ORDER: FormFieldKey[] = ['fullName', 'email', 'location', 'phone', 'gender'];

const INITIAL_FORM: FormState = {
    fullName: '',
    email: '',
    location: '',
    phone: '',
    gender: '',
};

const GENDER_OPTIONS: { value: AgentApplicationGender; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

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

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
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

function statusLabel(status: AgentApplication['status']): string {
    if (status === 'pending') return 'Pending review';
    if (status === 'approved') return 'Approved';
    return 'Rejected';
}

function statusMessage(application: AgentApplication): string {
    if (application.status === 'pending') {
        return 'Your application is pending review. We will notify you when a decision is made.';
    }
    if (application.status === 'approved') {
        return 'Your application has been approved. You can now use your agent account on FindAfriq.';
    }
    return application.rejectionReason
        ? `Your application was not approved: ${application.rejectionReason}`
        : 'Your application was not approved. You may submit a new application below.';
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

    if (form.location.trim().length < 2) {
        errors.location = 'Please enter your location.';
    }

    if (!form.phone.trim()) {
        errors.phone = 'Please enter your phone number.';
    } else if (!isE164Phone(form.phone)) {
        errors.phone = 'Use international format, e.g. +231886149241.';
    }

    if (!form.gender) {
        errors.gender = 'Please select your gender.';
    }

    return errors;
}

function scrollToFirstFieldError(errors: FormErrors) {
    const firstKey = FIELD_ORDER.find((key) => errors[key]);
    if (!firstKey) return;
    requestAnimationFrame(() => {
        document.getElementById(`agent-app-field-${firstKey}`)?.scrollIntoView({
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
        <div id={`agent-app-field-${fieldKey}`}>
            {children}
            <FieldError message={error} />
        </div>
    );
}

function inputClassName(hasError: boolean): string {
    return hasError ? inputErrorClass : inputNormalClass;
}

function RadioGroup<T extends string>({
    name,
    value,
    options,
    onChange,
    hasError,
}: {
    name: string;
    value: T | '';
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
    hasError?: boolean;
}) {
    return (
        <div
            className={`space-y-2 rounded-lg ${hasError ? 'ring-1 ring-red-500/40 p-2 -m-2' : ''}`}
            role="radiogroup"
            aria-invalid={hasError || undefined}
        >
            {options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => onChange(opt.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                </label>
            ))}
        </div>
    );
}

export default function AgentApplicationModal({ open, onClose }: AgentApplicationModalProps) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [existingApplication, setExistingApplication] = useState<AgentApplication | null>(null);
    const [allowResubmit, setAllowResubmit] = useState(true);

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
        setExistingApplication(null);
        setAllowResubmit(true);
        setForm(prefillFromUser(INITIAL_FORM));

        const token = getAuthToken();
        if (!token) return;

        let cancelled = false;
        setCheckingStatus(true);

        agentApplicationsApi
            .getMyApplication()
            .then((res) => {
                if (cancelled) return;
                const application = res.data;
                if (!application) {
                    setAllowResubmit(true);
                    return;
                }
                setExistingApplication(application);
                setAllowResubmit(application.status === 'rejected');
            })
            .catch(() => {
                if (!cancelled) setAllowResubmit(true);
            })
            .finally(() => {
                if (!cancelled) setCheckingStatus(false);
            });

        return () => {
            cancelled = true;
        };
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

        const payload: SubmitAgentApplicationDto = {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            location: form.location.trim(),
            phone: form.phone.trim(),
            gender: form.gender as AgentApplicationGender,
        };

        try {
            await agentApplicationsApi.submit(payload);
            setSubmitted(true);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr.response?.status === 409) {
                setError('Application already pending for this email.');
            } else {
                setError(getUserFriendlyErrorMessage(err, 'Failed to submit application. Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const showExistingStatus = existingApplication && !allowResubmit && !submitted;

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
                aria-labelledby="agent-application-modal-title"
            >
                <div className="relative flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-200 shrink-0 bg-linear-to-r from-blue-700 to-blue-600 text-white sm:px-6 sm:py-5">
                    <div className="min-w-0 pr-10">
                        <h2 id="agent-application-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight">
                            Become an Agent
                        </h2>
                        <p className="text-sm text-white/90 mt-1">
                            Submit your application for admin review.
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
                    {checkingStatus ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            <p className="mt-4 text-sm">Checking application status…</p>
                        </div>
                    ) : submitted ? (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Application submitted</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Thank you! An admin will review your application. You will receive a notification when a decision is made.
                            </p>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : showExistingStatus && existingApplication ? (
                        <div
                            className={`rounded-xl border p-6 text-center ${
                                existingApplication.status === 'approved'
                                    ? 'border-green-200 bg-green-50'
                                    : existingApplication.status === 'pending'
                                      ? 'border-amber-200 bg-amber-50'
                                      : 'border-red-200 bg-red-50'
                            }`}
                        >
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                Application status: {statusLabel(existingApplication.status)}
                            </p>
                            <p className="text-sm text-gray-700">{statusMessage(existingApplication)}</p>
                            <p className="mt-3 text-xs text-gray-500">
                                Submitted {new Date(existingApplication.createdAt).toLocaleDateString()}
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

                            {existingApplication?.status === 'rejected' && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    {statusMessage(existingApplication)} You may submit a new application below.
                                </div>
                            )}

                            <FormField fieldKey="fullName" error={fieldErrors.fullName}>
                                <FieldLabel htmlFor="agent-app-fullName" required>
                                    Full Name
                                </FieldLabel>
                                <input
                                    id="agent-app-fullName"
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => patchForm({ fullName: e.target.value })}
                                    className={inputClassName(!!fieldErrors.fullName)}
                                    placeholder="Jane Doe"
                                    aria-invalid={!!fieldErrors.fullName}
                                />
                            </FormField>

                            <FormField fieldKey="email" error={fieldErrors.email}>
                                <FieldLabel htmlFor="agent-app-email" required>
                                    Email Address
                                </FieldLabel>
                                <input
                                    id="agent-app-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => patchForm({ email: e.target.value })}
                                    className={inputClassName(!!fieldErrors.email)}
                                    placeholder="jane@example.com"
                                    aria-invalid={!!fieldErrors.email}
                                />
                            </FormField>

                            <FormField fieldKey="location" error={fieldErrors.location}>
                                <FieldLabel htmlFor="agent-app-location" required>
                                    Location
                                </FieldLabel>
                                <input
                                    id="agent-app-location"
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => patchForm({ location: e.target.value })}
                                    className={inputClassName(!!fieldErrors.location)}
                                    placeholder="Monrovia, Liberia"
                                    aria-invalid={!!fieldErrors.location}
                                />
                            </FormField>

                            <FormField fieldKey="phone" error={fieldErrors.phone}>
                                <FieldLabel htmlFor="agent-app-phone" required>
                                    Phone Number (WhatsApp Preferred)
                                </FieldLabel>
                                <input
                                    id="agent-app-phone"
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

                            <FormField fieldKey="gender" error={fieldErrors.gender}>
                                <FieldLabel required>Gender</FieldLabel>
                                <RadioGroup
                                    name="gender"
                                    value={form.gender}
                                    options={GENDER_OPTIONS}
                                    onChange={(value) => patchForm({ gender: value })}
                                    hasError={!!fieldErrors.gender}
                                />
                            </FormField>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Submitting…' : 'Submit Application'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
