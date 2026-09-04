"use client";

import { Contribution } from "@prisma/client";
import { DollarSign, Edit2, Wallet } from "lucide-react";
import { ContributionForm } from "./ContributionForm";
import { DeleteContributionButton } from "./DeleteContributionButton";

export function ContributionsList({ contributions }: { contributions: Contribution[] }) {
  // Calculate contributions by person
  const contributionsByPerson = contributions.reduce((acc, curr) => {
    if (curr.status === "RECEIVED") {
      acc[curr.contributorName] = (acc[curr.contributorName] || 0) + curr.amount;
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

      {/* Main Contributions Table */}
      <div className="bg-[#1e2333] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">All Contributions</h2>
          <div className="text-sm font-medium text-white/40">
            {contributions.length} record{contributions.length === 1 ? "" : "s"}
          </div>
        </div>

        {contributions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <DollarSign className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-1">No Contributions Yet</h3>
            <p className="text-white/40 text-sm">Add a contribution to start tracking funding.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Contributor</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment Method</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((contribution) => (
                  <tr key={contribution.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-white/70">
                      {new Date(contribution.contributionDate).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white/90">{contribution.contributorName}</div>
                      {contribution.notes && (
                        <div className="text-xs text-white/40 mt-0.5 truncate max-w-[200px]" title={contribution.notes}>
                          {contribution.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-[#BA9B5D] font-medium">
                      LKR {contribution.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {contribution.paymentMethod || "-"}
                    </td>
                    <td className="px-6 py-4 text-white/50 text-xs font-mono">
                      {contribution.reference || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {contribution.status === "RECEIVED" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Received
                        </span>
                      ) : contribution.status === "PENDING" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ContributionForm 
                          contribution={contribution} 
                          trigger={
                            <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Edit Contribution">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          }
                        />
                        <DeleteContributionButton 
                          id={contribution.id} 
                          contributorName={contribution.contributorName}
                          amount={contribution.amount}
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
