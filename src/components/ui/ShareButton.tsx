'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    className?: string;
}

export default function ShareButton({ title, text, url, className }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, text, url: shareUrl });
                return;
            } catch (err) {
                if ((err as Error).name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={className || 'flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'}
            title="Share"
        >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
    );
}
