"use client";

import { Contribution } from "@prisma/client";
import { DollarSign, Edit2, Wallet, HandCoins } from "lucide-react";
import { ContributionForm } from "./ContributionForm";
import { DeleteContributionButton } from "./DeleteContributionButton";

export function ContributionsList({ contributions }: { contributions: Contribution[] }) {
  // Calculate contributions by person
  const contributionsByPerson = contributions.reduce((acc, curr) => {
    if (curr.status === "RECEIVED") {
      acc[curr.contributorName] = (acc[curr.contributorName] || 0) + Number(curr.amount);
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedContributors = Object.entries(contributionsByPerson).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Contributions by Person Summary */}
      {sortedContributors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sortedContributors.map(([name, amount]) => (
            <div key={name} className="bg-[#1e2333] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#BA9B5D]/10 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-[#BA9B5D]" />
              </div>
              <div className="min-w-0">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider truncate">{name}</p>
                <p className="text-white font-semibold text-lg truncate">
                  LKR {amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[120px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Total Received</span>
          <div className="text-3xl font-semibold text-emerald-400 mt-auto truncate">
            LKR {contributions.filter(c => c.status === "RECEIVED").reduce((sum, c) => sum + Number(c.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-[#1e2333] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[120px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Pending Contributions</span>
          <div className="text-3xl font-semibold text-amber-400 mt-auto truncate">
            LKR {contributions.filter(c => c.status === "PENDING").reduce((sum, c) => sum + Number(c.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Contribution Ledger</h2>
          <div className="text-sm font-medium text-white/40">
            {contributions.length} record{contributions.length === 1 ? "" : "s"}
          </div>
        </div>

        {contributions.length === 0 ? (
          <div className="bg-white/5 p-12 text-center border-b border-white/5">
            <HandCoins className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Contributions Yet</h3>
            <p className="text-white/40 text-sm">Add contributions from family, friends, or yourselves to fund the budget.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-medium">Contributor</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount (LKR)</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c: any) => (
                  <tr key={c.id} className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group ${c.status === 'CANCELLED' ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white/90">{c.contributorName}</div>
                      {c.purpose && <div className="text-xs text-white/40 mt-1">{c.purpose}</div>}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {new Date(c.contributionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <span className={c.status === "RECEIVED" ? "text-emerald-400" : "text-white/70"}>
                        {Number(c.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.status === "RECEIVED" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Received
                        </span>
                      ) : c.status === "PENDING" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-white/60">
                        {c.paymentMethod && <div>Via {c.paymentMethod}</div>}
                        {c.reference && <div className="font-mono mt-0.5 text-white/40">Ref: {c.reference}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ContributionForm contribution={c} />
                        <DeleteContributionButton 
                          id={c.id} 
                          contributorName={c.contributorName} 
                          amount={Number(c.amount)} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
