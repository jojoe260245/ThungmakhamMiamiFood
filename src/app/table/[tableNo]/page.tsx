"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TableContent({ params }: { params: Promise<{ tableNo: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    params.then(({ tableNo }) => {
      // Redirect to menu page with tableNo and token
      const url = token ? `/?table=${tableNo}&token=${token}` : `/?table=${tableNo}`;
      router.replace(url);
    });
  }, [params, router, token]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4" />
        <p className="text-amber-400 font-bold">กำลังเข้าสู่เมนู...</p>
      </div>
    </div>
  );
}

export default function TablePage({ params }: { params: Promise<{ tableNo: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0D0D]"></div>}>
      <TableContent params={params} />
    </Suspense>
  );
}
