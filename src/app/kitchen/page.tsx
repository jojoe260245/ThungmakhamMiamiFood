"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

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
        
        setOrders(prev => {
          if (prev.length > 0 && kitchenOrders.length > prev.length) {
            setIsAlarmRinging(true);
            const audio = document.getElementById('notification-sound') as HTMLAudioElement;
            if (audio) {
              audio.loop = true;
              audio.play().catch(e=>console.log("Audio play prevented:", e));
            }
          }
          return kitchenOrders;
        });
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

  const acknowledgeAlarm = () => {
    setIsAlarmRinging(false);
    const audio = document.getElementById('notification-sound') as HTMLAudioElement;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const handleLogout = () => {
    if(confirm('ต้องการออกจากระบบหรือไม่?')) {
      localStorage.removeItem('thungmakhammiamifood_user');
      window.location.href = '/login';
    }
  };

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
    <AuthGuard allowedRoles={['KITCHEN']}>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
        {/* Audio element for notification */}
        <audio id="notification-sound" src="/notification.mp3" preload="auto"></audio>

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
              <p className="text-xs text-slate-400">ThungmakhamMiamiFood - Live Order Display</p>
            </div>
          </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-300">Active Orders: {orders.length}</p>
            <p className="text-xs text-slate-500">Updated: {mounted && lastUpdated.toLocaleTimeString()} {isRefreshing && '(syncing...)'}</p>
          </div>
          <button onClick={handleLogout} className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-700 transition-all shadow-sm ml-2">🚪 ออกจากระบบ</button>
        </div>
      </header>

      {/* Alarm Banner */}
      {isAlarmRinging && (
        <div className="bg-red-600 text-white font-black p-4 flex justify-between items-center animate-pulse z-40 relative shadow-[0_10px_30px_rgba(220,38,38,0.5)]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <h2 className="text-xl">NEW URGENT ORDER!</h2>
              <p className="text-sm font-medium opacity-90">ออเดอร์ใหม่เข้า กรุณากดรับทราบเพื่อหยุดเสียงเตือน</p>
            </div>
          </div>
          <button onClick={acknowledgeAlarm} className="bg-white text-red-600 px-8 py-3 rounded-xl font-black text-lg hover:bg-slate-100 active:scale-95 transition-all shadow-lg">
            ✅ รับทราบ (ACKNOWLEDGE)
          </button>
        </div>
      )}

      {/* Main Board */}
      <main className="p-4 flex overflow-x-auto gap-4 items-start snap-x" style={{ height: `calc(100vh - ${isAlarmRinging ? '160px' : '80px'})` }}>
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
                  className={`min-w-[340px] max-w-[340px] glass-panel-dark rounded-3xl overflow-hidden shadow-2xl snap-start shrink-0 flex flex-col max-h-full transition-all duration-300 animate-slide-up
                    ${isUrgent ? 'border-2 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.6)] animate-pulse' : 'border-slate-700/50 hover:border-slate-500'}
                  `}
                  style={{ animationDelay: `${(order.id % 5) * 100}ms` }}
                >
                  {/* Order Header */}
                  <div className={`p-5 ${isUrgent ? 'bg-gradient-to-r from-red-950/80 to-red-900/40' : 'bg-slate-800/40'} border-b border-slate-700/50 flex justify-between items-center backdrop-blur-md`}>
                  <div>
                    <h3 className="text-2xl font-black text-white">Table {order.table?.tableNo || '?'}</h3>
                    <p className="text-xs font-medium text-slate-400">Order #{order.id} • {mounted && new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <button onClick={() => window.open(`/ticket/${order.id}`, '_blank')} className="mt-2 text-xs bg-orange-500/20 text-orange-400 px-4 py-1.5 rounded-xl font-bold hover:bg-orange-500/30 transition-all active:scale-95 shadow-sm">🖨 พิมพ์บิลครัว</button>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-black tracking-wider ${isUrgent ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-700 text-slate-200'}`}>
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
                          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 transform active:scale-95
                            ${isDone ? 'bg-green-900/10 border-green-800/20 opacity-40 grayscale hover:grayscale-0' : 
                              isCooking ? 'bg-gradient-to-r from-orange-900/40 to-orange-800/20 border-orange-500/50 shadow-lg shadow-orange-900/20' : 
                              'glass-panel-dark hover:bg-slate-700/50'}
                          `}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                              <span className={`text-2xl font-black mt-0.5 drop-shadow-md ${isDone ? 'text-green-500' : 'text-sky-400'}`}>
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
    </AuthGuard>
  );
}
