import React, { useState, useEffect } from 'react';
import { Download, Loader2, PieChart, Receipt, Heart, Calendar, CreditCard } from 'lucide-react';

export default function AlumniDonationHistory() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFy, setSelectedFy] = useState<string>('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/alumni/donations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
        const fys = new Set<string>();
        data.forEach((t: any) => fys.add(getFinancialYear(t.createdAt)));
        const fyArray = Array.from(fys).sort().reverse();
        if (fyArray.length > 0) setSelectedFy(fyArray[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFinancialYear = (dateString: string) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-11
    if (month >= 3) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  const filteredTx = transactions.filter(t => getFinancialYear(t.createdAt) === selectedFy);

  const totalAmount = filteredTx.reduce((acc, t) => acc + Number(t.amount), 0);
  const zakat = filteredTx.filter(t => t.type === 'ZAKAT').reduce((acc, t) => acc + Number(t.amount), 0);
  const sadka = filteredTx.filter(t => t.type === 'SADKA').reduce((acc, t) => acc + Number(t.amount), 0);
  const lillah = filteredTx.filter(t => t.type === 'LILLAH').reduce((acc, t) => acc + Number(t.amount), 0);
  const projects = filteredTx.filter(t => ['CONSTRUCTION', 'EVENT'].includes(t.type)).reduce((acc, t) => acc + Number(t.amount), 0);

  const fyOptions = Array.from(new Set(transactions.map(t => getFinancialYear(t.createdAt)))).sort().reverse();

  if (loading) return (
     <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Loading Impact History...</p>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-slate-100/50">
         <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
               <PieChart className="mr-3 text-blue-600" size={28} />
               My Impact
            </h2>
            <p className="text-xs text-slate-500 font-medium ml-1">Track your contributions and see the difference you're making.</p>
         </div>
         {fyOptions.length > 0 && (
           <select 
             value={selectedFy} 
             onChange={(e) => setSelectedFy(e.target.value)}
             className="px-6 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer shadow-sm"
           >
             {fyOptions.map(fy => (
               <option key={fy} value={fy}>Financial Year {fy}</option>
             ))}
           </select>
         )}
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 p-16 text-center space-y-4 shadow-xl shadow-slate-900/5">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
             <Heart size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-800">No Contributions Yet</h3>
           <p className="text-slate-500 text-sm">Your impact history will appear here once you make your first donation.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[30px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
               <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Total Donated</p>
               <h3 className="text-2xl font-black mt-2">Rs. {totalAmount.toLocaleString()}</h3>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-md shadow-slate-200/50 border border-slate-100">
               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Zakat</p>
               <h3 className="text-xl font-bold text-slate-800 mt-2">Rs. {zakat.toLocaleString()}</h3>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-md shadow-slate-200/50 border border-slate-100">
               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sadka</p>
               <h3 className="text-xl font-bold text-slate-800 mt-2">Rs. {sadka.toLocaleString()}</h3>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-md shadow-slate-200/50 border border-slate-100">
               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lillah</p>
               <h3 className="text-xl font-bold text-slate-800 mt-2">Rs. {lillah.toLocaleString()}</h3>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-md shadow-slate-200/50 border border-slate-100">
               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projects</p>
               <h3 className="text-xl font-bold text-slate-800 mt-2">Rs. {projects.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-900/5 overflow-hidden">
             <div className="p-8 border-b border-slate-100/50">
               <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center">
                 <Receipt className="mr-2 text-blue-600" size={20} />
                 Contribution History ({selectedFy})
               </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                     <th className="p-4 pl-8">Date</th>
                     <th className="p-4">Type</th>
                     <th className="p-4">Amount</th>
                     <th className="p-4">Payment Mode</th>
                     <th className="p-4">School & Details</th>
                     <th className="p-4">Status</th>
                     <th className="p-4 pr-8">Receipt</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100/50">
                   {filteredTx.map((tx: any) => (
                     <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="p-4 pl-8 whitespace-nowrap">
                         <div className="flex items-center text-sm font-semibold text-slate-700">
                           <Calendar size={14} className="mr-2 text-slate-400" />
                           {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </div>
                       </td>
                       <td className="p-4">
                         <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                           {tx.type}
                         </span>
                       </td>
                       <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                         Rs. {Number(tx.amount).toLocaleString()}
                       </td>
                       <td className="p-4">
                         <div className="flex items-center text-xs font-semibold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md w-fit uppercase tracking-wider">
                           <CreditCard size={12} className="mr-1.5 text-slate-400" />
                           {tx.paymentMode || 'N/A'}
                         </div>
                       </td>
                       <td className="p-4">
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-700">{tx.referenceName || 'General Donation'}</span>
                           <span className="text-xs text-slate-500 font-medium">{tx.schoolName || 'Madni Education Trust'}</span>
                         </div>
                       </td>
                       <td className="p-4">
                         <div className="flex items-center text-xs font-bold text-emerald-600">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                           {tx.status}
                         </div>
                       </td>
                       <td className="p-4 pr-8">
                         <a
                           href={`/api/public/download-receipt?id=${tx.id}`}
                           target="_blank"
                           rel="noreferrer"
                           className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                         >
                           <Download size={14} />
                           <span>PDF</span>
                         </a>
                         {tx.razorpayPaymentId && (
                           <p className="mt-1 max-w-32 truncate text-[10px] font-semibold text-slate-400">
                             {tx.razorpayPaymentId}
                           </p>
                         )}
                       </td>
                     </tr>
                   ))}
                   {filteredTx.length === 0 && (
                     <tr>
                       <td colSpan={7} className="p-8 text-center text-sm font-semibold text-slate-500">
                         No contributions found for this financial year.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
