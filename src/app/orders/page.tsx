"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const tableNo = searchParams.get("table");
  const token = searchParams.get("token");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  if (!tableNo) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-white p-6">
        <div className="text-center"><div className="text-7xl mb-6">📱</div><h1 className="text-2xl font-black mb-3">กรุณาสแกน QR Code</h1><p className="text-neutral-400 text-sm">สแกน QR ที่โต๊ะเพื่อดูสถานะออเดอร์</p></div>
      </div>
    );
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/table?tableNo=${tableNo}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {} finally { setIsLoading(false); }
  };

  useEffect(() => { setMounted(true); fetchOrders(); const i = setInterval(fetchOrders, 4000); return () => clearInterval(i); }, []);

  const getStatus = (s: string) => {
    switch (s) {
      case 'PENDING': return { label: 'รอรับออเดอร์', color: 'bg-amber-500/20 text-amber-400', icon: '⏳', pct: 25 };
      case 'COOKING': return { label: 'กำลังทำ', color: 'bg-orange-500/20 text-orange-400', icon: '🔥', pct: 60 };
      case 'DONE': return { label: 'พร้อมเสิร์ฟ', color: 'bg-emerald-500/20 text-emerald-400', icon: '✅', pct: 90 };
      case 'SERVED': return { label: 'เสิร์ฟแล้ว', color: 'bg-sky-500/20 text-sky-400', icon: '🍽', pct: 100 };
      case 'CANCELLED': return { label: 'ยกเลิก', color: 'bg-red-500/20 text-red-400', icon: '❌', pct: 0 };
      default: return { label: s, color: 'bg-neutral-800 text-neutral-400', icon: '📋', pct: 0 };
    }
  };

  const menuUrl = token ? `/?table=${tableNo}&token=${token}` : '/';

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans pb-28">
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-xl px-5 py-4 border-b border-neutral-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black">สถานะออเดอร์</h1>
            <p className="text-xs text-neutral-500">โต๊ะ {tableNo} • ThungmakhamMiami<span className="text-amber-500">Food</span></p>
          </div>
          <a href={menuUrl} className="text-sm bg-neutral-800 text-amber-400 px-4 py-2 rounded-xl font-bold hover:bg-neutral-700 transition">← เมนู</a>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-neutral-600">
            <p className="text-6xl mb-4">🍽</p>
            <h2 className="text-xl font-bold text-neutral-400 mb-2">ยังไม่มีออเดอร์</h2>
            <a href={menuUrl} className="bg-amber-500 text-black px-6 py-3 rounded-2xl font-black inline-block mt-4 hover:bg-amber-400 transition shadow-lg shadow-amber-500/30">สั่งอาหาร</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
                  <span className="font-bold text-sm text-neutral-300">Order #{order.id}</span>
                  <span className="text-[10px] text-neutral-600">{mounted && new Date(order.createdAt).toLocaleTimeString('th-TH')}</span>
                </div>
                <div className="p-4 space-y-3">
                  {order.items.map((item: any) => {
                    const c = getStatus(item.status);
                    if (item.status === 'CANCELLED') return (
                      <div key={item.id} className="flex items-center gap-3 opacity-40 line-through">
                        <span className="text-xl">{c.icon}</span>
                        <span className="font-bold text-sm">{item.quantity}x {item.menu?.name}</span>
                      </div>
                    );
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <span className="text-xl">{c.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm">{item.quantity}x {item.menu?.name || `#${item.menuId}`}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>
                          </div>
                          {item.note && <p className="text-[10px] text-neutral-600 mb-1">{item.note}</p>}
                          <div className="w-full bg-neutral-800 rounded-full h-1">
                            <div className={`h-1 rounded-full transition-all duration-1000 ${c.pct >= 90 ? 'bg-emerald-500' : c.pct >= 50 ? 'bg-orange-400' : 'bg-amber-500'}`} style={{ width: `${c.pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button onClick={async () => { await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableNo, type: 'CALL_STAFF', message: 'เรียกพนักงาน' }) }); alert('🔔 เรียกพนักงานเรียบร้อย! พนักงานกำลังมา'); }} className="w-full bg-red-950 border border-red-900 text-red-400 font-bold py-4 rounded-2xl hover:bg-red-900 transition text-base active:scale-95">🔔 เรียกพนักงาน</button>
              <button onClick={async () => { await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableNo, type: 'CHECK_BILL', message: 'ขอเช็คบิล' }) }); alert('💳 ส่งคำขอเช็คบิลแล้ว! พนักงานกำลังเตรียมบิล'); }} className="w-full bg-amber-950 border border-amber-900 text-amber-400 font-bold py-4 rounded-2xl hover:bg-amber-900 transition text-base active:scale-95">💳 ขอเช็คบิล</button>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={async () => { await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableNo, type: 'REQUEST_PLATE', message: 'ขอจาน/ช้อน' }) }); alert('🍽 ขอจาน/ช้อนแล้ว!'); }} className="bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold py-3 rounded-xl text-xs hover:bg-neutral-800 active:scale-95">🍽 จาน/ช้อน</button>
                <button onClick={async () => { await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableNo, type: 'REQUEST_ICE', message: 'ขอน้ำแข็ง' }) }); alert('🧊 ขอน้ำแข็งแล้ว!'); }} className="bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold py-3 rounded-xl text-xs hover:bg-neutral-800 active:scale-95">🧊 น้ำแข็ง</button>
                <button onClick={async () => { await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableNo, type: 'REQUEST_TISSUE', message: 'ขอทิชชู่' }) }); alert('🧻 ขอทิชชู่แล้ว!'); }} className="bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold py-3 rounded-xl text-xs hover:bg-neutral-800 active:scale-95">🧻 ทิชชู่</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-neutral-800 pb-safe z-50">
        <div className="flex items-center justify-around max-w-md mx-auto py-3">
          <a href={menuUrl} className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-neutral-400"><span className="text-xl">🏠</span><span className="text-[10px] font-bold">เมนู</span></a>
          <div className="flex flex-col items-center gap-0.5 text-amber-500"><span className="text-xl">📋</span><span className="text-[10px] font-bold">ออเดอร์</span></div>
        </div>
      </div>
    </div>
  );
}

export default function OrderStatus() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-white">กำลังโหลด...</div>}>
      <OrderStatusContent />
    </Suspense>
  );
}
