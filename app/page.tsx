"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Nav */}
      <nav className="nav-glass w-full px-8 py-4 flex items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2456e0, #4a7cf7)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">LIMS But Better</span>
        </div>
      </nav>

      {/* Centered glow behind card */}
      <main className="flex flex-1 items-center justify-center px-4 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #2456e0 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="card px-8 py-10 flex flex-col gap-7">

            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{ background: "linear-gradient(135deg, rgba(36,86,224,0.25), rgba(74,124,247,0.15))", border: "1px solid rgba(74,124,247,0.25)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" style={{ color: "#4a7cf7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#d8e8f7" }}>Welcome back</h1>
                <p className="text-xs font-medium tracking-widest uppercase mt-1" style={{ color: "#3d5270" }}>Secure Lab Access</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, rgba(74,124,247,0.2), transparent)" }} />

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@lab.com"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#7d9abd" }}>Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>

              <button type="submit" className="btn-primary mt-1 flex items-center justify-center gap-2">
                Sign In
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>

            {/* Footer note */}
            <p className="text-center text-xs" style={{ color: "#3d5270" }}>
              LIMS But Better · v1.0
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
