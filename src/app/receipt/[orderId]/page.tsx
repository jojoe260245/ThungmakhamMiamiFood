"use client";
import { useState, useEffect } from "react";

export default function ReceiptPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [order, setOrder] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    params.then(({ orderId: id }) => {
      setOrderId(id);
      fetch(`/api/orders/${id}`).then(r => r.json()).then(d => {
        if (d.order) setOrder(d.order);
      });
    });
  }, [params]);

  useEffect(() => { if (order) setTimeout(() => window.print(), 500); }, [order]);

  if (!order) return <div className="p-8 text-center">กำลังโหลด...</div>;

  return (
    <>
      <style>{`@media print { body { margin: 0; } .no-print { display: none !important; } } @page { size: 80mm auto; margin: 0; }`}</style>
      <div className="font-mono text-sm max-w-[80mm] mx-auto p-4 bg-white text-black">
        {/* Header */}
        <div className="text-center mb-3 border-b border-dashed border-black pb-3">
          <h1 className="text-xl font-black">ThungmakhamMiamiFood</h1>
          <p className="text-[10px]">Seaside Restaurant</p>
          <p className="text-[10px]">Tel: 099-XXX-XXXX</p>
        </div>

        {/* Order Info */}
        <div className="text-xs mb-3 border-b border-dashed border-black pb-3">
          <div className="flex justify-between"><span>เลขที่:</span><span>#{orderId.padStart(4, '0')}</span></div>
          <div className="flex justify-between"><span>โต๊ะ:</span><span>{order.table?.tableNo || 'Takeaway'}</span></div>
          <div className="flex justify-between"><span>วันที่:</span><span>{new Date(order.createdAt).toLocaleString('th-TH')}</span></div>
          <div className="flex justify-between"><span>ชำระ:</span><span>{order.paymentMethod || '-'}</span></div>
        </div>

        {/* Items */}
        <table className="w-full text-xs mb-3">
          <thead><tr className="border-b border-black"><th className="text-left py-1">รายการ</th><th className="text-center">จน.</th><th className="text-right">ราคา</th></tr></thead>
          <tbody>
            {order.items?.map((item: any) => (
              <tr key={item.id} className="border-b border-dashed border-gray-300">
                <td className="py-1">{item.menu?.name}{item.note ? <span className="text-[10px] block text-gray-500">({item.note})</span> : null}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">฿{(item.menu?.price * item.quantity).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-dashed border-black pt-2 text-xs space-y-1">
          <div className="flex justify-between"><span>รวม:</span><span>฿{order.subtotal?.toFixed(0)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-red-600"><span>ส่วนลด:</span><span>-฿{order.discount?.toFixed(0)}</span></div>}
          <div className="flex justify-between font-black text-base border-t border-black pt-2 mt-2"><span>รวมสุทธิ</span><span>฿{order.total?.toFixed(0)}</span></div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-[10px] border-t border-dashed border-black pt-3">
          <p>ขอบคุณที่ใช้บริการ</p>
          <p>Thank you for dining with us! 🙏</p>
        </div>

        {/* Print Button */}
        <div className="no-print mt-6 text-center space-y-2">
          <button onClick={() => window.print()} className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg">🖨 พิมพ์ใบเสร็จ</button>
          <br/><a href="/cashier" className="text-purple-400 text-sm">← กลับหน้าแคชเชียร์</a>
        </div>
      </div>
    </>
  );
}
