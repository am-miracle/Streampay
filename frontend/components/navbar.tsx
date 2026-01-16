"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? "bg-zinc-950/80 backdrop-blur-md border-zinc-800 py-3" : "bg-transparent border-transparent py-6"}`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">
            StreamPay
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works", "Use Cases", "Creators"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-medium text-zinc-400 hover:text-mint-400 transition-colors"
            >
              {item}
            </a>
          ))}
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-400 hover:text-mint-400 transition-colors"
          >
            Dashboard
          </Link>
          <Link href="/demo">
            <Button variant="secondary" className="h-9 px-4 text-xs">
              Try Demo
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden text-zinc-400"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-zinc-900 border-b border-zinc-800 p-6 md:hidden flex flex-col gap-4">
          {["Features", "How it Works", "Use Cases", "Creators"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-400 hover:text-white"
            >
              {item}
            </a>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-zinc-400 hover:text-white"
          >
            Dashboard
          </Link>
          <Link href="/demo" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="primary" className="w-full">
              Try Demo
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
