"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export interface HudMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  href?: string;
  external?: boolean;
  active?: boolean;
  onClick?: () => void;
}

/** Mobile-only hamburger button + dropdown panel, shared by the homepage HUD
 * and the standalone-page SiteHeader. Both headers cram 6-8 pills into one
 * row, which either wraps into a messy second line or (previously) just
 * hid half the links outright on small screens — this collects everything
 * that doesn't fit into one button so nothing is actually unreachable on
 * mobile. Hidden entirely at desktop widths via .hud-hamburger's own CSS;
 * the calling header keeps rendering its normal pill row there unchanged. */
export function HudMobileMenu({ items }: { items: HudMenuItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="hud-link hud-button hud-hamburger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="hud-mobile-panel"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="hud-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={close}
              aria-hidden="true"
            />
            <motion.nav
              id="hud-mobile-panel"
              className="hud-mobile-panel"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {items.map((item) => {
                const content = (
                  <>
                    {item.icon}
                    {item.label}
                  </>
                );
                const className = `hud-mobile-link${item.active ? " hud-mobile-link-active" : ""}`;

                if (item.href && item.external) {
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={className}
                      onClick={() => {
                        item.onClick?.();
                        close();
                      }}
                    >
                      {content}
                    </a>
                  );
                }

                // Same-page hash anchors (e.g. "#skills") — a plain <a> lets
                // the browser's native anchor scroll handle it, same as the
                // desktop pill this replaces; next/link's client-side
                // navigation for a hash-only href is unreliable here.
                if (item.href?.startsWith("#")) {
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      className={className}
                      onClick={() => {
                        item.onClick?.();
                        close();
                      }}
                    >
                      {content}
                    </a>
                  );
                }

                if (item.href) {
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={className}
                      onClick={() => {
                        item.onClick?.();
                        close();
                      }}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={className}
                    onClick={() => {
                      item.onClick?.();
                      close();
                    }}
                  >
                    {content}
                  </button>
                );
              })}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
