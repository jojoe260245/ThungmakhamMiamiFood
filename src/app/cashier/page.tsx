"use client";

import { useState, useEffect } from "react";

export default function CashierPOS() {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

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
    setMounted(true);
    fetchTables();
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateTotal = (table: any) => {
    if (!table?.orders?.length) return 0;
    return table.orders.reduce((sum: number, order: any) =>
      sum + order.items.reduce((s: number, item: any) => s + (item.price * item.quantity), 0), 0);
  };

  const handleCheckout = async () => {
    if (!selectedTable?.orders?.length) return;
    try {
      // Checkout all open orders for this table
      for (const order of selectedTable.orders) {
        await fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod })
        });
      }
      alert(`✅ เช็คบิลสำเร็จ!\nTable ${selectedTable.tableNo}\nTotal: ฿${calculateTotal(selectedTable)}\nPayment: ${paymentMethod}`);
      setCheckoutModal(false);
      setSelectedTable(null);
      fetchTables();
    } catch (error) {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
      {/* Tables Grid */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Cashier POS</h1>
              <p className="text-xs text-slate-500">TKMFOOD — Table Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/kitchen" className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-200 transition">🔥 Kitchen</a>
            <a href="/bar" className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition">🍹 Bar</a>
            <a href="/admin" className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200 transition">⚙ Admin</a>
            {isRefreshing && <span className="text-xs text-slate-400 animate-pulse">syncing...</span>}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((table) => {
              const hasActive = table.orders?.length > 0;
              const isSelected = selectedTable?.id === table.id;
              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`aspect-square rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center p-4 relative group
                    ${isSelected ? 'ring-4 ring-sky-500/50 scale-95' : 'hover:-translate-y-1 hover:shadow-xl'}
                    ${hasActive ? 'bg-orange-50 border-orange-300 shadow-lg shadow-orange-100' : 'bg-white border-slate-200'}
                  `}
                >
                  <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${hasActive ? 'bg-orange-500 animate-pulse' : 'bg-emerald-400'}`} />
                  <span className={`text-4xl font-black mb-2 ${hasActive ? 'text-orange-600' : 'text-slate-300'}`}>
                    {table.tableNo}
                  </span>
                  {hasActive ? (
                    <span className="text-xs font-bold text-orange-800 bg-orange-200/60 px-2.5 py-1 rounded-full">
                      ฿{calculateTotal(table)}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">ว่าง</span>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Sidebar - Bill Details */}
      <aside className={`bg-white border-l border-slate-200 flex flex-col transition-all duration-300 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]
        ${selectedTable ? 'w-full md:w-[420px]' : 'w-0 overflow-hidden border-none'}
        fixed md:relative right-0 h-screen
      `}>
        {selectedTable && (
          <>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Table {selectedTable.tableNo}</h2>
                <p className="text-sm text-slate-500">{selectedTable.orders?.length > 0 ? `${selectedTable.orders.length} order(s) active` : 'Available'}</p>
              </div>
              <button onClick={() => setSelectedTable(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {(!selectedTable.orders || selectedTable.orders.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mb-4 opacity-30">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="font-medium">โต๊ะว่าง — ยังไม่มีออเดอร์</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedTable.orders.map((order: any) => (
                    <div key={order.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed border-slate-200">
                        <span className="font-bold text-slate-700 text-sm">Order #{order.id}</span>
                        <span className="text-[10px] text-slate-400">{mounted && new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div className="flex gap-2 text-slate-700">
                              <span className="font-bold text-sky-600 w-6">{item.quantity}x</span>
                              <div>
                                <span className="font-medium">{item.menu?.name || `Item #${item.menuId}`}</span>
                                {item.note && <p className="text-[10px] text-slate-400 mt-0.5">{item.note}</p>}
                              </div>
                            </div>
                            <span className="font-bold text-slate-800">฿{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedTable.orders?.length > 0 && (
              <div className="p-5 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-slate-500 font-medium">ยอดรวม</span>
                  <span className="text-3xl font-black text-emerald-600">฿{calculateTotal(selectedTable)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-sm">🖨 พิมพ์บิล</button>
                  <button
                    onClick={() => setCheckoutModal(true)}
                    className="py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition text-sm"
                  >
                    💳 เช็คบิล
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </aside>

      {/* Checkout Modal */}
      {checkoutModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm mx-4 p-6 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-1">เช็คบิล Table {selectedTable.tableNo}</h3>
            <p className="text-sm text-slate-500 mb-6">เลือกช่องทางการชำระเงิน</p>

            <div className="text-center mb-6">
              <span className="text-4xl font-black text-emerald-600">฿{calculateTotal(selectedTable)}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { value: 'CASH', label: '💵 เงินสด', color: 'emerald' },
                { value: 'PROMPTPAY', label: '📱 PromptPay', color: 'sky' },
                { value: 'CREDIT_CARD', label: '💳 บัตรเครดิต', color: 'purple' },
              ].map(method => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                    paymentMethod === method.value
                      ? `border-${method.color}-500 bg-${method.color}-50 text-${method.color}-700 shadow-md`
                      : 'border-slate-100 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setCheckoutModal(false)} className="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                ยกเลิก
              </button>
              <button onClick={handleCheckout} className="py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition">
                ยืนยันชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
