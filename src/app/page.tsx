import { Suspense } from "react";
import HomePage from "./routes/home/HomePage";

function HomePageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomePageLoader />}>
      <HomePage />
    </Suspense>
  );
}
