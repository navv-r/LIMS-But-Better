"use client";

export function PageTransitionLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(6, 16, 30, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "loader-overlay-in 0.18s ease forwards",
      }}
    >
      <svg viewBox="0 0 160 165" width="190" height="190" style={{ overflow: "visible" }}>
        <defs>
          {/* Glow for the liquid stream */}
          <filter id="pourGlow" x="-80%" y="-40%" width="260%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Gradient: bright at tube mouth → fades as stream falls */}
          <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(170,215,255,0.98)" />
            <stop offset="60%"  stopColor="rgba(90,145,255,0.70)" />
            <stop offset="100%" stopColor="rgba(74,124,247,0.15)" />
          </linearGradient>
          {/* Horizontal gradient for beaker liquid body */}
          <linearGradient id="liquidBodyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(45,85,205,0.45)" />
            <stop offset="45%"  stopColor="rgba(74,124,247,0.60)" />
            <stop offset="100%" stopColor="rgba(45,85,205,0.45)" />
          </linearGradient>
          {/* Clip to the inside of the beaker walls */}
          <clipPath id="beakerInside">
            <rect x="39" y="90" width="82" height="58" />
          </clipPath>
        </defs>

        {/* ─────────────────────────────── BEAKER ─────────────────────────────── */}

        {/* Liquid body — scales up from bottom as beaker fills, fades out to reset */}
        <rect
          x="39" y="90" width="82" height="58"
          fill="url(#liquidBodyGrad)"
          clipPath="url(#beakerInside)"
          style={{
            transformOrigin: "80px 148px",
            animation: "lab-beaker-fill 4.2s ease-in-out infinite",
          }}
        />

        {/* Liquid surface shimmer — translates down from rim as fill rises */}
        <line
          x1="42" y1="90" x2="118" y2="90"
          stroke="rgba(160,215,255,0.80)"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ animation: "lab-surface-track 4.2s ease-in-out infinite" }}
        />

        {/* Beaker walls */}
        <path
          d="M39,90 L39,148 L121,148 L121,90"
          fill="none"
          stroke="rgba(74,124,247,0.68)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Beaker rim */}
        <line x1="30" y1="90" x2="130" y2="90"
          stroke="rgba(74,124,247,0.68)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Measurement marks */}
        <line x1="39" y1="110" x2="50" y2="110" stroke="rgba(74,124,247,0.28)" strokeWidth="1.2" />
        <line x1="39" y1="123" x2="55" y2="123" stroke="rgba(74,124,247,0.28)" strokeWidth="1.2" />
        <line x1="39" y1="136" x2="50" y2="136" stroke="rgba(74,124,247,0.28)" strokeWidth="1.2" />
        {/* Glass highlight (left inner edge) */}
        <line x1="42" y1="93" x2="42" y2="145"
          stroke="rgba(255,255,255,0.055)" strokeWidth="4.5" strokeLinecap="round" />

        {/* ──────────────────────── LIQUID STREAM (bezier) ────────────────────── */}

        {/* Main stream — cubic bezier curves rightward under gravity */}
        <path
          d="M 63,89 C 64,107 67,121 70,133"
          stroke="url(#streamGrad)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#pourGlow)"
          style={{ animation: "lab-stream-fade 4.2s ease-in-out infinite" }}
        />
        {/* Thin inner shimmer — offset slightly, adds depth */}
        <path
          d="M 65,90 C 66,109 68,123 71,134"
          stroke="rgba(200,235,255,0.30)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          style={{ animation: "lab-stream-fade 4.2s ease-in-out infinite" }}
        />

        {/* ─────────────────────── IMPACT RIPPLE & SPLASH ─────────────────────── */}

        {/* Inner ripple ring — tight, appears first */}
        <ellipse cx="70" cy="132" rx="4.5" ry="1.5"
          fill="none"
          stroke="rgba(160,215,255,0.90)"
          strokeWidth="1.2"
          style={{ animation: "lab-ripple-inner 4.2s ease-in-out infinite" }}
        />
        {/* Outer ripple ring — larger, slightly delayed */}
        <ellipse cx="70" cy="132" rx="9" ry="2.8"
          fill="none"
          stroke="rgba(130,190,255,0.40)"
          strokeWidth="0.9"
          style={{ animation: "lab-ripple-outer 4.2s ease-in-out infinite" }}
        />
        {/* Tiny splash dots */}
        <circle cx="63" cy="130" r="1.2"
          fill="rgba(150,205,255,0.65)"
          style={{ animation: "lab-splash-l 4.2s ease-in-out infinite" }}
        />
        <circle cx="77" cy="131" r="1"
          fill="rgba(150,205,255,0.55)"
          style={{ animation: "lab-splash-r 4.2s ease-in-out infinite" }}
        />

        {/* ──────────────────────────── RISING BUBBLES ────────────────────────── */}

        <circle cx="54" cy="143" r="2.6"
          fill="none" stroke="rgba(100,160,255,0.55)" strokeWidth="1"
          style={{ animation: "lab-bubble-a 4.2s ease-in-out infinite" }}
        />
        <circle cx="74" cy="141" r="1.9"
          fill="none" stroke="rgba(100,160,255,0.45)" strokeWidth="0.85"
          style={{ animation: "lab-bubble-b 4.2s ease-in-out infinite" }}
        />
        <circle cx="95" cy="144" r="2.3"
          fill="none" stroke="rgba(100,160,255,0.50)" strokeWidth="0.9"
          style={{ animation: "lab-bubble-c 4.2s ease-in-out infinite" }}
        />

        {/* ─────────────────────────── TEST TUBE GROUP ────────────────────────── */}

        <g
          style={{
            transformOrigin: "110px 70px",
            animation: "lab-tube-tilt 4.2s cubic-bezier(0.45,0,0.25,1) infinite",
          }}
        >
          {/* Tube body — proper path with hemispherical bottom arc */}
          <path
            d="M104,20 L104,64 A6,6 0 0,1 116,64 L116,20"
            fill="rgba(10,26,65,0.75)"
            stroke="rgba(74,124,247,0.90)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Liquid inside tube — fades as it pours out */}
          <rect
            x="106" y="28" width="8" height="35" rx="4"
            fill="rgba(80,135,255,0.75)"
            style={{ animation: "lab-tube-drain 4.2s ease-in-out infinite" }}
          />

          {/* Liquid meniscus (concave top surface) */}
          <path
            d="M106,28 Q110,31.5 114,28"
            fill="none"
            stroke="rgba(170,220,255,0.70)"
            strokeWidth="1.2"
            strokeLinecap="round"
            style={{ animation: "lab-tube-drain 4.2s ease-in-out infinite" }}
          />

          {/* Cap / stopper */}
          <rect x="102" y="12" width="16" height="10" rx="3"
            fill="rgba(50,90,200,0.48)"
            stroke="rgba(74,124,247,0.85)"
            strokeWidth="1.5"
          />

          {/* Glass shine stripe */}
          <line x1="107" y1="14" x2="107" y2="63"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Tube opening lip */}
          <line x1="104" y1="22" x2="116" y2="22"
            stroke="rgba(74,124,247,0.45)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      </svg>

      <p
        style={{
          marginTop: "10px",
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(100,155,255,0.85)",
          animation: "lab-text-pulse 1.5s ease-in-out infinite",
        }}
      >
        Loading
      </p>
    </div>
  );
}
