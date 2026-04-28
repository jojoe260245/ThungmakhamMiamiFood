"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('thungmakhammiamifood_user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const role = user.role.toUpperCase();
      
      if (role === 'ADMIN' || allowedRoles.includes(role)) {
        setAuthorized(true);
      } else {
        router.push('/login'); // Or unauthorized page
      }
    } catch (e) {
      localStorage.removeItem('thungmakhammiamifood_user');
      router.push('/login');
    }
  }, [router, allowedRoles]);

  if (!authorized) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-500 font-bold">กำลังตรวจสอบสิทธิ์...</div>;
  }

  return <>{children}</>;
}
