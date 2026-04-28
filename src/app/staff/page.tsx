"use client";
import { useState, useEffect, useRef } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function StaffPage() {
  const [readyItems, setReadyItems] = useState<any[]>([]);
  const [serviceReqs, setServiceReqs] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'serve'|'requests'|'tables'>('requests');
  const [isAlarm, setIsAlarm] = useState(false);
  const [billModal, setBillModal] = useState<any>(null);
  const prevReqCount = useRef(0);

  const fetchAll = async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/orders/active').then(r => r.json()),
        fetch('/api/service-requests').then(r => r.json()),
        fetch('/api/tables').then(r => r.json()),
      ]);
      if (r1.orders) {
        const items: any[] = [];
        r1.orders.forEach((o: any) => o.items.forEach((i: any) => {
          if (i.status === 'DONE') items.push({ ...i, orderId: o.id, tableNo: o.table?.tableNo, orderCreatedAt: o.createdAt });
        }));
        setReadyItems(items);
      }
      if (r2.requests) {
        const pending = r2.requests.filter((r: any) => r.status === 'PENDING');
        // Sound alarm for new requests
        if (pending.length > prevReqCount.current) {
          setIsAlarm(true);
          const audio = document.getElementById('staff-alarm') as HTMLAudioElement;
          if (audio) { audio.loop = true; audio.play().catch(() => {}); }
        }
        prevReqCount.current = pending.length;
        setServiceReqs(r2.requests);
      }
      if (r3.tables) setTables(r3.tables);
    } catch {}
  };

  useEffect(() => { setMounted(true); fetchAll(); const i = setInterval(fetchAll, 3000); return () => clearInterval(i); }, []);

  const acknowledgeAlarm = () => {
    setIsAlarm(false);
    const audio = document.getElementById('staff-alarm') as HTMLAudioElement;
    if (audio) { audio.pause(); audio.currentTime = 0; }
  };

  const ackRequest = async (id: number) => {
    await fetch('/api/service-requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchAll();
  };

  const markServed = async (itemId: number) => {
    await fetch(`/api/orderItems/${itemId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'SERVED' }) });
    fetchAll();
  };

  const showBill = (table: any) => {
    if (!table.orders?.length) return;
    const paidOrders = table.orders.filter((o: any) => o.status === 'PAID');
    if (paidOrders.length > 0) {
      setBillModal({ table, orders: paidOrders, type: 'PAID' });
    } else {
      setBillModal({ table, orders: table.orders, type: 'PENDING' });
    }
  };

  const calcTableTotal = (orders: any[]) => {
    return orders.reduce((s: number, o: any) => s + o.items.filter((i: any) => i.status !== 'CANCELLED').reduce((a: number, i: any) => a + (i.priceAtOrder || i.menu?.price || 0) * i.quantity, 0), 0);
  };

  const handleLogout = () => { if (confirm('ออกจากระบบ?')) { localStorage.removeItem('thungmakhammiamifood_user'); window.location.href = '/login'; } };

  const pendingReqs = serviceReqs.filter(r => r.status === 'PENDING');
  const getReqIcon = (type: string) => {
    switch(type) {
      case 'CALL_STAFF': return '🔔';
      case 'CHECK_BILL': return '💳';
      case 'REQUEST_PLATE': return '🍽';
      case 'REQUEST_ICE': return '🧊';
      case 'REQUEST_TISSUE': return '🧻';
      default: return '📋';
    }
  };
  const getReqLabel = (type: string) => {
    switch(type) {
      case 'CALL_STAFF': return 'เรียกพนักงาน';
      case 'CHECK_BILL': return 'ขอเช็คบิล';
      case 'REQUEST_PLATE': return 'ขอจาน/ช้อน';
      case 'REQUEST_ICE': return 'ขอน้ำแข็ง';
      case 'REQUEST_TISSUE': return 'ขอทิชชู่';
      default: return type;
    }
  };

  return (
    <AuthGuard allowedRoles={['CASHIER','ADMIN','KITCHEN','BAR']}>
      <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">
        <audio id="staff-alarm" src="/notification.mp3" preload="auto"></audio>

        {/* Alarm Banner */}
        {isAlarm && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white font-black p-4 flex justify-between items-center animate-pulse shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div><h2 className="text-lg">มีคำขอจากลูกค้า!</h2><p className="text-sm font-medium opacity-90">{pendingReqs.length} รายการรอดำเนินการ</p></div>
            </div>
            <button onClick={acknowledgeAlarm} className="bg-white text-red-600 px-6 py-3 rounded-xl font-black hover:bg-slate-100 active:scale-95 transition-all">✅ รับทราบ</button>
          </div>
        )}

        {/* Header */}
        <header className={`sticky ${isAlarm ? 'top-[72px]' : 'top-0'} z-50 bg-[#0D0D0D]/90 backdrop-blur-xl px-5 py-4 border-b border-neutral-800`}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"><span className="text-xl">🏃</span></div>
              <div>
                <h1 className="text-xl font-black">Staff / Runner</h1>
                <p className="text-xs text-neutral-500">ThungmakhamMiami<span className="text-amber-500">Food</span></p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="/cashier" className="text-xs bg-emerald-900 text-emerald-300 px-3 py-2 rounded-xl font-bold hover:bg-emerald-800">💰 แคชเชียร์</a>
              <button onClick={handleLogout} className="text-xs bg-neutral-800 text-neutral-400 px-3 py-2 rounded-xl font-bold hover:bg-neutral-700">🚪 ออก</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button onClick={() => setTab('requests')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'requests' ? 'bg-red-500 text-white shadow-lg' : 'bg-neutral-800 text-neutral-400'}`}>
              🔔 คำขอ {pendingReqs.length > 0 && <span className="ml-1 bg-white text-red-500 text-xs px-1.5 py-0.5 rounded-full">{pendingReqs.length}</span>}
            </button>
            <button onClick={() => setTab('serve')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'serve' ? 'bg-teal-500 text-white shadow-lg' : 'bg-neutral-800 text-neutral-400'}`}>
              🍽 เสิร์ฟ {readyItems.length > 0 && <span className="ml-1 bg-white text-teal-500 text-xs px-1.5 py-0.5 rounded-full">{readyItems.length}</span>}
            </button>
            <button onClick={() => setTab('tables')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'tables' ? 'bg-amber-500 text-black shadow-lg' : 'bg-neutral-800 text-neutral-400'}`}>
              🪑 โต๊ะ
            </button>
          </div>
        </header>

        <main className="p-4 max-w-4xl mx-auto">
          {/* Tab: Service Requests */}
          {tab === 'requests' && (
            <div className="space-y-3">
              {pendingReqs.length === 0 ? (
                <div className="text-center py-20 text-neutral-600"><p className="text-6xl mb-4">✅</p><h2 className="text-xl font-bold text-neutral-400">ไม่มีคำขอ</h2></div>
              ) : pendingReqs.map(req => {
                const mins = mounted ? Math.floor((Date.now() - new Date(req.createdAt).getTime()) / 60000) : 0;
                return (
                  <div key={req.id} className={`rounded-2xl border p-4 flex items-center gap-4 ${req.type === 'CHECK_BILL' ? 'bg-amber-950 border-amber-800' : req.type === 'CALL_STAFF' ? 'bg-red-950 border-red-800 animate-pulse' : 'bg-neutral-900 border-neutral-800'}`}>
                    <span className="text-4xl">{getReqIcon(req.type)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-2xl font-black text-white">โต๊ะ {req.tableNo}</span>
                        <span className="text-xs text-neutral-500">{mins} นาทีที่แล้ว</span>
                      </div>
                      <p className="text-sm font-bold text-neutral-300 mt-1">{getReqLabel(req.type)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => ackRequest(req.id)} className="px-4 py-2 bg-teal-500 text-white font-bold rounded-xl text-sm hover:bg-teal-600 active:scale-95">✅ รับแล้ว</button>
                      {req.type === 'CHECK_BILL' && (
                        <button onClick={() => { const t = tables.find((t: any) => t.tableNo === String(req.tableNo)); if (t) showBill(t); }} className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 active:scale-95">💳 ดูบิล</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab: Ready to Serve */}
          {tab === 'serve' && (
            <div className="space-y-3">
              {readyItems.length === 0 ? (
                <div className="text-center py-20 text-neutral-600"><p className="text-6xl mb-4">✅</p><h2 className="text-xl font-bold text-neutral-400">ไม่มีอาหารรอเสิร์ฟ</h2></div>
              ) : readyItems.map(item => {
                const mins = mounted ? Math.floor((Date.now() - new Date(item.orderCreatedAt).getTime()) / 60000) : 0;
                return (
                  <div key={item.id} className={`rounded-2xl border p-4 flex items-center gap-4 ${mins > 10 ? 'bg-red-950 border-red-800 animate-pulse' : 'bg-neutral-900 border-neutral-800'}`}>
                    <span className="text-3xl">{item.menu?.isDrink ? '🍹' : '🍳'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-xl font-black text-teal-400">โต๊ะ {item.tableNo || '?'}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${mins > 10 ? 'bg-red-500 text-white' : 'bg-teal-500/20 text-teal-400'}`}>{mins} นาที</span>
                      </div>
                      <p className="font-bold text-lg mt-1">{item.quantity}x {item.menu?.name}</p>
                      {item.note && <p className="text-xs text-neutral-500 mt-1">📝 {item.note}</p>}
                    </div>
                    <button onClick={() => markServed(item.id)} className="px-5 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 active:scale-95 transition-all shadow-lg text-sm">🍽 เสิร์ฟแล้ว</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab: Tables Overview */}
          {tab === 'tables' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {tables.map(table => {
                const hasOrders = table.orders?.length > 0;
                const total = hasOrders ? calcTableTotal(table.orders) : 0;
                return (
                  <div key={table.id} onClick={() => hasOrders && showBill(table)}
                    className={`rounded-2xl border p-4 text-center cursor-pointer transition-all hover:-translate-y-1 ${hasOrders ? 'bg-amber-950 border-amber-800' : 'bg-neutral-900 border-neutral-800'}`}>
                    <span className={`text-3xl font-black ${hasOrders ? 'text-amber-400' : 'text-neutral-600'}`}>{table.tableNo}</span>
                    {hasOrders ? (
                      <p className="text-sm font-bold text-amber-300 mt-1">฿{total.toLocaleString()}</p>
                    ) : (
                      <p className="text-xs text-neutral-600 mt-1">ว่าง</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Bill Modal */}
        {billModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setBillModal(null)}>
            <div className="bg-white text-black rounded-3xl max-w-sm w-full mx-4 p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-4">
                <h2 className="text-2xl font-black">โต๊ะ {billModal.table.tableNo}</h2>
                <p className="text-sm text-slate-500">{billModal.type === 'PAID' ? '✅ ชำระเงินแล้ว' : '⏳ รอแคชเชียร์เช็คบิล'}</p>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {billModal.orders.map((order: any) => order.items.filter((i: any) => i.status !== 'CANCELLED').map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm border-b border-dashed border-slate-200 py-1">
                    <span>{item.quantity}x {item.menu?.name}</span>
                    <span className="font-bold">฿{((item.priceAtOrder || item.menu?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                )))}
              </div>

              {/* Total */}
              <div className="border-t-2 border-black pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">ยอดรวม</span>
                  <span className="text-3xl font-black text-emerald-600">฿{calcTableTotal(billModal.orders).toLocaleString()}</span>
                </div>
              </div>

              {/* PromptPay QR Section */}
              {billModal.type === 'PENDING' && (
                <div className="text-center bg-sky-50 p-4 rounded-2xl mb-4">
                  <p className="text-sm font-bold text-sky-800 mb-2">📱 สแกนจ่ายเงิน PromptPay</p>
                  <div className="bg-white p-3 rounded-xl inline-block mb-2">
                    <img src={`https://promptpay.io/0812345678/${calcTableTotal(billModal.orders)}.png`} alt="PromptPay QR" className="w-48 h-48" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <p className="text-xs text-sky-600">PromptPay: 081-234-5678</p>
                </div>
              )}

              <div className="flex gap-2">
                {billModal.type === 'PAID' && (
                  <button onClick={() => { window.open(`/receipt/${billModal.orders[0].id}`, '_blank'); }} className="flex-1 py-3 bg-purple-500 text-white font-bold rounded-xl text-sm">🖨 ดูใบเสร็จ</button>
                )}
                <button onClick={() => setBillModal(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">ปิด</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
