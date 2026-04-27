"use client";

import { useState, useEffect } from "react";

export default function BarDisplaySystem() {
  const [orders, setOrders] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      // type=BAR means we fetch drink items
      const res = await fetch('/api/orders/active?type=BAR');
      const data = await res.json();
      
      if (data.orders) {
        setOrders(data.orders);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOrders(); // Initial fetch
    const interval = setInterval(fetchOrders, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const updateItemStatus = async (itemId: number, currentStatus: string) => {
    let newStatus = 'COOKING';
    if (currentStatus === 'COOKING') newStatus = 'DONE';
    else if (currentStatus === 'DONE') return;

    try {
      await fetch(`/api/orderItems/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const diff = new Date().getTime() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    return mins;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Bar KDS</h1>
            <p className="text-xs text-slate-400">TKMFOOD - Live Drink Display</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-300">Active Drink Orders: {orders.length}</p>
            <p className="text-xs text-slate-500">Updated: {mounted && lastUpdated.toLocaleTimeString()} {isRefreshing && '(syncing...)'}</p>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="p-4 flex overflow-x-auto gap-4 items-start snap-x" style={{ height: 'calc(100vh - 80px)' }}>
        {orders.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <h2 className="text-2xl font-bold mt-4">No Drink Orders</h2>
            <p>Bar is clear!</p>
          </div>
        ) : (
          orders.map((order) => {
            const elapsed = getTimeElapsed(order.createdAt);
            const isUrgent = elapsed > 10; // > 10 mins is urgent for drinks
            
            return (
              <div 
                key={order.id} 
                className={`min-w-[320px] max-w-[320px] bg-slate-800 rounded-xl overflow-hidden shadow-xl border snap-start shrink-0 flex flex-col max-h-full
                  ${isUrgent ? 'border-red-500/50 shadow-red-900/20' : 'border-slate-700'}
                `}
              >
                {/* Order Header */}
                <div className={`p-4 ${isUrgent ? 'bg-red-950/40' : 'bg-slate-700/50'} border-b border-slate-700/50 flex justify-between items-center`}>
                  <div>
                    <h3 className="text-2xl font-black text-white">Table {order.table?.tableNo || '?'}</h3>
                    <p className="text-xs font-medium text-slate-400">Order #{order.id} • {mounted && new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold ${isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-600 text-slate-200'}`}>
                    {elapsed} min
                  </div>
                </div>

                {/* Items List */}
                <div className="p-3 flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    {order.items.map((item: any) => {
                      const isDone = item.status === 'DONE' || item.status === 'SERVED';
                      const isCooking = item.status === 'COOKING'; // 'MAKING' for drinks
                      
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => updateItemStatus(item.id, item.status)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors
                            ${isDone ? 'bg-green-900/20 border-green-800/30 opacity-50' : 
                              isCooking ? 'bg-blue-900/30 border-blue-500/50' : 
                              'bg-slate-700 border-slate-600 hover:bg-slate-600'}
                          `}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 items-start">
                              <span className={`text-lg font-black mt-0.5 ${isDone ? 'text-green-500' : 'text-blue-400'}`}>
                                {item.quantity}x
                              </span>
                              <div>
                                <h4 className={`text-lg font-bold leading-tight ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                                  {item.menu.name}
                                </h4>
                                {item.note && (
                                  <p className="text-red-400 text-sm font-medium mt-1 bg-red-950/50 inline-block px-2 py-0.5 rounded">
                                    ** {item.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="mt-3 flex justify-end">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider
                              ${isDone ? 'bg-green-500/20 text-green-400' : 
                                isCooking ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 animate-pulse' : 
                                'bg-slate-600 text-slate-300'}
                            `}>
                              {item.status === 'COOKING' ? 'MAKING' : item.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
