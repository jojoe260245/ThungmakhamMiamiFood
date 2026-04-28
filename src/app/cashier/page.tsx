"use client";
import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function CashierPOS() {
  const [tables, setTables] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [discount, setDiscount] = useState(0);
  const [qrModal, setQrModal] = useState<any>(null);
  const [voidModal, setVoidModal] = useState<any>(null);
  const [voidReason, setVoidReason] = useState("");

  const [user, setUser] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [closeShiftModal, setCloseShiftModal] = useState(false);
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [shiftRevenue, setShiftRevenue] = useState(0);

  useEffect(() => {
    setMounted(true);
    const u = localStorage.getItem('thungmakhammiamifood_user');
    if (u) { const p = JSON.parse(u); setUser(p); fetchShift(p.id); }
  }, []);

  const fetchShift = async (uid: number) => {
    try {
      const r = await fetch(`/api/cashier/shifts/current?userId=${uid}`);
      const d = await r.json();
      if (d.shift) { setShift(d.shift); setShiftRevenue(d.revenue); } else { setOpenShiftModal(true); }
    } catch {} finally { setShiftLoading(false); }
  };

  const handleOpenShift = async () => {
    if (!openingCash) return;
    const r = await fetch('/api/cashier/shifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'OPEN', userId: user.id, openingAmount: parseFloat(openingCash) }) });
    if (r.ok) { setOpenShiftModal(false); fetchShift(user.id); } else alert('เกิดข้อผิดพลาด');
  };

  const handleCloseShift = async () => {
    if (!closingCash) return;
    const r = await fetch('/api/cashier/shifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'CLOSE', shiftId: shift.id, closingAmount: parseFloat(closingCash) }) });
    if (r.ok) { alert('ปิดกะสำเร็จ!'); setShift(null); setCloseShiftModal(false); setOpenShiftModal(true); } else alert('เกิดข้อผิดพลาด');
  };

  const fetchTables = async () => {
    setIsRefreshing(true);
    try {
      const r = await fetch('/api/tables'); const d = await r.json();
      if (d.tables) { setTables(d.tables); setSel((p: any) => p ? d.tables.find((t: any) => t.id === p.id) || p : p); }
    } catch {} finally { setIsRefreshing(false); }
  };

  useEffect(() => { if (shift) { fetchTables(); const i = setInterval(fetchTables, 5000); return () => clearInterval(i); } }, [shift]);

  const calcSub = (t: any) => {
    if (!t?.orders?.length) return 0;
    return t.orders.reduce((s: number, o: any) => s + o.items.filter((i: any) => i.status !== 'CANCELLED').reduce((a: number, i: any) => a + (i.priceAtOrder || i.menu?.price || 0) * i.quantity, 0), 0);
  };

  const handleCheckout = async () => {
    if (!sel?.orders?.length || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const r = await fetch(`/api/orders/${sel.orders[0].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentMethod, discount, checkoutAll: true }) });
      if (r.ok) { setCheckoutModal(false); setDiscount(0); setSel(null); fetchTables(); fetchShift(user.id); }
    } catch { alert('เกิดข้อผิดพลาด'); } finally { setIsCheckingOut(false); }
  };

  const handleVoidItem = async () => {
    if (!voidModal || !voidReason.trim()) { alert('กรุณาระบุเหตุผล'); return; }
    try {
      await fetch(`/api/orderItems/${voidModal.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CANCELLED', voidReason }) });
      setVoidModal(null); setVoidReason(""); fetchTables();
    } catch { alert('ไม่สามารถ Void ได้'); }
  };

  const showQR = async (tableNo: string) => {
    try {
      const r = await fetch(`/api/qrcode?tableNo=${tableNo}`); const d = await r.json();
      if (d.qrCode) setQrModal({ tableNo, qrCode: d.qrCode, url: d.url });
    } catch { alert('ไม่สามารถสร้าง QR ได้'); }
  };

  const handleLogout = () => { if (confirm('ต้องการออกจากระบบ?')) { localStorage.removeItem('thungmakhammiamifood_user'); window.location.href = '/login'; } };

  if (shiftLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3"></div>Loading...</div>;

  return (
    <AuthGuard allowedRoles={['CASHIER','ADMIN']}>
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">

        {/* Shift Open Modal */}
        {openShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-3xl">💰</span></div>
              <h2 className="text-2xl font-black mb-2 text-slate-800">เปิดกะการทำงาน</h2>
              <p className="text-slate-500 text-sm mb-6">ระบุเงินทอนเริ่มต้น</p>
              <input type="number" value={openingCash} onChange={e => setOpeningCash(e.target.value)} placeholder="จำนวนเงิน (บาท)" className="w-full text-center text-2xl font-bold p-4 bg-slate-100 border-2 border-slate-200 rounded-xl mb-4 focus:outline-none focus:border-amber-500" />
              <button onClick={handleOpenShift} className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600">เปิดกะเริ่มงาน</button>
            </div>
          </div>
        )}

        {/* Shift Close Modal */}
        {closeShiftModal && shift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
              <h2 className="text-2xl font-black mb-4 text-slate-800 text-center">ปิดกะ / สรุปยอด</h2>
              <div className="bg-slate-50 p-4 rounded-xl mb-4 space-y-2 text-sm border border-slate-200">
                <div className="flex justify-between"><span className="text-slate-500">เงินเริ่มต้น:</span><span className="font-bold">฿{shift.openingAmount?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">รายได้ในกะ:</span><span className="font-bold text-emerald-600">+ ฿{shiftRevenue.toLocaleString()}</span></div>
                <div className="flex justify-between pt-2 border-t text-lg"><span className="font-bold">ยอดที่ควรมี:</span><span className="font-black">฿{(shift.openingAmount + shiftRevenue).toLocaleString()}</span></div>
              </div>
              <input type="number" value={closingCash} onChange={e => setClosingCash(e.target.value)} placeholder="นับเงินจริง (บาท)" className="w-full text-center text-2xl font-bold p-4 bg-slate-100 border-2 border-slate-200 rounded-xl mb-4 focus:outline-none focus:border-red-500" />
              <div className="flex gap-2">
                <button onClick={() => setCloseShiftModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">ยกเลิก</button>
                <button onClick={handleCloseShift} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600">ยืนยันปิดกะ</button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {qrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setQrModal(null)}>
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-black text-slate-800 mb-2">QR Code โต๊ะ {qrModal.tableNo}</h2>
              <p className="text-sm text-slate-500 mb-4">ให้ลูกค้าสแกนเพื่อสั่งอาหาร</p>
              <img src={qrModal.qrCode} alt="QR Code" className="w-64 h-64 mx-auto mb-4 border-4 border-slate-100 rounded-2xl" />
              <p className="text-xs text-slate-400 mb-4 break-all">{qrModal.url}</p>
              <div className="flex gap-2">
                <button onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(`<html><body style="text-align:center;font-family:sans-serif"><h1>โต๊ะ ${qrModal.tableNo}</h1><img src="${qrModal.qrCode}" style="width:300px"/><p style="font-size:12px">${qrModal.url}</p><script>window.print()</script></body></html>`); } }} className="flex-1 py-3 bg-sky-500 text-white font-bold rounded-xl">🖨 พิมพ์ QR</button>
                <button onClick={() => setQrModal(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">ปิด</button>
              </div>
            </div>
          </div>
        )}

        {/* Void Modal */}
        {voidModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-black text-slate-800 mb-2">Void: {voidModal.menu?.name}</h3>
              <p className="text-sm text-slate-500 mb-4">กรุณาระบุเหตุผลในการยกเลิก</p>
              <textarea value={voidReason} onChange={e => setVoidReason(e.target.value)} placeholder="เหตุผล..." className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl mb-4 focus:outline-none focus:border-red-500" rows={2} />
              <div className="flex gap-2">
                <button onClick={() => { setVoidModal(null); setVoidReason(""); }} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">ยกเลิก</button>
                <button onClick={handleVoidItem} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl">ยืนยัน Void</button>
              </div>
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 p-4 flex justify-between items-center z-10 sticky top-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><span className="text-xl">💰</span></div>
              <div>
                <h1 className="text-xl font-black text-slate-800">Cashier POS</h1>
                <p className="text-xs text-slate-500">ThungmakhamMiamiFood {user?.name && `• ${user.name}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {shift && <button onClick={() => setCloseShiftModal(true)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-xl font-bold hover:bg-red-200">🔒 ปิดกะ</button>}
              <a href="/kitchen" className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-xl font-bold hover:bg-orange-200">🔥 ครัว</a>
              <a href="/bar" className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl font-bold hover:bg-blue-200">🍹 บาร์</a>
              <a href="/staff" className="text-xs bg-teal-100 text-teal-700 px-3 py-1.5 rounded-xl font-bold hover:bg-teal-200">🏃 เสิร์ฟ</a>
              <a href="/admin" className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl font-bold hover:bg-purple-200">⚙ แอดมิน</a>
              <button onClick={handleLogout} className="text-xs bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-300">🚪 ออก</button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map(table => {
                const hasActive = table.orders?.length > 0;
                const isSelected = sel?.id === table.id;
                const isReserved = table.status === 'RESERVED';
                return (
                  <div key={table.id} onClick={() => setSel(table)}
                    className={`aspect-square rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-4 relative group
                      ${isSelected ? 'ring-4 ring-sky-500/50 scale-95' : 'hover:-translate-y-1 hover:shadow-xl'}
                      ${hasActive ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300 shadow-lg' : isReserved ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:border-sky-200'}`}>
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${hasActive ? 'bg-orange-500 animate-pulse' : isReserved ? 'bg-purple-500' : 'bg-emerald-400'}`} />
                    <span className={`text-4xl font-black mb-2 ${hasActive ? 'text-orange-600' : isReserved ? 'text-purple-600' : 'text-slate-300 group-hover:text-sky-500'}`}>{table.tableNo}</span>
                    {hasActive ? (
                      <span className="text-sm font-bold text-orange-800 bg-orange-200/80 px-3 py-1 rounded-full">฿{calcSub(table).toLocaleString()}</span>
                    ) : isReserved ? (
                      <span className="text-xs font-bold text-purple-600">จองแล้ว</span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-500">ว่าง</span>
                    )}
                    {/* QR Button */}
                    <button onClick={e => { e.stopPropagation(); showQR(table.tableNo); }} className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-sky-500 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sky-600" title="QR Code">QR</button>
                  </div>
                );
              })}
            </div>
          </main>
        </div>

        {/* Sidebar */}
        <aside className={`bg-white border-l border-slate-200 flex flex-col transition-all duration-500 z-20 shadow-xl
          ${sel ? 'w-full md:w-[450px]' : 'w-0 overflow-hidden border-none'} fixed md:relative right-0 h-screen`}>
          {sel && (
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">โต๊ะ {sel.tableNo}</h2>
                  <p className="text-sm text-slate-500">{sel.orders?.length > 0 ? `${sel.orders.length} ออเดอร์` : sel.status === 'AVAILABLE' ? 'ว่าง' : sel.status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => showQR(sel.tableNo)} className="text-xs bg-sky-100 text-sky-700 font-bold px-3 py-2 rounded-xl hover:bg-sky-200">📱 QR</button>
                  <button onClick={() => window.open(`/table/${sel.tableNo}`, '_blank')} className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-2 rounded-xl hover:bg-emerald-200">➕ สั่ง</button>
                  <button onClick={() => setSel(null)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200">✕</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {(!sel.orders || sel.orders.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                    <span className="text-6xl mb-4 opacity-50">🍽</span>
                    <p className="font-bold mb-2">โต๊ะว่าง</p>
                    <button onClick={() => showQR(sel.tableNo)} className="bg-sky-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-sky-600">📱 สร้าง QR สั่งอาหาร</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sel.orders.map((order: any) => (
                      <div key={order.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed border-slate-200">
                          <span className="font-bold text-slate-700 text-sm">Order #{order.id}</span>
                          <div className="flex gap-1">
                            <button onClick={() => window.open(`/ticket/${order.id}`, '_blank')} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold hover:bg-slate-300">🖨 พิมพ์</button>
                            <span className="text-[10px] text-slate-400">{mounted && new Date(order.createdAt).toLocaleTimeString('th-TH')}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item: any) => {
                            const cancelled = item.status === 'CANCELLED';
                            const price = item.priceAtOrder || item.menu?.price || 0;
                            return (
                              <div key={item.id} className={`flex justify-between text-sm group ${cancelled ? 'opacity-40 line-through' : ''}`}>
                                <div className="flex gap-2 text-slate-700">
                                  <span className="font-bold text-sky-600 w-6">{item.quantity}x</span>
                                  <div>
                                    <span className="font-medium">{item.menu?.name || `#${item.menuId}`}</span>
                                    {item.note && <p className="text-[10px] text-slate-400">{item.note}</p>}
                                    {cancelled && item.voidReason && <p className="text-[10px] text-red-400">Void: {item.voidReason}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800">฿{(price * item.quantity).toLocaleString()}</span>
                                  {!cancelled && <button onClick={() => setVoidModal(item)} className="opacity-0 group-hover:opacity-100 text-red-500 text-xs font-bold px-1 hover:bg-red-100 rounded">Void</button>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {sel.orders?.length > 0 && (
                <div className="p-5 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                  <div className="flex justify-between items-center mb-2 text-sm text-slate-500">
                    <span>ยอดรวม</span><span>฿{calcSub(sel).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm text-slate-500">
                    <span>ส่วนลด</span>
                    <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-20 text-right bg-slate-100 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-800 font-bold">ยอดสุทธิ</span>
                    <span className="text-3xl font-black text-emerald-600">฿{Math.max(0, calcSub(sel) - discount).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => window.open(`/receipt/${sel.orders[0].id}`, '_blank')} className="py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 text-sm">🖨 บิลก่อนจ่าย</button>
                    <button onClick={() => setCheckoutModal(true)} className="py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 text-sm">💳 รับชำระเงิน</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Checkout Modal */}
        {checkoutModal && sel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm mx-4 p-6 shadow-2xl">
              <h3 className="text-xl font-black text-slate-800 mb-1">เช็คบิล โต๊ะ {sel.tableNo}</h3>
              <p className="text-sm text-slate-500 mb-6">เลือกช่องทางชำระเงิน</p>
              <div className="text-center mb-6">
                <span className="text-5xl font-black text-emerald-600">฿{Math.max(0, calcSub(sel) - discount).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[{ v: 'CASH', l: '💵 เงินสด' }, { v: 'PROMPTPAY', l: '📱 โอน' }, { v: 'CREDIT_CARD', l: '💳 บัตร' }].map(m => (
                  <button key={m.v} onClick={() => setPaymentMethod(m.v)} className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${paymentMethod === m.v ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}>{m.l}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button disabled={isCheckingOut} onClick={() => setCheckoutModal(false)} className="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">ยกเลิก</button>
                <button disabled={isCheckingOut} onClick={handleCheckout} className={`py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 ${isCheckingOut ? 'opacity-70' : 'hover:bg-emerald-600'}`}>
                  {isCheckingOut && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {isCheckingOut ? 'กำลังประมวลผล...' : 'ชำระเงิน'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
