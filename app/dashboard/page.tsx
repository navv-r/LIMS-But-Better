"use client";

import Link from "next/link";

const departments = [
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    description: "Track and manage lab samples, reagents, and equipment.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
    accent: "rgba(74,124,247,0.7)",
    iconColor: "#4a7cf7",
    iconBg: "rgba(36,86,224,0.12)",
    borderGlow: "rgba(74,124,247,0.15)",
  },
  {
    name: "Processing",
    href: "/dashboard/processing",
    description: "Manage active workflows, tests, and sample processing queues.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    accent: "rgba(167,139,250,0.7)",
    iconColor: "#a78bfa",
    iconBg: "rgba(124,58,237,0.12)",
    borderGlow: "rgba(167,139,250,0.15)",
  },
  {
    name: "Shipments",
    href: "/dashboard/shipments",
    description: "View outgoing and incoming shipments and delivery status.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m8-11h3l3 5v4h-2m-4-9H9" />
      </svg>
    ),
    accent: "rgba(52,211,153,0.7)",
    iconColor: "#34d399",
    iconBg: "rgba(5,150,105,0.12)",
    borderGlow: "rgba(52,211,153,0.15)",
  },
  {
    name: "History Log",
    href: "/dashboard/history",
    description: "Audit trail of all lab activity, changes, and events.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "rgba(251,191,36,0.7)",
    iconColor: "#fbbf24",
    iconBg: "rgba(217,119,6,0.12)",
    borderGlow: "rgba(251,191,36,0.15)",
  },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Nav */}
      <nav className="nav-glass w-full px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2456e0, #4a7cf7)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">LIMS But Better</span>
        </div>
        <Link href="/" className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors" style={{ color: "#4a617f" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#7d9abd")}
          onMouseLeave={e => (e.currentTarget.style.color = "#4a617f")}>
          Sign out
        </Link>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-14">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#4a617f" }}>
              Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#d8e8f7" }}>
              Select a Module
            </h1>
            <div className="mt-3 h-px w-16" style={{ background: "linear-gradient(to right, #2456e0, transparent)" }} />
          </div>

          {/* Department cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <Link
                key={dept.name}
                href={dept.href}
                className="group card flex items-start gap-4 px-5 py-5 transition-all duration-200"
                style={{ borderLeftWidth: "3px", borderLeftColor: dept.accent }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = `rgba(10, 21, 42, 0.95)`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${dept.borderGlow}, inset 0 1px 0 rgba(255,255,255,0.05)`;
                  (e.currentTarget as HTMLElement).style.transform = `translateY(-2px)`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = ``;
                  (e.currentTarget as HTMLElement).style.boxShadow = ``;
                  (e.currentTarget as HTMLElement).style.transform = ``;
                }}
              >
                <div
                  className="flex-shrink-0 rounded-xl p-2.5 transition-colors"
                  style={{ background: dept.iconBg, color: dept.iconColor }}
                >
                  {dept.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold mb-1 tracking-tight" style={{ color: "#d8e8f7" }}>{dept.name}</h2>
                  <p className="text-xs leading-relaxed" style={{ color: "#4a617f" }}>{dept.description}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" style={{ color: "#3d5270" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
