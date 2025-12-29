'use client';

import { useEffect } from 'react';

export function AntdWarningSuppress() {
    useEffect(() => {
        // Suppress Ant Design React 19 compatibility warning
        const originalError = console.error;
        console.error = (...args: any[]) => {
            if (
                typeof args[0] === 'string' &&
                args[0].includes('[antd: compatible]')
            ) {
                return;
            }
            originalError.apply(console, args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    return null;
}
