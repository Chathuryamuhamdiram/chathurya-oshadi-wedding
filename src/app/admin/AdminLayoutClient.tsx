"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { logoutAction } from "@/app/login/actions";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { EventSelector } from "@/components/admin/EventSelector";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Truck, 
  DollarSign, 
  Store, 
  CheckSquare, 
  Menu,
  Plus,
  Maximize,
  Settings,
  LogOut,
  ChevronDown,
  Utensils,
  FileText,
  Sparkles,
  MapPin,
  Globe,
  Image as ImageIcon,
  MessageSquare
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const allNavGroups = [
  {
    title: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Planning",
    links: [
      { href: "/admin/guests", label: "Guests & RSVPs", icon: Users },
      { href: "/admin/events", label: "Itinerary & Events", icon: MapPin },
      { href: "/admin/seating", label: "Seating & Meals", icon: Utensils },
      { href: "/admin/logistics", label: "Logistics", icon: Truck },
    ]
  },
  {
    title: "Management",
    links: [
      { href: "/admin/team", label: "Team & Roles", icon: Users },
      { href: "/admin/budget", label: "Budget", icon: DollarSign },
      { href: "/admin/vendors", label: "Vendors", icon: Store },
      { href: "/admin/tasks", label: "Tasks", icon: CheckSquare },
    ]
  },
  {
    title: "Operations",
    links: [
      { href: "/admin/calendar", label: "Calendar & Docs", icon: FileText },
      { href: "/admin/wedding-day", label: "Wedding Day", icon: Sparkles },
      { href: "/admin/gallery", label: "Public Gallery", icon: ImageIcon },
      { href: "/admin/guestbook", label: "Guestbook", icon: MessageSquare },
      { href: "/admin/assets", label: "Site Assets", icon: ImageIcon },
    ]
  }
];
function NavGroup({ 
  group, 
  pathname, 
  setIsOpen 
}: { 
  group: any; 
  pathname: string; 
  setIsOpen: (v: boolean) => void;
}) {
  const hasActiveLink = group.links.some((l: any) => pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href)));
  const [isExpanded, setIsExpanded] = useState(hasActiveLink);

  return (
    <div className="mb-2">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider hover:text-white/70 hover:bg-white/5 transition-colors rounded-lg group"
      >
        <span>{group.title}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white/70' : 'text-white/20 group-hover:text-white/40'}`} />
      </button>
      
      <div className={`grid transition-all duration-200 ease-in-out ${isExpanded ? 'grid-rows-[1fr] mt-1' : 'grid-rows-[0fr]'}`}>
        <ul className="space-y-1 overflow-hidden pl-2">
          {group.links.map((link: any) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-400 font-medium" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-white/40'}`} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function AdminSidebar({ 
  isOpen, 
  setIsOpen,
  role,
  permissions
}: { 
  isOpen: boolean; 
  setIsOpen: (val: boolean) => void;
  role: string;
  permissions: string[];
}) {
  const pathname = usePathname();

  const permissionMap: Record<string, string> = {
    "/admin/guests": "guest.view",
    "/admin/events": "calendar.view", 
    "/admin/seating": "seating.view",
    "/admin/logistics": "transport.view",
    "/admin/budget": "budget.view",
    "/admin/vendors": "vendor.view",
    "/admin/tasks": "task.view",
    "/admin/team": "user.view",
    "/admin/calendar": "calendar.view",
    "/admin/wedding-day": "wedding_day.view",
    "/admin/guestbook": "guestbook.view",
  };

  // Filter nav groups based on permissions
  const navGroups = allNavGroups.map(group => {
    return {
      ...group,
      links: group.links.filter(link => {
        if (role === "SUPER_ADMIN") return true;
        
        // Team management should be super admin only or require user.view
        if (link.href === "/admin/team" && !permissions.includes("user.view") && role !== "SUPER_ADMIN") return false;

        const requiredPermission = permissionMap[link.href];
        if (requiredPermission) {
          return permissions.includes(requiredPermission);
        }
        
        // Dashboard is accessible by default for ADMIN and VIEWER (but viewers only see what's allowed)
        if (link.href === "/admin") return true;

        return false;
      })
    };
  }).filter(group => group.links.length > 0);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e2333] border-r border-white/10 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center">
              <span className="font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-lg tracking-wide">Spark Admin</span>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <NavGroup 
              key={idx} 
              group={group} 
              pathname={pathname} 
              setIsOpen={setIsOpen} 
            />
          ))}
        </div>

        {/* Profile & Footer Links */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Globe className="w-4 h-4" />
            View Live Site
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">Administrator</p>
              <p className="text-xs text-white/50 truncate">admin@email.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayoutClient({ 
  children, 
  role,
  permissions,
  ceremonyEvents = [],
  activeEventId = "all"
}: { 
  children: ReactNode;
  role: string;
  permissions: string[];
  ceremonyEvents?: { id: string; name: string; eventType: string }[];
  activeEventId?: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#11141d] flex text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        role={role}
        permissions={permissions}
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-[#161d2d] border-b border-white/5 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Event Selector */}
            <EventSelector events={ceremonyEvents} activeEventId={activeEventId} />

            {/* Quick Create Dropdown */}
            <Popover>
              <PopoverTrigger className="hidden md:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20">
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-1 bg-[#1e2333] border-white/10 text-white rounded-xl shadow-xl">
                <div className="px-2 py-1.5 text-xs font-semibold text-white/50 uppercase">Quick Actions</div>
                <Link href="/admin/guests?new=true" className="w-full text-left px-2 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> New Guest
                </Link>
                <Link href="/admin/budget?new=true" className="w-full text-left px-2 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Add Expense
                </Link>
                <div className="h-px bg-white/10 my-1" />
                <Link href="/admin/settings" className="w-full text-left px-2 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4 text-white/50" /> Settings
                </Link>
              </PopoverContent>
            </Popover>

          </div>

          <div className="flex items-center gap-2 lg:gap-4 ml-auto">
            <button className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors hidden sm:block">
              <Maximize className="w-5 h-5" />
            </button>
            
            <NotificationCenter />
            
            {/* Profile Dropdown */}
            <Popover>
              <PopoverTrigger className="flex items-center gap-2 p-1.5 pl-2 hover:bg-white/5 rounded-lg transition-colors">
                <span className="text-sm font-medium text-white hidden md:block">Administrator</span>
                <ChevronDown className="w-4 h-4 text-white/40 hidden md:block" />
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  A
                </div>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-1 bg-[#1e2333] border-white/10 text-white rounded-xl shadow-xl">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <p className="text-sm font-medium">Welcome!</p>
                </div>
                <button className="w-full text-left px-2 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                  My Account
                </button>
                <button className="w-full text-left px-2 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">
                  Settings
                </button>
                <div className="h-px bg-white/10 my-1" />
                <form action={logoutAction}>
                  <button type="submit" className="w-full text-left px-2 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </form>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
