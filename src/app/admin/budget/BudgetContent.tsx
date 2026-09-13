"use client";

import { useState, useEffect } from "react";
import { DollarSign, AlertCircle, CheckCircle2, PieChart, LayoutList, HandCoins, Building2 } from "lucide-react";
import { CategoryForm } from "./CategoryForm";
import { BudgetItemForm } from "./BudgetItemForm";
import { ExpenseForm } from "./ExpenseForm";
import { DeleteBudgetItemButton } from "./DeleteBudgetItemButton";
import { DeleteBudgetCategoryButton } from "./DeleteBudgetCategoryButton";
import { ContributionsList } from "./ContributionsList";
import { ContributionForm } from "./ContributionForm";
import { VendorPaymentModal } from "./VendorPaymentModal";
import { useSearchParams, useRouter } from "next/navigation";

import { AvailableFundsForm } from "./AvailableFundsForm";

export function BudgetContent({ 
  categories, 
  contributions,
  vendors = [],
  plannedBudget,
  totalContributions,
  totalExpenses,
  recordedNetFunds,
  remainingToPay,
  currentMoneyOnHand,
  lastUpdated,
  snapshots,
  cashVariance,
  fundingShortfall,
  activeEventId = "all",
  activeEventName = "All Events",
  isAllEvents = false
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state if URL changes
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <VendorPaymentModal vendors={vendors} categories={categories} />
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-wide">Budget Management</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-white/50 text-sm">Track planned costs, contributions, and expenses.</p>
            {isAllEvents ? (
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/10">All Events</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{activeEventName}</span>
            )}
          </div>
          {isAllEvents && (
            <p className="text-amber-400/70 text-xs mt-1">⚠️ Viewing all events — creating records requires selecting a specific event first</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ContributionForm activeEventId={isAllEvents ? null : activeEventId} />
          <CategoryForm />
          <BudgetItemForm categories={categories} vendors={vendors} activeEventId={isAllEvents ? null : activeEventId} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
        <button 
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-[#BA9B5D] text-[#BA9B5D]' : 'border-transparent text-white/50 hover:text-white/80'}`}
        >
          <PieChart className="w-4 h-4" />
          Overview
        </button>
        <button 
          onClick={() => handleTabChange('budget-items')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'budget-items' ? 'border-[#BA9B5D] text-[#BA9B5D]' : 'border-transparent text-white/50 hover:text-white/80'}`}
        >
          <LayoutList className="w-4 h-4" />
          Budget Items
        </button>
        <button 
          onClick={() => handleTabChange('contributions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'contributions' ? 'border-[#BA9B5D] text-[#BA9B5D]' : 'border-transparent text-white/50 hover:text-white/80'}`}
        >
          <HandCoins className="w-4 h-4" />
          Contributions
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[130px] relative overflow-hidden group">
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Planned Budget</span>
              <div className="text-xl lg:text-2xl font-semibold text-white mt-auto truncate" title={`LKR ${plannedBudget.toLocaleString()}`}>
                LKR {plannedBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[130px] relative overflow-hidden group">
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Paid Expenses</span>
              <div className="text-xl lg:text-2xl font-semibold text-rose-400 mt-auto truncate" title={`LKR ${totalExpenses.toLocaleString()}`}>
                LKR {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[130px] relative overflow-hidden group">
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Remaining To Pay</span>
              <div className="text-xl lg:text-2xl font-semibold text-amber-400 mt-auto truncate" title={`LKR ${remainingToPay.toLocaleString()}`}>
                LKR {remainingToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-[#1e2333] border border-[#BA9B5D]/40 rounded-2xl p-5 flex flex-col justify-between h-[130px] relative overflow-hidden group shadow-[0_0_20px_rgba(186,155,93,0.1)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#BA9B5D]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <span className="text-[#BA9B5D] text-xs font-medium tracking-widest uppercase">Current Money On Hand</span>
              <div className="text-xl lg:text-2xl font-semibold text-white mt-auto truncate" title={`LKR ${currentMoneyOnHand.toLocaleString()}`}>
                LKR {currentMoneyOnHand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-[130px] relative overflow-hidden group">
              <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Total Contributions</span>
              <div className="text-xl lg:text-2xl font-semibold text-emerald-400 mt-auto truncate" title={`LKR ${totalContributions.toLocaleString()}`}>
                LKR {totalContributions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Deep Dive Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Funding Status Widget */}
             <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-medium mb-1">Funding Shortfall</h3>
                    <p className="text-white/40 text-xs">Do we have enough cash to cover remaining payments?</p>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-6">
                  <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl">
                    <span className="text-sm text-white/70">Remaining To Pay</span>
                    <span className="text-sm font-mono text-white">LKR {remainingToPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl">
                    <span className="text-sm text-white/70">Current Money on Hand</span>
                    <span className="text-sm font-mono text-white">LKR {currentMoneyOnHand.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 mt-2">
                    {fundingShortfall > 0 ? (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-rose-400">Shortfall</span>
                        <span className="text-xl font-bold font-mono text-rose-400">LKR {fundingShortfall.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-emerald-400">Funds Sufficient</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">+ LKR {Math.abs(fundingShortfall).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
             </div>
             
             {/* Variance & Updates Widget */}
             <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-medium mb-1">Recorded Net Funds vs Actual Cash</h3>
                    <p className="text-white/40 text-xs">Compare recorded transactions against your actual available cash.</p>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-6">
                  <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl">
                    <div>
                      <span className="text-sm text-white/70 block">Recorded Net Funds</span>
                      <span className="text-[10px] text-white/30">Total Contributions - Total Expenses</span>
                    </div>
                    <span className="text-sm font-mono text-white">LKR {recordedNetFunds.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 mt-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-white/80">Cash Variance</span>
                    <span className={`text-xl font-bold font-mono ${cashVariance >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {cashVariance >= 0 ? '+' : '-'} LKR {Math.abs(cashVariance).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 border border-[#BA9B5D]/20 bg-[#BA9B5D]/5 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-[#BA9B5D] uppercase tracking-widest font-semibold">Money On Hand</span>
                      {lastUpdated && (
                        <span className="text-[10px] text-white/40">Last updated: {new Date(lastUpdated).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="text-2xl font-mono text-white mb-2">LKR {currentMoneyOnHand.toLocaleString()}</div>
                    <AvailableFundsForm currentAmount={currentMoneyOnHand} lastUpdated={lastUpdated} snapshots={snapshots} />
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === "budget-items" && (
        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/5">
              <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Budget Data</h3>
              <p className="text-white/40 text-sm">Create a category and add your first budget item to start tracking.</p>
            </div>
          ) : (
            categories.map((category: any) => (
              <div key={category.id} className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest flex items-center">
                    {category.name}
                    <DeleteBudgetCategoryButton id={category.id} name={category.name} />
                  </h2>
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
                          <th className="px-6 py-4 font-medium">Estimated (LKR)</th>
                          <th className="px-6 py-4 font-medium">Paid (LKR)</th>
                          <th className="px-6 py-4 font-medium">Balance (LKR)</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item: any) => {
                          const balance = item.estimatedCost - item.paidAmount;
                          return (
                            <tr key={item.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4">
                                <div className="font-medium text-white/90">{item.title}</div>
                                <div className="flex items-center gap-3 mt-1">
                                  {item.vendor && (
                                    <div className="text-[10px] text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {item.vendor.vendorName}
                                    </div>
                                  )}
                                  {item.paymentDueDate && (
                                    <div className="text-xs text-white/40 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" /> Due {new Date(item.paymentDueDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-white/70 font-mono">
                                {item.estimatedCost.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 font-mono">
                                <div className="text-rose-400">
                                  {item.paidAmount.toLocaleString()}
                                </div>
                                {item.expenses && item.expenses.find((e: any) => e.expenseType === 'ADVANCE') && (
                                  <div className="text-[10px] text-white/40 mt-1">
                                    Incl. Advance: {Number(item.expenses.find((e: any) => e.expenseType === 'ADVANCE').amount).toLocaleString()}
                                  </div>
                                )}
                                {item.expenses && (() => {
                                  const totalAttachments = item.expenses.reduce((sum: number, e: any) => sum + (e.attachments?.length || 0), 0);
                                  return totalAttachments > 0 ? (
                                    <div className="text-[10px] text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 mt-1.5 w-fit" title={`${totalAttachments} evidence files attached to payments`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                      {totalAttachments}
                                    </div>
                                  ) : null;
                                })()}
                              </td>
                              <td className="px-6 py-4 text-amber-400/80 font-mono">
                                {balance > 0 ? balance.toLocaleString() : "0"}
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
                                <div className="flex items-center justify-end gap-2">
                                  <ExpenseForm budgetItemId={item.id} itemName={item.title} expenses={item.expenses} />
                                  <BudgetItemForm 
                                    categories={categories} 
                                    vendors={vendors} 
                                    existingItem={item}
                                    trigger={
                                      <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Edit Budget Item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                      </button>
                                    }
                                  />
                                  <DeleteBudgetItemButton id={item.id} title={item.title} />
                                </div>
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
      )}

      {activeTab === "contributions" && (
        <ContributionsList contributions={contributions} />
      )}
    </div>
  );
}
