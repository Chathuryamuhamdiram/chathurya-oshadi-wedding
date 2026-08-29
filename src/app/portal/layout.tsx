import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { LogOut, User, Bell } from "lucide-react";
import Link from "next/link";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const sessionCookie = (await cookies()).get("admin_session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  const payload = await verifyJWT(sessionCookie);

  if (!payload || payload.role !== "FAMILY_MEMBER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f9f6f0] flex flex-col font-sans text-[#10233b]">
      {/* Mobile-friendly Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-[#e2d8c3] px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="font-serif text-xl text-[#10233b] font-bold tracking-wide">Family Portal</span>
          <span className="text-[10px] uppercase tracking-widest text-[#9a8060] font-semibold truncate max-w-[150px]">
            {payload.email}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-[#9a8060]">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          </button>
          
          <form action={logoutAction}>
            <button type="submit" className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors" title="Log Out">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 md:p-6 pb-24">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2d8c3] pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          <Link href="/portal" className="flex flex-col items-center gap-1 text-[#10233b]">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">Tasks</span>
          </Link>
          
          <Link href="/portal/timeline" className="flex flex-col items-center gap-1 text-[#9a8060] hover:text-[#10233b]">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">Timeline</span>
          </Link>
          
          <Link href="/portal/profile" className="flex flex-col items-center gap-1 text-[#9a8060] hover:text-[#10233b]">
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
