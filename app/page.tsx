export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <nav className="w-full bg-blue-600 px-8 py-4 flex items-center">
        <span className="text-white text-xl font-semibold tracking-tight">LIMS</span>
      </nav>

      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md px-8 py-10 flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-gray-800 text-center">Sign in</h1>

          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="mt-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Log in
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
