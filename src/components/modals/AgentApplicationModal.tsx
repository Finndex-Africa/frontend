'use client';

import { AGENT_APPLICATION_FORM_EMBED_URL } from '@/config/marketing-links';

interface AgentApplicationModalProps {
    open: boolean;
    onClose: () => void;
}

export default function AgentApplicationModal({
    open,
    onClose,
}: AgentApplicationModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 py-4 sm:px-6 sm:py-6"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-[min(1200px,100vw-1.5rem)] max-h-[min(920px,calc(100vh-2rem))] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="agent-application-modal-title"
            >
                <div className="relative flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-200 shrink-0 bg-linear-to-r from-blue-700 to-blue-600 text-white sm:px-6 sm:py-5">
                    <div className="min-w-0 pr-10">
                        <h2
                            id="agent-application-modal-title"
                            className="text-xl sm:text-2xl font-bold tracking-tight"
                        >
                            Become an Agent
                        </h2>
                        <p className="text-sm text-white/90 mt-1">
                            Complete the application below — you can scroll inside the form.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 shrink-0 rounded-lg p-2 text-white/90 hover:bg-white/15 hover:text-white transition-colors z-10"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 min-h-0 bg-gray-50 p-3 sm:p-4">
                    <div className="h-full rounded-xl overflow-hidden bg-white border border-gray-200 shadow-inner relative min-h-[min(560px,calc(100vh-220px))]">
                        <iframe
                            src={AGENT_APPLICATION_FORM_EMBED_URL}
                            title="Agent application form"
                            className="absolute inset-0 w-full h-full border-0"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
