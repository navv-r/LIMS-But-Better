import Link from "next/link";

const departments = [
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    description: "Track and manage lab samples, reagents, and equipment.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
    accent: "border-l-blue-500",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    name: "Processing",
    href: "/dashboard/processing",
    description: "Manage active workflows, tests, and sample processing queues.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    accent: "border-l-violet-500",
    iconBg: "bg-violet-50 text-violet-600",
  },
  {
    name: "Shipments",
    href: "/dashboard/shipments",
    description: "View outgoing and incoming shipments and delivery status.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m8-11h3l3 5v4h-2m-4-9H9" />
      </svg>
    ),
    accent: "border-l-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "History Log",
    href: "/dashboard/history",
    description: "Audit trail of all lab activity, changes, and events.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "border-l-amber-500",
    iconBg: "bg-amber-50 text-amber-600",
  },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <nav className="w-full bg-cobalt px-8 py-4 flex items-center justify-between shadow-md">
        <span className="text-white text-xl font-semibold tracking-tight">LIMS But Better</span>
        <Link href="/" className="text-blue-200 hover:text-white text-sm transition-colors">
          Sign out
        </Link>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Departments</h1>
            <p className="text-sm text-gray-400 tracking-wide uppercase">Select a module to continue</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <Link
                key={dept.name}
                href={dept.href}
                className={`card flex items-start gap-4 px-5 py-5 border-l-4 ${dept.accent} hover:shadow-md transition-shadow`}
              >
                <div className={`flex-shrink-0 rounded-xl p-2.5 ${dept.iconBg}`}>
                  {dept.icon}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-0.5">{dept.name}</h2>
                  <p className="text-sm text-gray-400 leading-snug">{dept.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
