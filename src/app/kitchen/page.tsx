"use client";

import { useState, useEffect } from "react";

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Polling Function
  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      // type=KITCHEN means we only fetch food items (isDrink = false)
      const res = await fetch('/api/orders/active');
      const data = await res.json();
      
      if (data.orders) {
        // Filter internally or from API. We'll filter here for KITCHEN (not drinks)
        const kitchenOrders = data.orders.map((order: any) => ({
          ...order,
          items: order.items.filter((item: any) => item.menu && !item.menu.isDrink)
        })).filter((order: any) => order.items.length > 0);
        
        setOrders(kitchenOrders);
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
    // Flow: PENDING -> COOKING -> DONE
    let newStatus = 'COOKING';
    if (currentStatus === 'COOKING') newStatus = 'DONE';
    else if (currentStatus === 'DONE') return; // Cannot update past DONE in KDS

    try {
      await fetch(`/api/orderItems/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders(); // Refresh instantly
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
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Kitchen KDS</h1>
            <p className="text-xs text-slate-400">TKMFOOD - Live Order Display</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-300">Active Orders: {orders.length}</p>
            <p className="text-xs text-slate-500">Updated: {mounted && lastUpdated.toLocaleTimeString()} {isRefreshing && '(syncing...)'}</p>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="p-4 flex overflow-x-auto gap-4 items-start snap-x" style={{ height: 'calc(100vh - 80px)' }}>
        {orders.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mb-4 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold">No Active Orders</h2>
            <p>Kitchen is clear! Good job team.</p>
          </div>
        ) : (
          orders.map((order) => {
            const elapsed = getTimeElapsed(order.createdAt);
            const isUrgent = elapsed > 15; // > 15 mins is urgent
            
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
                      const isCooking = item.status === 'COOKING';
                      
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => updateItemStatus(item.id, item.status)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors
                            ${isDone ? 'bg-green-900/20 border-green-800/30 opacity-50' : 
                              isCooking ? 'bg-orange-900/30 border-orange-500/50' : 
                              'bg-slate-700 border-slate-600 hover:bg-slate-600'}
                          `}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 items-start">
                              <span className={`text-lg font-black mt-0.5 ${isDone ? 'text-green-500' : 'text-sky-400'}`}>
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
                                isCooking ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 animate-pulse' : 
                                'bg-slate-600 text-slate-300'}
                            `}>
                              {item.status}
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
