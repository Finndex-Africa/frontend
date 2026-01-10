'use client';

interface FeedbackModalProps {
    open: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 text-white flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-3 mb-2 pr-10">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">Leave Us Feedback</h2>
                            <p className="text-white/90 text-sm mt-1">
                                Your input helps us improve our platform
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-white/80"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                            />
                        </svg>
                        <span className="text-white/80">Your feedback is completely anonymous</span>
                    </div>
                </div>

                {/* Form Container */}
                <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 min-h-0">
                    <div className="h-full rounded-xl overflow-hidden bg-white border border-gray-200 shadow-inner" style={{ minHeight: '500px' }}>
                        <iframe
                            src="https://docs.google.com/forms/d/e/1FAIpQLSeT8pF9i_Mwu4GgZtvTmvBu-HApsM1yuGPEMCpyGNuMZSG3Tg/viewform?embedded=true"
                            width="100%"
                            height="800"
                            frameBorder="0"
                            marginHeight={0}
                            marginWidth={0}
                            className="w-full border-0"
                            style={{ minHeight: '600px', height: 'calc(90vh - 200px)' }}
                            title="Feedback Form"
                            loading="lazy"
                        >
                            <div className="flex items-center justify-center p-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading feedback form...</p>
                                </div>
                            </div>
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}
