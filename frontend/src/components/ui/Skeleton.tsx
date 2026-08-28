import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`bg-neutral-200/80 rounded-md animate-pulse ${className}`}
    />
  );
};
