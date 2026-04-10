import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
      {children}
    </main>
    <footer className="bg-maple-dark/80 backdrop-blur-md border-t border-maple-border py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
        <img src="/assets/maple-icon.png" alt="" className="w-4 h-4 inline-block" /> MapleStory Classic Marketplace - Developed with <span className="text-red-400">❤️</span> by Osher dror
      </div>
    </footer>
  </div>
);
