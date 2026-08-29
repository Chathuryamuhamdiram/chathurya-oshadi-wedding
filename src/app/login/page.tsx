"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await loginAction(formData);
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eee7db] p-4 font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #10233b 1px, transparent 0)", backgroundSize: "24px 24px" }} />
           
      <div className="w-full max-w-md relative z-10">
        <Link 
          href="/" 
          className="absolute -top-12 left-0 text-xs font-semibold tracking-widest text-[#9a8060] hover:text-[#10233b] flex items-center gap-2 transition-colors uppercase"
        >
          <ArrowLeft size={14} /> Back to site
        </Link>

        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(16,35,59,0.08)] overflow-hidden border border-[#c3a367]/20">
          
          <div className="bg-[#10233b] px-8 py-10 text-center relative">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="w-12 h-12 rounded-full bg-[#d7b56d]/10 flex items-center justify-center mx-auto mb-4 border border-[#d7b56d]/30">
              <Lock className="w-5 h-5 text-[#d7b56d]" />
            </div>
            <h1 className="font-serif text-3xl text-white tracking-wider mb-2">Admin Panel</h1>
            <p className="text-[#d7b56d] text-[10px] uppercase tracking-[0.25em] font-semibold">Authorized Personnel Only</p>
          </div>

          <div className="p-8">
            <form action={formAction} className="space-y-6">
              
              {state?.error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
                  {state.error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#10233b] block ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </div>
                  <Input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="Enter your email"
                    className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-[#c3a367] focus-visible:border-[#c3a367]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#10233b] block ml-1">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <Input 
                    type="password" 
                    name="password" 
                    required 
                    placeholder="Enter your password"
                    className="pl-11 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-[#c3a367] focus-visible:border-[#c3a367]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-[#10233b] hover:bg-[#172e4c] text-[#d7b56d] font-semibold tracking-widest uppercase text-xs transition-colors mt-2"
              >
                {isPending ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Authenticating...</span>
                ) : "Log In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
