import React from "react";

interface AvatarLogoProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  type?: string;
  rounded?: "full" | "lg" | "md" | "sm";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

const roundedClasses = {
  full: "rounded-full",
  lg: "rounded-lg",
  md: "rounded-md",
  sm: "rounded-sm",
};

const getTypeColor = (type?: string): string => {
  const colors: Record<string, string> = {
    IIT: "bg-red-500",
    NIT: "bg-blue-500",
    IIIT: "bg-purple-500",
    GFTI: "bg-green-600",
    BITS: "bg-gray-700",
    Default: "bg-gray-400",
  };
  return colors[type || "Default"] || colors["Default"];
};

export const AvatarLogo: React.FC<AvatarLogoProps> = ({
  src,
  alt = "Logo",
  fallback = "?",
  size = "md",
  className = "",
  type,
  rounded = "full",
}) => {
  const [showFallback, setShowFallback] = React.useState(!src);

  return (
    <div
      className={`relative ${sizeClasses[size]} ${roundedClasses[rounded]} ${className}`}
    >
      {src && !showFallback ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-contain bg-white border border-[#d1d5db] p-1 ${roundedClasses[rounded]}`}
          onError={() => setShowFallback(true)}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold text-white ${getTypeColor(type)} ${roundedClasses[rounded]}`}
        >
          <span className="text-xs md:text-sm">{fallback}</span>
        </div>
      )}
    </div>
  );
};

export default AvatarLogo;
