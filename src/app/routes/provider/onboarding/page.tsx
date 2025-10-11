"use client";
import { useToast } from "../../../../components/ui/Toast";

export default function ProviderOnboardingPage() {
    const { push } = useToast();
    return (
        <form className="container-app py-8 card p-4 space-y-3" onSubmit={(e) => { e.preventDefault(); push({ title: "Submitted for verification", variant: "success" }); }}>
            <h1 className="text-xl font-bold">Service Provider Onboarding</h1>
            <input className="input" placeholder="Full name / Business name" required />
            <input className="input" placeholder="Type of service (e.g., Cleaning)" required />
            <input className="input" placeholder="Location" required />
            <input className="input" placeholder="Phone / WhatsApp" required />
            <input className="input" placeholder="Years of experience" />
            <input className="input" type="file" accept="image/*" />
            <input className="input" type="file" accept="image/*" />
            <button className="btn btn-primary" type="submit">Submit</button>
        </form>
    );
}



