import { prisma } from "@/lib/db";
import { CategoryForm } from "./CategoryForm";
import { BudgetItemForm } from "./BudgetItemForm";
import { ExpenseForm } from "./ExpenseForm";
import { DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function AdminBudgetPage(props: { searchParams: { new?: string } }) {
  const categories = await prisma.budgetCategory.findMany({
    include: {
      items: {
        include: { vendor: true, expenses: true },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Calculate totals
  let totalEstimated = 0;
  let totalPaid = 0;
  
  categories.forEach(cat => {
    cat.items.forEach(item => {
      totalEstimated += item.estimatedCost;
      totalPaid += item.paidAmount;
    });
  });

  const totalRemaining = totalEstimated - totalPaid;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-wide">Budget Management</h1>
          <p className="text-white/50 text-sm mt-1">Track planned costs and vendor payments.</p>
        </div>
        <div className="flex items-center gap-4">
          <CategoryForm />
          <BudgetItemForm categories={categories} />
        </div>
      </div>

      {/* Summary Stat Cards (Spark Admin Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <span className="text-white/50 text-sm font-medium tracking-wide">Total Budget</span>
          <div className="text-3xl font-semibold text-white mt-auto">
            ${totalEstimated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <span className="text-white/50 text-sm font-medium tracking-wide">Total Paid</span>
          <div className="text-3xl font-semibold text-emerald-400 mt-auto">
            ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <span className="text-white/50 text-sm font-medium tracking-wide">Remaining Balance</span>
          <div className="text-3xl font-semibold text-amber-400 mt-auto">
            ${totalRemaining > 0 ? totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </div>
        </div>
      </div>

      {/* Budget Categories & Items */}
      <div className="space-y-6">
        {categories.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/5">
            <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Budget Data</h3>
            <p className="text-white/40 text-sm">Create a category and add your first budget item to start tracking.</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">{category.name}</h2>
                <div className="text-sm font-medium text-white/40">
                  {category.items.length} item{category.items.length === 1 ? "" : "s"}
                </div>
              </div>
              
              {category.items.length === 0 ? (
                <div className="px-6 py-8 text-center text-white/30 text-sm">No items in this category.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="text-white/30 text-xs uppercase tracking-widest border-b border-white/5">
                        <th className="px-6 py-4 font-medium">Item</th>
                        <th className="px-6 py-4 font-medium">Estimated</th>
                        <th className="px-6 py-4 font-medium">Paid</th>
                        <th className="px-6 py-4 font-medium">Balance</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map(item => {
                        const balance = item.estimatedCost - item.paidAmount;
                        return (
                          <tr key={item.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-medium text-white/90">{item.title}</div>
                              {item.paymentDueDate && (
                                <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Due {new Date(item.paymentDueDate).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-white/70 font-mono">
                              ${item.estimatedCost.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-emerald-400 font-mono">
                              ${item.paidAmount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-amber-400/80 font-mono">
                              ${balance > 0 ? balance.toLocaleString() : "0"}
                            </td>
                            <td className="px-6 py-4">
                              {item.paymentStatus === "FULLY_PAID" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                                </span>
                              ) : item.paymentStatus === "PARTIALLY_PAID" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Partial
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-white/40 border border-white/10">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {item.paymentStatus !== "FULLY_PAID" && (
                                <ExpenseForm budgetItemId={item.id} itemName={item.title} />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
