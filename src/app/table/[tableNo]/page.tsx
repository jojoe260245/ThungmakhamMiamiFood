"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TablePage({ params }: { params: Promise<{ tableNo: string }> }) {
  const router = useRouter();

  useEffect(() => {
    params.then(({ tableNo }) => {
      // Redirect to menu page with tableNo
      router.replace(`/?table=${tableNo}`);
    });
  }, [params, router]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4" />
        <p className="text-amber-400 font-bold">กำลังเข้าสู่เมนู...</p>
      </div>
    </div>
  );
}
