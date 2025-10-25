"use client";
import "../../sentry.client.config";
import { PropsWithChildren } from "react";

export default function SentryInit({ children }: PropsWithChildren) {
    return <>{children}</>;
}
