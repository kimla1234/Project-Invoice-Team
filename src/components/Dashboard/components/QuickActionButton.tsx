import React from "react";
import Link from "next/link";

interface QuickActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}

export function QuickActionButton({ href, icon, label, color }: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg p-4 transition-all hover:shadow-md ${color}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
