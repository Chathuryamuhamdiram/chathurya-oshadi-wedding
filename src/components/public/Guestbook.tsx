"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { addGuestbookEntry } from "@/app/(public)/actions";

/* card rotation pattern so notes feel hand-placed */
const ROTATIONS = ["-1deg", "1.2deg", "0deg", "-0.8deg", "1deg"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as any },
});

export function Guestbook({ entries }: { entries: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const memory = formData.get("memory") as string;
    if (memory?.trim()) {
      const msg = formData.get("message") as string;
      formData.set("message", msg + "\n— Memory: " + memory.trim());
    }
    const res = await addGuestbookEntry(formData);
    setIsSubmitting(false);
    if (res.success) {
      setSuccess(true);
      (document.getElementById("guestbook-form") as HTMLFormElement).reset();
      setTimeout(() => setSuccess(false), 6000);
    }
  }

  return (
    <section
      id="guestbook"
      className="relative w-full overflow-hidden bg-[#F5EFE1] py-20 md:py-32 px-5 lg:px-10"
    >
      {/* paper grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")` }} />



      <div className="relative z-10 mx-auto max-w-[1180px]">

        {/* HEADER */}
        <motion.div {...fadeUp(0)} className="mb-14 md:mb-20 flex flex-col items-center text-center">
          <h2 className="font-serif text-[3rem] md:text-[5.5rem] tracking-[0.22em] text-[#10233B] font-normal leading-none mb-5">
            GUEST BOOK
          </h2>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-[1px] w-10 bg-[#C8A45A]/70" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#C8A45A]/70" />
            <div className="h-[1px] w-10 bg-[#C8A45A]/70" />
          </div>
          <p className="font-sans text-[9px] md:text-[11px] uppercase tracking-[0.32em] font-semibold text-[#C8A45A] mb-5">
            Leave your wishes for Chathurya &amp; Oshadi
          </p>
          <p className="text-[#8A8379] font-serif text-sm md:text-[15px] italic leading-relaxed max-w-sm">
            Your kind words and prayers mean the world to us.<br />
            Please share your blessings and memories with love.
          </p>
        </motion.div>

        {/* TWO COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-[45%_55%] gap-10 lg:gap-16 items-start">

          {/* LEFT – FORM */}
          <motion.div {...fadeUp(0.15)} className="sticky top-28">
            <div className="relative border border-[#C8A45A]/50 bg-[#FDFAF4] p-8 md:p-10">
              <div className="absolute inset-2 border border-[#C8A45A]/15 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-col items-center mb-8">
                  <h3 className="font-serif text-[1.1rem] md:text-xl text-[#10233B] tracking-[0.18em] uppercase mb-3">
                    Share Your Wishes
                  </h3>
                  <div className="h-[1px] w-14 bg-[#C8A45A]/60" />
                </div>

                <form id="guestbook-form" action={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="gb-name"
                      className="block text-[9px] uppercase tracking-[0.22em] text-[#10233B] mb-2 font-sans font-bold">
                      Your Name
                    </label>
                    <input id="gb-name" required name="name" placeholder="Enter your name"
                      className="w-full bg-[#F5EFE1] border border-[#DED2C1] focus:border-[#C8A45A] focus:ring-2 focus:ring-[#C8A45A]/20 outline-none py-3 px-4 text-[#10233B] font-sans text-sm placeholder:text-[#8A8379]/60 transition-all rounded-[2px]" />
                  </div>
                  <div>
                    <label htmlFor="gb-message"
                      className="block text-[9px] uppercase tracking-[0.22em] text-[#10233B] mb-2 font-sans font-bold">
                      Message / Wishes
                    </label>
                    <textarea id="gb-message" required name="message" rows={4}
                      placeholder="Write your message or wishes..."
                      className="w-full bg-[#F5EFE1] border border-[#DED2C1] focus:border-[#C8A45A] focus:ring-2 focus:ring-[#C8A45A]/20 outline-none py-3 px-4 text-[#10233B] font-sans text-sm placeholder:text-[#8A8379]/60 resize-none transition-all rounded-[2px]" />
                  </div>
                  <div>
                    <label htmlFor="gb-memory"
                      className="block text-[9px] uppercase tracking-[0.22em] text-[#10233B] mb-2 font-sans font-bold">
                      Share a Memory{" "}
                      <span className="normal-case text-[#8A8379] font-normal">(Optional)</span>
                    </label>
                    <input id="gb-memory" name="memory" placeholder="A special memory with the couple..."
                      className="w-full bg-[#F5EFE1] border border-[#DED2C1] focus:border-[#C8A45A] focus:ring-2 focus:ring-[#C8A45A]/20 outline-none py-3 px-4 text-[#10233B] font-sans text-sm placeholder:text-[#8A8379]/60 transition-all rounded-[2px]" />
                  </div>

                  <div className="pt-2">
                    <motion.button type="submit" disabled={isSubmitting}
                      whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(16,35,59,0.18)" }}
                      whileTap={{ y: 0 }}
                      className="group w-full bg-[#10233B] text-[#D7B56D] border border-[#C8A45A]/40 py-4 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="font-sans uppercase tracking-[0.22em] text-[10px] font-bold">
                        {isSubmitting ? "Submitting…" : "Submit Your Wishes"}
                      </span>
                      {!isSubmitting && (
                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                      )}
                    </motion.button>
                  </div>

                  {success && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-[#F5EFE1] border border-[#C8A45A]/30 p-4 text-center">
                      <p className="font-serif text-[#10233B] text-sm font-bold tracking-wide mb-1">Thank You</p>
                      <p className="font-serif text-[#8A8379] text-xs italic">
                        Your wishes have been received and will appear once approved.
                      </p>
                    </motion.div>
                  )}

                  <p className="text-center text-[#C8A45A] text-[9px] uppercase tracking-[0.22em] font-sans pt-2">
                    ♡ &nbsp;Thank you for being a part of our journey
                  </p>
                </form>
              </div>
            </div>
          </motion.div>

          {/* RIGHT – MESSAGES */}
          <div>
            <motion.div {...fadeUp(0.2)} className="mb-8 text-center md:text-left">
              <h3 className="font-serif text-[1rem] md:text-lg text-[#10233B] uppercase tracking-[0.22em] mb-3">
                Wishes From Our Loved Ones
              </h3>
              <div className="h-[1px] w-32 bg-[#C8A45A]/50 mx-auto md:mx-0" />
            </motion.div>

            {entries.length === 0 ? (
              <motion.div {...fadeUp(0.3)} className="py-24 flex flex-col items-center">
                <div className="relative border border-[#DED2C1] bg-[#FDFAF4] p-10 max-w-xs w-full text-center shadow-sm">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-5 bg-[#E2D9C8] opacity-80" />
                  <p className="text-[#8A8379] font-serif italic text-base">
                    Be the first to leave your wishes for us.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="columns-1 sm:columns-2 gap-5 space-y-5">
                {entries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-4%" }}
                    transition={{ duration: 0.6, delay: (i % 4) * 0.09 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    style={{ rotate: ROTATIONS[i % ROTATIONS.length] }}
                    className="break-inside-avoid relative bg-[#FDFAF4] border border-[#DED2C1]/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 md:p-7 transition-shadow duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)]"
                  >
                    {i % 2 === 0 ? (
                      <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 w-14 h-[22px] bg-[#E4DCC8] opacity-75 rotate-[-1deg]" />
                    ) : (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C8A45A]/30 border border-[#C8A45A]/40" />
                    )}

                    <div className="text-[#C8A45A] font-serif text-5xl leading-none mb-1 select-none -ml-1 opacity-80">"</div>



                    <p className="text-[#10233B]/85 font-serif italic leading-relaxed text-[14px] md:text-[15px] mb-6 whitespace-pre-wrap">
                      {entry.message}
                    </p>
                    <div className="flex items-center justify-end gap-3 mt-auto pt-2">
                      <div className="w-5 h-[1px] bg-[#C8A45A]" />
                      <p className="text-[#10233B] font-sans text-[9px] uppercase tracking-[0.28em] font-bold">
                        {entry.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
