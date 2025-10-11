"use client";
import StatusBadge from "../../../components/domain/StatusBadge";
import Button from "../../../components/ui/Button";

export default function AdminPage() {
    const pending = [
        { id: "p1", type: "property", title: "Modern Apartment", owner: "Landlord A" },
        { id: "s1", type: "provider", title: "Sparklynix Cleaning", owner: "Biz B" },
    ];
    return (
        <div className="container-app py-8 space-y-6">
            <section>
                <h1 className="text-xl font-bold mb-3">Dashboard Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card p-4"><div className="text-sm text-gray-600">Users</div><div className="text-2xl font-bold">20,000+</div></div>
                    <div className="card p-4"><div className="text-sm text-gray-600">Properties</div><div className="text-2xl font-bold">1,200</div></div>
                    <div className="card p-4"><div className="text-sm text-gray-600">Service Providers</div><div className="text-2xl font-bold">600</div></div>
                    <div className="card p-4"><div className="text-sm text-gray-600">Revenue</div><div className="text-2xl font-bold">$45k</div></div>
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold mb-2">Verification Queue</h2>
                <div className="space-y-2">
                    {pending.map((item) => (
                        <div key={item.id} className="card p-4 flex items-center justify-between">
                            <div>
                                <div className="font-semibold">{item.title} <StatusBadge status="pending" /></div>
                                <div className="text-sm text-gray-600">Type: {item.type} • Owner: {item.owner}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button className="btn-secondary">Reject</Button>
                                <Button>Approve</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}



