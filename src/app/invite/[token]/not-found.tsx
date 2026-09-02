import Link from "next/link";

export default function InvitationNotFound() {
  return (
    <div className="min-h-screen bg-[#F8F2E8] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-3xl font-serif text-[#10233B]">Invitation Not Found</h1>
        <p className="text-lg text-[#10233B]/70 font-serif italic">
          We could not locate this personalized invitation.
        </p>
        <div className="w-16 h-px bg-[#D7B56D] mx-auto opacity-50" />
        <p className="text-sm font-sans text-[#10233B]/60 leading-relaxed">
          The link you followed may be incorrect, or the invitation has been removed.
        </p>
        <div className="pt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-[#D7B56D]/30 text-[#10233B] font-sans text-xs uppercase tracking-widest hover:bg-[#D7B56D]/10 transition-colors"
          >
            Go to Wedding Website
          </Link>
        </div>
      </div>
    </div>
  );
}
