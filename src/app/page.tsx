"use client"
import { useEffect, useState } from 'react';

export default function Home() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!backendUrl) {
      setConnected(false);
      return;
    }
    fetch(backendUrl)
      .then(() => setConnected(true))
      .catch(() => setConnected(false));
  }, []);

  return (
    <div style={{ padding: 50, fontSize: 20 }}>
      {connected ? 'Frontend is connected to backend!' : 'Connecting to backend...'}
    </div>
  );
}
