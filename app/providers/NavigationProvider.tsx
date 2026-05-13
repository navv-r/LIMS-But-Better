"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PageTransitionLoader } from "@/app/components/PageTransitionLoader";

type NavContextType = { navigate: (href: string) => void };

const NavContext = createContext<NavContextType>({ navigate: () => {} });

export function useNavigate() {
  return useContext(NavContext);
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;
      setLoading(true);
      setTimeout(() => {
        router.push(href);
        setLoading(false);
      }, 3000);
    },
    [router, pathname],
  );

  return (
    <NavContext.Provider value={{ navigate }}>
      {loading && <PageTransitionLoader />}
      {children}
    </NavContext.Provider>
  );
}
