"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function BarDisplaySystem() {
  const [orders, setOrders] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      // type=BAR means we fetch drink items
      const res = await fetch('/api/orders/active?type=BAR');
      const data = await res.json();
      
      if (data.orders) {
        setOrders(prev => {
          if (prev.length > 0 && data.orders.length > prev.length) {
            setIsAlarmRinging(true);
            const audio = document.getElementById('notification-sound-bar') as HTMLAudioElement;
            if (audio) {
              audio.loop = true;
              audio.play().catch(e=>console.log("Audio play prevented:", e));
            }
          }
          return data.orders;
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
    const audio = document.getElementById('notification-sound-bar') as HTMLAudioElement;
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
    <AuthGuard allowedRoles={['BAR']}>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
        {/* Audio element for notification */}
        <audio id="notification-sound-bar" src="/notification.mp3" preload="auto"></audio>

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
              <p className="text-xs text-slate-400">ThungmakhamMiamiFood - Live Drink Display</p>
            </div>
          </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-300">Active: {orders.length}</p>
            <p className="text-xs text-slate-500">{mounted && lastUpdated.toLocaleTimeString()} {isRefreshing && '(syncing...)'}</p>
          </div>
          <button onClick={handleLogout} className="text-xs bg-slate-700 text-slate-300 border border-slate-600 px-3 py-2 rounded-xl font-bold hover:bg-slate-600">🚪 ออก</button>
        </div>
      </header>

      {/* Alarm Banner */}
      {isAlarmRinging && (
        <div className="bg-blue-600 text-white font-black p-4 flex justify-between items-center animate-pulse z-40 relative shadow-[0_10px_30px_rgba(37,99,235,0.5)]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <h2 className="text-xl">NEW DRINK ORDER!</h2>
              <p className="text-sm font-medium opacity-90">ออเดอร์ใหม่เข้า กรุณากดรับทราบเพื่อหยุดเสียงเตือน</p>
            </div>
          </div>
          <button onClick={acknowledgeAlarm} className="bg-white text-blue-600 px-8 py-3 rounded-xl font-black text-lg hover:bg-slate-100 active:scale-95 transition-all shadow-lg">
            ✅ รับทราบ (ACKNOWLEDGE)
          </button>
        </div>
      )}

      {/* Main Board */}
      <main className="p-4 flex overflow-x-auto gap-4 items-start snap-x" style={{ height: `calc(100vh - ${isAlarmRinging ? '160px' : '80px'})` }}>
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
                    <button onClick={() => window.open(`/ticket/${order.id}`, '_blank')} className="mt-2 text-xs bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-xl font-bold hover:bg-blue-500/30 transition-all active:scale-95 shadow-sm">🖨 พิมพ์บิลบาร์</button>
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
                      const isCooking = item.status === 'COOKING'; // 'MAKING' for drinks
                      
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => updateItemStatus(item.id, item.status)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 transform active:scale-95
                            ${isDone ? 'bg-green-900/10 border-green-800/20 opacity-40 grayscale hover:grayscale-0' : 
                              isCooking ? 'bg-gradient-to-r from-blue-900/40 to-blue-800/20 border-blue-500/50 shadow-lg shadow-blue-900/20' : 
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
    </AuthGuard>
  );
}
