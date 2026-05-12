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
      <nav className="w-full bg-cobalt px-8 py-4 flex items-center shadow-md">
        <span className="text-white text-xl font-semibold tracking-tight">LIMS But Better</span>
      </nav>

      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm card px-8 py-10 flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-semibold text-gray-800">Sign in</h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase">Laboratory Information System</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-600">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-600">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              className="mt-2 rounded-lg bg-cobalt py-2 text-sm font-semibold text-white hover:bg-cobalt-dark transition-colors shadow-sm"
            >
              Log in
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
