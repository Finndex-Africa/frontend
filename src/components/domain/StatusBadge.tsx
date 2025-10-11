export default function StatusBadge({ status }: { status: "pending" | "approved" | "rented" | "rejected" }) {
    const map: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rented: "bg-blue-100 text-blue-800",
        rejected: "bg-red-100 text-red-800",
    };
    return <span className={`text-xs px-2 py-0.5 rounded ${map[status]}`}>{status}</span>;
}



