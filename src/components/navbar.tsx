'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Aktualności' },
    { href: '/terminarz', label: 'Terminarz' },
    { href: '/tabela', label: 'Tabela' },
    { href: '/statystyki', label: 'Statystyki' },
    { href: '/kluby', label: 'Kluby' },
    { href: '/turnieje', label: 'Turnieje' },
    { href: '/sklep', label: 'Sklep' },
    { href: '/o-nas', label: 'O nas' },
  ];

  return (
    <div className={`w-full sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'py-0' : 'py-2'}`}>
      {/* Main Navigation */}
      <div className={`transition-all duration-500 ${
        scrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#00ccff]/10 shadow-[0_4px_30px_rgba(0,204,255,0.1)]'
          : 'bg-black/60 backdrop-blur-md border-b border-white/5 shadow-2xl'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="py-2 group relative">
              <div className="absolute inset-0 bg-[#00ccff]/0 group-hover:bg-[#00ccff]/10 rounded-xl transition-colors duration-300 blur-xl" />
              <Image
                src="https://i.ibb.co/TB027G07/czarnepff-1.png"
                alt="PFF Logo"
                width={200}
                height={80}
                className={`w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-all duration-300 ${
                  scrolled ? 'h-14' : 'h-20'
                }`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-5 py-3 text-lg font-black tracking-tighter uppercase transition-all duration-300 group ${
                      isActive ? 'text-[#00ccff]' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {/* Hover background */}
                    <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-[#00ccff]/10'
                        : 'bg-white/0 group-hover:bg-white/5'
                    }`} />
                    {/* Active indicator */}
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#00ccff] to-[#0066ff] transition-all duration-300 ${
                      isActive ? 'w-1/2' : 'w-0 group-hover:w-1/4'
                    }`} />
                    {/* Glow effect */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#00ccff]/30 blur-md" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {/* Season selector */}
              <div className="relative group">
                <select className="appearance-none px-5 py-2.5 pr-10 bg-white/5 text-white border border-white/10 rounded-xl text-sm font-black hover:bg-white/10 hover:border-[#00ccff]/30 transition-all cursor-pointer focus:outline-none focus:border-[#00ccff]/50">
                  <option>2025/2026</option>
                  <option>2024/2025</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-[#00ccff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-black uppercase tracking-tighter transition-all ${
                    isActive
                      ? 'bg-[#00ccff]/10 text-[#00ccff] border-l-2 border-[#00ccff]'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
