"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function CashierPOS() {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [discount, setDiscount] = useState<number>(0);
  
  // Shift State
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
    const userStr = localStorage.getItem('thungmakhammiamifood_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetchShift(u.id);
    }
  }, []);

  const fetchShift = async (userId: number) => {
    try {
      const res = await fetch(`/api/cashier/shifts/current?userId=${userId}`);
      const data = await res.json();
      if (data.shift) {
        setShift(data.shift);
        setShiftRevenue(data.revenue);
      } else {
        setOpenShiftModal(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setShiftLoading(false);
    }
  };

  const handleOpenShift = async () => {
    if (!openingCash) return;
    const res = await fetch('/api/cashier/shifts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'OPEN', userId: user.id, openingAmount: parseFloat(openingCash) })
    });
    if (res.ok) {
      setOpenShiftModal(false);
      fetchShift(user.id);
    } else alert('เกิดข้อผิดพลาดในการเปิดกะ');
  };

  const handleCloseShift = async () => {
    if (!closingCash) return;
    const res = await fetch('/api/cashier/shifts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CLOSE', shiftId: shift.id, closingAmount: parseFloat(closingCash) })
    });
    if (res.ok) {
      alert('ปิดกะสำเร็จ!');
      setShift(null);
      setCloseShiftModal(false);
      setOpenShiftModal(true);
    } else alert('เกิดข้อผิดพลาดในการปิดกะ');
  };

  const fetchTables = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      if (data.tables) {
        setTables(data.tables);
        setSelectedTable((prev: any) => {
          if (prev) {
            const updated = data.tables.find((t: any) => t.id === prev.id);
            return updated || prev;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Failed to fetch tables:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (shift) {
      fetchTables();
      const interval = setInterval(fetchTables, 5000);
      return () => clearInterval(interval);
    }
  }, [shift]);

  const calculateSubtotal = (table: any) => {
    if (!table?.orders?.length) return 0;
    return table.orders.reduce((sum: number, order: any) =>
      sum + order.items.reduce((s: number, item: any) => s + (item.price * item.quantity), 0), 0);
  };

  const handleCheckout = async () => {
    if (!selectedTable?.orders?.length || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const subtotal = calculateSubtotal(selectedTable);
      const vat = (subtotal - discount) * 0.07;
      
      for (const order of selectedTable.orders) {
        await fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod, discount, subtotal, vatAmount: vat, total: (subtotal - discount) + vat })
        });
      }
      // Print receipt for the first order as master bill
      const masterOrderId = selectedTable.orders[0].id;
      window.open(`/receipt/${masterOrderId}`, '_blank');
      
      setCheckoutModal(false);
      setDiscount(0);
      setSelectedTable(null);
      fetchTables();
      fetchShift(user.id);
    } catch (error) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleVoidItem = async (itemId: number) => {
    if (!confirm('ยืนยันการยกเลิกรายการนี้ (Void)?')) return;
    try {
      await fetch(`/api/orderItems/${itemId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      fetchTables();
    } catch (e) { alert('ไม่สามารถ Void ได้'); }
  };

  if (shiftLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;

  return (
    <AuthGuard allowedRoles={['CASHIER']}>
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
        
        {/* SHIFT OPEN MODAL */}
        {openShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-3xl">💰</span></div>
              <h2 className="text-2xl font-black mb-2 text-slate-800">เปิดกะการทำงาน</h2>
              <p className="text-slate-500 text-sm mb-6">กรุณาระบุเงินทอนเริ่มต้นในลิ้นชัก</p>
              <input type="number" value={openingCash} onChange={e=>setOpeningCash(e.target.value)} placeholder="จำนวนเงิน (บาท)" className="w-full text-center text-2xl font-bold p-4 bg-slate-100 border-2 border-slate-200 rounded-xl mb-4 focus:outline-none focus:border-amber-500" />
              <button onClick={handleOpenShift} className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600">เปิดกะเริ่มงาน</button>
            </div>
          </div>
        )}

        {/* SHIFT CLOSE MODAL */}
        {closeShiftModal && shift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
              <h2 className="text-2xl font-black mb-4 text-slate-800 text-center">ปิดกะ / สรุปยอด</h2>
              <div className="bg-slate-50 p-4 rounded-xl mb-4 space-y-2 text-sm border border-slate-200">
                <div className="flex justify-between"><span className="text-slate-500">เงินทอนเริ่มต้น:</span><span className="font-bold">฿{shift.openingAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">รายได้ในกะนี้:</span><span className="font-bold text-emerald-600">+ ฿{shiftRevenue.toLocaleString()}</span></div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-lg"><span className="text-slate-800 font-bold">ยอดที่ควรมี:</span><span className="font-black text-slate-800">฿{(shift.openingAmount + shiftRevenue).toLocaleString()}</span></div>
              </div>
              <label className="text-xs text-slate-500 block mb-1">นับเงินสดในลิ้นชักได้จริง (บาท)</label>
              <input type="number" value={closingCash} onChange={e=>setClosingCash(e.target.value)} placeholder="0.00" className="w-full text-center text-2xl font-bold p-4 bg-slate-100 border-2 border-slate-200 rounded-xl mb-4 focus:outline-none focus:border-red-500" />
              <div className="flex gap-2">
                <button onClick={()=>setCloseShiftModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">ยกเลิก</button>
                <button onClick={handleCloseShift} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600">ยืนยันปิดกะ</button>
              </div>
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Animated Background */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[120px] animate-float pointer-events-none"></div>

          <header className="glass-panel border-b border-slate-200/50 p-4 flex justify-between items-center z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-scale-in"><span className="text-xl">💰</span></div>
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Cashier POS</h1>
                <p className="text-xs text-slate-500 font-medium">ThungmakhamMiamiFood</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {shift && <button onClick={()=>setCloseShiftModal(true)} className="text-xs bg-red-100/80 backdrop-blur-md text-red-700 px-3 py-1.5 rounded-xl font-bold hover:bg-red-200 transition-all shadow-sm">🔒 ปิดกะ</button>}
              <a href="/kitchen" className="text-xs bg-orange-100/80 backdrop-blur-md text-orange-700 px-3 py-1.5 rounded-xl font-bold hover:bg-orange-200 transition-all shadow-sm">🔥 Kitchen</a>
              <a href="/bar" className="text-xs bg-blue-100/80 backdrop-blur-md text-blue-700 px-3 py-1.5 rounded-xl font-bold hover:bg-blue-200 transition-all shadow-sm">🍹 Bar</a>
              <a href="/admin" className="text-xs bg-purple-100/80 backdrop-blur-md text-purple-700 px-3 py-1.5 rounded-xl font-bold hover:bg-purple-200 transition-all shadow-sm">⚙ Admin</a>
              {isRefreshing && <span className="text-xs text-emerald-500 font-bold animate-pulse">syncing...</span>}
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map((table) => {
                const hasActive = table.orders?.length > 0;
                const isSelected = selectedTable?.id === table.id;
                const isReserved = table.status === 'RESERVED';
                return (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`aspect-square rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-4 relative group animate-slide-up
                      ${isSelected ? 'ring-4 ring-sky-500/50 scale-95 shadow-inner' : 'hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200'}
                      ${hasActive ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300 shadow-lg shadow-orange-200/50' : isReserved ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 shadow-lg shadow-purple-200/50' : 'glass-panel border-white shadow-sm hover:border-sky-200'}
                    `}
                    style={{ animationDelay: `${(table.id % 10) * 50}ms` }}
                  >
                    <div className={`absolute top-4 right-4 w-3.5 h-3.5 rounded-full shadow-md ${hasActive ? 'bg-orange-500 animate-pulse-glow' : isReserved ? 'bg-purple-500' : 'bg-emerald-400'}`} />
                    <span className={`text-5xl font-black mb-3 transition-colors ${hasActive ? 'text-orange-600' : isReserved ? 'text-purple-600' : 'text-slate-300 group-hover:text-sky-500'}`}>
                      {table.tableNo}
                    </span>
                    {hasActive ? (
                      <span className="text-sm font-black text-orange-800 bg-orange-200/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">฿{calculateSubtotal(table).toLocaleString()}</span>
                    ) : isReserved ? (
                      <span className="text-xs font-black text-purple-600 uppercase tracking-widest">Reserved</span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest opacity-70 group-hover:opacity-100">ว่าง</span>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </div>

        {/* Sidebar - Bill Details */}
        <aside className={`glass-panel border-l border-white/50 flex flex-col transition-all duration-500 z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]
          ${selectedTable ? 'w-full md:w-[450px] translate-x-0' : 'w-0 overflow-hidden border-none translate-x-full'} fixed md:relative right-0 h-screen
        `}>
          {selectedTable && (
            <div className="flex flex-col h-full animate-slide-in-right">
              <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-gradient-to-r from-white/80 to-slate-50/50 backdrop-blur-xl">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Table {selectedTable.tableNo}</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">{selectedTable.orders?.length > 0 ? `${selectedTable.orders.length} order(s) active` : selectedTable.status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>window.open(`/table/${selectedTable.tableNo}`,'_blank')} className="text-xs bg-sky-100 text-sky-700 font-bold px-4 py-2 rounded-xl hover:bg-sky-200 transition-all shadow-sm active:scale-95">➕ รับออเดอร์</button>
                  <button onClick={() => setSelectedTable(null)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-90">✕</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {(!selectedTable.orders || selectedTable.orders.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                    <span className="text-6xl mb-4 opacity-50">🍽</span>
                    <p className="font-medium">โต๊ะว่าง — ยังไม่มีออเดอร์</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTable.orders.map((order: any) => (
                      <div key={order.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed border-slate-200">
                          <span className="font-bold text-slate-700 text-sm">Order #{order.id}</span>
                          <div className="flex gap-2">
                            <button onClick={()=>window.open(`/ticket/${order.id}`,'_blank')} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold hover:bg-slate-300">🖨 พิมพ์</button>
                            <span className="text-[10px] text-slate-400">{mounted && new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item: any) => {
                            const isCancelled = item.status === 'CANCELLED';
                            return (
                              <div key={item.id} className={`flex justify-between text-sm group ${isCancelled ? 'opacity-50 line-through' : ''}`}>
                                <div className="flex gap-2 text-slate-700">
                                  <span className="font-bold text-sky-600 w-6">{item.quantity}x</span>
                                  <div>
                                    <span className="font-medium">{item.menu?.name || `Item #${item.menuId}`}</span>
                                    {item.note && <p className="text-[10px] text-slate-400 mt-0.5">{item.note}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800">฿{item.price * item.quantity}</span>
                                  {!isCancelled && <button onClick={()=>handleVoidItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-500 text-xs font-bold px-1 hover:bg-red-100 rounded">Void</button>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedTable.orders?.length > 0 && (
                <div className="p-5 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                  <div className="flex justify-between items-center mb-2 text-sm text-slate-500">
                    <span>ยอดอาหาร (Subtotal)</span>
                    <span>฿{calculateSubtotal(selectedTable).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm text-slate-500">
                    <span>ส่วนลด (Discount)</span>
                    <input type="number" value={discount} onChange={e=>setDiscount(Number(e.target.value))} className="w-20 text-right bg-slate-100 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="flex justify-between items-center mb-5 text-lg">
                    <span className="text-slate-800 font-bold">ยอดสุทธิ (Total)</span>
                    <span className="text-3xl font-black text-emerald-600">฿{Math.max(0, calculateSubtotal(selectedTable) - discount).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={()=>window.open(`/receipt/${selectedTable.orders[0].id}`,'_blank')} className="py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-sm">🖨 บิลก่อนจ่าย</button>
                    <button onClick={() => setCheckoutModal(true)} className="py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition text-sm">💳 รับชำระเงิน</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Checkout Modal */}
        {checkoutModal && selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm mx-4 p-6 shadow-2xl">
              <h3 className="text-xl font-black text-slate-800 mb-1">เช็คบิล Table {selectedTable.tableNo}</h3>
              <p className="text-sm text-slate-500 mb-6">เลือกช่องทางการชำระเงิน</p>
              <div className="text-center mb-6">
                <span className="text-5xl font-black text-emerald-600">฿{Math.max(0, calculateSubtotal(selectedTable) - discount).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[{ value: 'CASH', label: '💵 เงินสด', color: 'emerald' }, { value: 'PROMPTPAY', label: '📱 โอน', color: 'sky' }, { value: 'CREDIT_CARD', label: '💳 บัตร', color: 'purple' }].map(method => (
                  <button key={method.value} onClick={() => setPaymentMethod(method.value)} className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${ paymentMethod === method.value ? `border-${method.color}-500 bg-${method.color}-50 text-${method.color}-700 shadow-md` : 'border-slate-100 text-slate-600 hover:border-slate-200' }`}>
                    {method.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button disabled={isCheckingOut} onClick={() => setCheckoutModal(false)} className={`py-3 bg-slate-100 text-slate-600 font-bold rounded-xl transition ${isCheckingOut ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'}`}>ยกเลิก</button>
                <button disabled={isCheckingOut} onClick={handleCheckout} className={`py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 ${isCheckingOut ? 'opacity-70 cursor-not-allowed shadow-none' : 'hover:bg-emerald-600 shadow-emerald-500/30'}`}>
                  {isCheckingOut && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {isCheckingOut ? 'กำลังประมวลผล...' : 'ชำระเงิน & พิมพ์ใบเสร็จ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
