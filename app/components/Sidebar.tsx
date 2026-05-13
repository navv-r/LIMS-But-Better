"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useNavigate } from "@/app/providers/NavigationProvider";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    exact: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
  },
  {
    name: "Processing",
    href: "/dashboard/processing",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    name: "Shipments",
    href: "/dashboard/shipments",
    soon: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m8-11h3l3 5v4h-2m-4-9H9" />
      </svg>
    ),
  },
  {
    name: "History Log",
    href: "/dashboard/history",
    soon: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { navigate } = useNavigate();

  function isActive(item: { href: string; exact?: boolean }) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <aside
      className="flex flex-col w-56 shrink-0 sticky top-0 h-screen z-40"
      style={{
        background: "var(--nav-bg)",
        borderRight: "1px solid var(--border)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, var(--cobalt), var(--cobalt-light))" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--fg-primary)" }}>LIMS But Better</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        <p className="text-xs font-semibold tracking-widest uppercase px-2 mb-2" style={{ color: "var(--fg-muted)" }}>
          Modules
        </p>
        {navItems.map(item => {
          const active = isActive(item);
          return item.soon ? (
            <div
              key={item.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg select-none"
              style={{ color: "var(--fg-muted)", opacity: 0.5, cursor: "default" }}
            >
              {item.icon}
              <span className="text-sm font-medium flex-1">{item.name}</span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{ background: "rgba(74,124,247,0.08)", color: "var(--cobalt-light)", fontSize: "0.6rem", letterSpacing: "0.05em" }}
              >
                SOON
              </span>
            </div>
          ) : (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative w-full text-left"
              style={{
                color: active ? "var(--cobalt-light)" : "var(--fg-secondary)",
                background: active ? "rgba(74,124,247,0.12)" : "transparent",
                fontWeight: active ? 600 : 400,
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(74,124,247,0.07)";
                  (e.currentTarget as HTMLElement).style.color = "var(--fg-primary)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--fg-secondary)";
                }
              }}
            >
              {active && (
                <span
                  className="absolute left-0 w-0.5 h-5 rounded-r"
                  style={{ background: "var(--cobalt-light)" }}
                />
              )}
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-3 px-3 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium" style={{ color: "var(--fg-muted)" }}>Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all w-full text-left"
          style={{ color: "var(--fg-muted)", border: "none", cursor: "pointer", background: "transparent" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--fg-secondary)";
            (e.currentTarget as HTMLElement).style.background = "rgba(74,124,247,0.06)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
