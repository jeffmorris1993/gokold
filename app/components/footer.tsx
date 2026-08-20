export default function Footer() {
  return (
    <footer
      className="border-t border-[rgba(231,227,219,0.1)] bg-kold"
      style={{ padding: "clamp(60px, 10vh, 120px) clamp(20px, 5vw, 80px) 48px" }}
    >
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-10">
        <div
          className="font-normal text-[#1f2024]"
          style={{ fontSize: "clamp(2.4rem, 7vw, 5.6rem)", lineHeight: 0.9, letterSpacing: "0.06em" }}
        >
          KOLD
        </div>
        <div
          className="flex flex-wrap font-mono text-[11px] uppercase tracking-[0.2em]"
          style={{ gap: "clamp(20px, 3vw, 48px)" }}
        >
          <a href="#design" className="text-[#807c76] hover:text-kold-gold">
            Product
          </a>
          <a href="#faq" className="text-[#807c76] hover:text-kold-gold">
            FAQ
          </a>
          <a href="#top" className="text-[#807c76] hover:text-kold-gold">
            Privacy
          </a>
          <a href="#early-access" className="text-[#807c76] hover:text-kold-gold">
            Contact
          </a>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1280px] font-mono text-[10px] uppercase tracking-[0.18em] text-[#4b4944]">
        © 2026 KOLD
      </div>
    </footer>
  );
}
