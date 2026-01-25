"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-xl" },
    md: { icon: 40, text: "text-2xl" },
    lg: { icon: 56, text: "text-4xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <svg width={icon} height={icon} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>

        {/* Central circle */}
        <circle
          cx="32"
          cy="32"
          r="12"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="32" cy="32" r="5" fill="url(#logoGradient)" />

        {/* Connection lines */}
        <line
          x1="20"
          y1="32"
          x2="10"
          y2="32"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="44"
          y1="32"
          x2="54"
          y2="32"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="32"
          y1="20"
          x2="32"
          y2="10"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="32"
          y1="44"
          x2="32"
          y2="54"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Outer nodes */}
        <circle cx="10" cy="32" r="4" fill="url(#logoGradient)" />
        <circle cx="54" cy="32" r="4" fill="url(#logoGradient)" />
        <circle cx="32" cy="10" r="4" fill="url(#logoGradient)" />
        <circle cx="32" cy="54" r="4" fill="url(#logoGradient)" />
      </svg>

      {/* Text */}
      {showText && (
        <span
          className={`${text} font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400`}
        >
          LLMNet
        </span>
      )}
    </div>
  );
}
