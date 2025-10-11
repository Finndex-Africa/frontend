export default function DashboardPage() {
    return (
        <div className="container-app py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4">
                <div className="text-sm text-gray-600">Saved Properties</div>
                <div className="text-2xl font-bold mt-1">12</div>
            </div>
            <div className="card p-4">
                <div className="text-sm text-gray-600">Active Listings</div>
                <div className="text-2xl font-bold mt-1">3</div>
            </div>
            <div className="card p-4">
                <div className="text-sm text-gray-600">Messages</div>
                <div className="text-2xl font-bold mt-1">5</div>
            </div>
        </div>
    );
}



