"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import HeroCTA from "./HeroCTA";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
];

interface MarketingHeaderProps {
  isAuthenticated: boolean;
}

export default function MarketingHeader({ isAuthenticated }: MarketingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((item) => document.querySelector(item.href)).filter(
      (el): el is Element => el !== null,
    );
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHash(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-black/5 bg-white/90 shadow-[0_1px_12px_rgba(0,0,0,0.04)] backdrop-blur-md"
          : "border-b border-transparent bg-white/70 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link href="/" className="relative h-8 w-28 shrink-0">
          <Image
            src="/dakshya_main.png"
            alt="Dakshya"
            fill
            sizes="112px"
            className="object-cover"
            priority
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => {
            const active = activeHash === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`group relative py-2 text-sm font-medium transition-colors duration-200 ${
                  active ? "text-primary" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-[1.5px] rounded-full bg-primary transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                  aria-hidden
                />
              </a>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {!isAuthenticated && (
            <Link
              href="/login"
              className="text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Log in
            </Link>
          )}
          <HeroCTA
            isAuthenticated={isAuthenticated}
            startLabel="Get Started"
            returningLabel="Go to Dashboard"
            className="group inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md"
          />
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          className="border-t border-black/5 bg-white px-6 pb-6 pt-4 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-11 items-center rounded-lg px-3 py-3 text-sm transition-colors ${
                  activeHash === item.href
                    ? "font-bold text-primary"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4">
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-xl border border-black/10 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                Log in
              </Link>
            )}
            <HeroCTA
              isAuthenticated={isAuthenticated}
              startLabel="Get Started"
              returningLabel="Go to Dashboard"
              className="flex min-h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            />
          </div>
        </div>
      )}
    </header>
  );
}
