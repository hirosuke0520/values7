import React from "react";
// import { CircleUser } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">価値観セブン</h1>
        </div>
      </header> */}
      <main className="max-w-md mx-auto p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20">
          {children}
        </div>
      </main>
    </div>
  );
}
