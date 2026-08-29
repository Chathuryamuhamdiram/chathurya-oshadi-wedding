import { prisma } from "@/lib/db";
import { VendorForm } from "./VendorForm";
import { Store, AlertCircle, Building2, Wallet } from "lucide-react";
import Link from "next/link";

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { vendorName: 'asc' }
  });

  const totalVendors = vendors.length;
  
  const now = new Date();
  const next14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  const upcomingPayments = vendors.filter(v => 
    v.nextPaymentDue && 
    new Date(v.nextPaymentDue) >= now && 
    new Date(v.nextPaymentDue) <= next14Days
  ).length;

  let totalOutstanding = 0;
  vendors.forEach(v => {
    if (v.finalAmount > v.advancePaid) {
      totalOutstanding += (v.finalAmount - v.advancePaid);
    }
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-wide">Vendor Management</h1>
          <p className="text-white/50 text-sm mt-1">Your digital address book for all wedding suppliers.</p>
        </div>
        <div className="flex items-center gap-4">
          <VendorForm />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <Building2 className="w-4 h-4" /> Active Vendors
          </div>
          <div className="text-3xl font-semibold text-white mt-auto">
            {totalVendors}
          </div>
        </div>
        
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <AlertCircle className="w-4 h-4" /> Upcoming Payments (14 days)
          </div>
          <div className="text-3xl font-semibold text-amber-400 mt-auto">
            {upcomingPayments}
          </div>
        </div>

        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium tracking-wide">
            <Wallet className="w-4 h-4" /> Outstanding Vendor Balance
          </div>
          <div className="text-3xl font-semibold text-red-400 mt-auto">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Vendor List */}
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Vendor Directory</h2>
        </div>
        
        {vendors.length === 0 ? (
          <div className="bg-white/5 p-12 text-center">
            <Store className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Vendors Added</h3>
            <p className="text-white/40 text-sm">Keep all your supplier contacts and contracts in one place.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-medium">Business</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Financials</th>
                  <th className="px-6 py-4 font-medium">Next Due</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(vendor => {
                  const balance = vendor.finalAmount - vendor.advancePaid;
                  return (
                    <tr key={vendor.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white/90">{vendor.vendorName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {vendor.serviceCategory || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/80">{vendor.contactName || "No contact name"}</div>
                        <div className="text-white/40 text-xs mt-0.5">{vendor.email || vendor.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/80 font-mono">
                          Agreed: ${vendor.finalAmount.toLocaleString()}
                        </div>
                        <div className="text-red-400/80 font-mono text-xs mt-0.5">
                          Owes: ${balance > 0 ? balance.toLocaleString() : "0"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {vendor.nextPaymentDue ? (
                          <div className={`flex items-center gap-1.5 ${
                            new Date(vendor.nextPaymentDue) < now ? 'text-red-400 font-medium' : 'text-white/70'
                          }`}>
                            {new Date(vendor.nextPaymentDue).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-white/20">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link href="/admin/budget" className="text-emerald-400/70 hover:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded transition-colors text-xs border border-emerald-500/20 inline-block">
                          Pay
                        </Link>
                        <VendorForm existingVendor={vendor} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
