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
    sm: { icon: 32, text: "text-sm" },
    md: { icon: 40, text: "text-lg" },
    lg: { icon: 56, text: "text-2xl" },
  };

  const { icon: iconSize, text: textSize } = sizeMap[size];

  // Professional logo: Monogram "H" with resume bar + checkmark badge
  const logoSvg = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient
          id="hackora-grad"
          x1="12"
          y1="12"
          x2="52"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* Outer shell */}
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#0f172a" />

      {/* Monogram H - left and right pillars */}
      <rect
        x="16"
        y="14"
        width="10"
        height="36"
        rx="5"
        fill="url(#hackora-grad)"
      />
      <rect
        x="38"
        y="14"
        width="10"
        height="36"
        rx="5"
        fill="url(#hackora-grad)"
      />

      {/* Center bar (resume line) */}
      <rect
        x="22"
        y="28"
        width="20"
        height="8"
        rx="4"
        fill="#e5f7ef"
        opacity="0.9"
      />

      {/* Accent spark */}
      <circle cx="24" cy="18" r="2" fill="#34d399" opacity="0.8" />
      <circle cx="40" cy="18" r="2" fill="#34d399" opacity="0.8" />

      {/* Accent dot for balance */}
      <circle cx="46" cy="42" r="4" fill="#34d399" opacity="0.85" />

      {/* Soft inner glow */}
      <rect
        x="8"
        y="8"
        width="48"
        height="48"
        rx="12"
        stroke="#34d399"
        strokeWidth="1"
        opacity="0.2"
      />
    </svg>
  );

  if (variant === "icon") {
    return <div className={className}>{logoSvg}</div>;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {logoSvg}
      <div className="flex flex-col">
        <span
          className={`font-bold text-slate-900 leading-tight tracking-tight ${textSize}`}
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Hackora
        </span>
        {size !== "sm" && (
          <span className="text-xs text-slate-500 leading-tight">
            Build. Stand Out. Get Hired.
          </span>
        )}
      </div>
    </div>
  );
}

// Export the raw SVG for favicon generation
export function HackoraFavicon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="hackora-grad-fav"
          x1="12"
          y1="12"
          x2="52"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#0f172a" />
      <rect
        x="16"
        y="14"
        width="10"
        height="36"
        rx="5"
        fill="url(#hackora-grad-fav)"
      />
      <rect
        x="38"
        y="14"
        width="10"
        height="36"
        rx="5"
        fill="url(#hackora-grad-fav)"
      />
      <rect
        x="22"
        y="28"
        width="20"
        height="8"
        rx="4"
        fill="#e5f7ef"
        opacity="0.9"
      />
      <circle cx="46" cy="42" r="4" fill="#34d399" opacity="0.85" />
    </svg>
  );
}

export default HackoraLogo;
