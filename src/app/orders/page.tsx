"use client";

import { useState, useEffect } from "react";

export default function OrderStatus() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const tableNo = "05";

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/table?tableNo=${tableNo}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { setMounted(true); fetchOrders(); const i = setInterval(fetchOrders, 5000); return () => clearInterval(i); }, []);

  const getStatus = (s: string) => {
    switch (s) {
      case 'PENDING': return { label: 'รอรับออเดอร์', color: 'bg-amber-500/20 text-amber-400', icon: '⏳', pct: 25 };
      case 'COOKING': return { label: 'กำลังทำ', color: 'bg-orange-500/20 text-orange-400', icon: '🔥', pct: 60 };
      case 'DONE': return { label: 'เสร็จแล้ว', color: 'bg-emerald-500/20 text-emerald-400', icon: '✅', pct: 90 };
      case 'SERVED': return { label: 'เสิร์ฟแล้ว', color: 'bg-sky-500/20 text-sky-400', icon: '🍽', pct: 100 };
      default: return { label: s, color: 'bg-neutral-800 text-neutral-400', icon: '📋', pct: 0 };
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans pb-28">
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-xl px-5 py-4 border-b border-neutral-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black">สถานะออเดอร์</h1>
            <p className="text-xs text-neutral-500">Table {tableNo} • ThungmakhamMiami<span className="text-amber-500">Food</span></p>
          </div>
          <a href="/" className="text-sm bg-neutral-800 text-amber-400 px-4 py-2 rounded-xl font-bold hover:bg-neutral-700 transition">← เมนู</a>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-neutral-600">
            <p className="text-6xl mb-4">🍽</p>
            <h2 className="text-xl font-bold text-neutral-400 mb-2">ยังไม่มีออเดอร์</h2>
            <a href="/" className="bg-amber-500 text-black px-6 py-3 rounded-2xl font-black inline-block mt-4 hover:bg-amber-400 transition shadow-lg shadow-amber-500/30">ดูเมนู</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
                  <span className="font-bold text-sm text-neutral-300">Order #{order.id}</span>
                  <span className="text-[10px] text-neutral-600">{mounted && new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="p-4 space-y-3">
                  {order.items.map((item: any) => {
                    const c = getStatus(item.status);
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
            <button className="w-full bg-red-950 border border-red-900 text-red-400 font-bold py-4 rounded-2xl hover:bg-red-900 transition text-base">🔔 เรียกพนักงาน</button>
            <button className="w-full bg-amber-950 border border-amber-900 text-amber-400 font-bold py-4 rounded-2xl hover:bg-amber-900 transition text-base">💳 เรียกเช็คบิล</button>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-neutral-800 pb-safe z-50">
        <div className="flex items-center justify-around max-w-md mx-auto py-3">
          <a href="/" className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-neutral-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" /></svg>
            <span className="text-[10px] font-bold">เมนู</span>
          </a>
          <div className="flex flex-col items-center gap-0.5 text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
            <span className="text-[10px] font-bold">ออเดอร์</span>
          </div>
        </div>
      </div>
    </div>
  );
}
