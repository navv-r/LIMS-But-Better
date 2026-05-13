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
        background: "rgba(6, 16, 30, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: "loader-overlay-in 0.18s ease forwards",
      }}
    >
      <svg
        viewBox="0 0 160 160"
        width="180"
        height="180"
        style={{ overflow: "visible" }}
      >
        <defs>
          <clipPath id="beakerLiquidClip">
            <rect x="46" y="86" width="68" height="58" />
          </clipPath>
        </defs>

        {/* Beaker liquid fill (grows from bottom) */}
        <rect
          x="46"
          y="86"
          width="68"
          height="58"
          fill="rgba(74,124,247,0.32)"
          clipPath="url(#beakerLiquidClip)"
          style={{
            transformOrigin: "80px 144px",
            animation: "lab-beaker-fill 3s ease-in-out forwards",
          }}
        />

        {/* Beaker outline */}
        <path
          d="M45 85 L45 145 L115 145 L115 85"
          fill="none"
          stroke="rgba(74,124,247,0.65)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Beaker rim */}
        <line
          x1="36" y1="85" x2="124" y2="85"
          stroke="rgba(74,124,247,0.65)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Measurement marks */}
        <line x1="46" y1="106" x2="54" y2="106" stroke="rgba(74,124,247,0.28)" strokeWidth="1.2" />
        <line x1="46" y1="119" x2="58" y2="119" stroke="rgba(74,124,247,0.28)" strokeWidth="1.2" />
        <line x1="46" y1="132" x2="54" y2="132" stroke="rgba(74,124,247,0.28)" strokeWidth="1.2" />

        {/* Test tube group — pivots at (110, 70) which is the rounded bottom */}
        <g
          style={{
            transformOrigin: "110px 70px",
            animation: "lab-tube-tilt 3s ease-in-out forwards",
          }}
        >
          {/* Tube body */}
          <rect
            x="104" y="20" width="12" height="50" rx="6"
            fill="rgba(20,45,100,0.55)"
            stroke="rgba(74,124,247,0.75)"
            strokeWidth="2"
          />
          {/* Liquid inside tube */}
          <rect
            x="106" y="36" width="8" height="32" rx="4"
            fill="rgba(74,124,247,0.70)"
          />
          {/* Shine highlight */}
          <rect
            x="106.5" y="22" width="2.5" height="42" rx="1.25"
            fill="rgba(255,255,255,0.14)"
          />
        </g>

        {/* Liquid stream from tube opening into beaker */}
        <line
          x1="70" y1="87" x2="73" y2="128"
          stroke="rgba(74,124,247,0.72)"
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{ animation: "lab-stream-fade 3s ease-in-out forwards" }}
        />

        {/* Falling drops */}
        <circle
          cx="68" cy="93" r="2.8"
          fill="rgba(74,124,247,0.8)"
          style={{ animation: "lab-drop-a 3s ease-in forwards" }}
        />
        <circle
          cx="71" cy="96" r="2.2"
          fill="rgba(74,124,247,0.65)"
          style={{ animation: "lab-drop-b 3s ease-in forwards" }}
        />
        <circle
          cx="69" cy="99" r="1.8"
          fill="rgba(74,124,247,0.55)"
          style={{ animation: "lab-drop-c 3s ease-in forwards" }}
        />
      </svg>

      <p
        style={{
          marginTop: "8px",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(74,124,247,0.75)",
          animation: "lab-text-pulse 1.4s ease-in-out infinite",
        }}
      >
        Loading
      </p>
    </div>
  );
}
