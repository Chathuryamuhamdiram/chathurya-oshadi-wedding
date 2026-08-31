import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { GuestbookActionButtons } from "./GuestbookActionButtons";

export const dynamic = 'force-dynamic';

export default async function GuestbookPage() {
  const messages = await prisma.guestbookEntry.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-white mb-2">Guestbook Messages</h1>
          <p className="text-white/60">Manage messages submitted on the public website.</p>
        </div>
      </div>

      <div className="bg-[#1e2333]/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 font-sans text-xs uppercase tracking-widest text-white/40">Guest Name</th>
                <th className="p-4 font-sans text-xs uppercase tracking-widest text-white/40">Message</th>
                <th className="p-4 font-sans text-xs uppercase tracking-widest text-white/40">Date</th>
                <th className="p-4 font-sans text-xs uppercase tracking-widest text-white/40">Status</th>
                <th className="p-4 font-sans text-xs uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">
                    No messages have been submitted yet.
                  </td>
                </tr>
              ) : (
                messages.map(msg => (
                  <tr key={msg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">{msg.name}</td>
                    <td className="p-4 text-white/70 max-w-md whitespace-pre-wrap">
                      {msg.message}
                    </td>
                    <td className="p-4 text-white/50 text-sm">
                      {format(new Date(msg.createdAt), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="p-4">
                      {msg.isPublic ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-white/5 text-white/40 border-white/10">
                          Private
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end">
                        <GuestbookActionButtons id={msg.id} isPublic={msg.isPublic} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
