
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminToken");
    if (!loggedIn) {
      router.push("/admin/login");
    } else {
      router.push("/admin/dashboard");
    }
  }, [router]);

  return <div>Loading...</div>;
}
