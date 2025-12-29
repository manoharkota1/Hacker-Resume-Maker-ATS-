"use client";

interface HackoraLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
}

export function HackoraLogo({
  size = "md",
  variant = "full",
  className = "",
}: HackoraLogoProps) {
  const sizeMap = {
    sm: { 
      icon: 28, 
      text: "text-base font-semibold",
      gap: "gap-2",
      tagline: false
    },
    md: { 
      icon: 36, 
      text: "text-lg font-bold",
      gap: "gap-2.5",
      tagline: true
    },
    lg: { 
      icon: 48, 
      text: "text-2xl font-bold",
      gap: "gap-3",
      tagline: true
    },
  };

  const config = sizeMap[size];

  // Shield with resume and checkmark logo
  const logoSvg = (
    <svg
      width={config.icon}
      height={config.icon}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm"
    >
      {/* Shield */}
      <path
        d="M256 40L416 104V256C416 344 336 416 256 456C176 416 96 344 96 256V104L256 40Z"
        fill="#0F2A44"
      />

      {/* Inner Shield */}
      <path
        d="M256 72L384 124V252C384 320 320 380 256 412C192 380 128 320 128 252V124L256 72Z"
        fill="#0B0F14"
      />

      {/* Resume Paper */}
      <rect x="186" y="156" width="140" height="180" rx="10" fill="#F9FAFB" />

      {/* Resume Lines */}
      <rect x="206" y="182" width="100" height="10" rx="5" fill="#4B5563" />
      <rect x="206" y="206" width="80" height="10" rx="5" fill="#4B5563" />
      <rect x="206" y="230" width="90" height="10" rx="5" fill="#4B5563" />
      <rect x="206" y="254" width="70" height="10" rx="5" fill="#4B5563" />

      {/* Check Mark */}
      <path
        d="M220 298L244 322L292 272"
        stroke="#22C55E"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === "icon") {
    return <div className={className}>{logoSvg}</div>;
  }

  return (
    <div className={className}>
      {logoSvg}
    </div>
  );
}

// Export the raw SVG for favicon generation
export function HackoraFavicon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield */}
      <path
        d="M256 40L416 104V256C416 344 336 416 256 456C176 416 96 344 96 256V104L256 40Z"
        fill="#0F2A44"
      />

      {/* Inner Shield */}
      <path
        d="M256 72L384 124V252C384 320 320 380 256 412C192 380 128 320 128 252V124L256 72Z"
        fill="#0B0F14"
      />

      {/* Resume Paper */}
      <rect x="186" y="156" width="140" height="180" rx="10" fill="#F9FAFB" />

      {/* Resume Lines */}
      <rect x="206" y="182" width="100" height="10" rx="5" fill="#4B5563" />
      <rect x="206" y="206" width="80" height="10" rx="5" fill="#4B5563" />
      <rect x="206" y="230" width="90" height="10" rx="5" fill="#4B5563" />
      <rect x="206" y="254" width="70" height="10" rx="5" fill="#4B5563" />

      {/* Check Mark */}
      <path
        d="M220 298L244 322L292 272"
        stroke="#22C55E"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default HackoraLogo;
