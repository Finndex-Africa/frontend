export default function Footer() {
    return (
        <footer className="mt-16 border-t border-gray-100 bg-white">
            <div className="container-app py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
                <div>
                    <div className="font-extrabold text-lg">FINNDEX AFRICA</div>
                    <p className="text-gray-600 mt-2">A digital real estate and services platform connecting seekers with trusted providers.</p>
                </div>
                <div>
                    <div className="font-semibold mb-2">Explore</div>
                    <ul className="space-y-1 text-gray-600">
                        <li><a href="/routes/properties">Properties</a></li>
                        <li><a href="/routes/services">Services</a></li>
                    </ul>
                </div>
                <div>
                    <div className="font-semibold mb-2">For Partners</div>
                    <ul className="space-y-1 text-gray-600">
                        <li><a href="/routes/login">List your property</a></li>
                        <li><a href="/routes/login">Become a provider</a></li>
                    </ul>
                </div>
                <div>
                    <div className="font-semibold mb-2">Company</div>
                    <ul className="space-y-1 text-gray-600">
                        <li><a href="/routes/about">About</a></li>
                        <li><a href="/routes/help">Help Center</a></li>
                        <li><a href="/routes/terms">Terms</a></li>
                    </ul>
                </div>
            </div>
            <div className="container-app py-4 border-t border-gray-100 text-xs text-gray-500">© 2025 Finndex Africa</div>
        </footer>
    );
}



