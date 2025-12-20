import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { useSidebarContext } from "./sidebar-context";

const menuItemBaseStyles = cva(
  "rounded-lg px-3.5 font-medium text-dark-4 transition-all duration-200 dark:text-dark-6",
  {
    variants: {
      isActive: {
        true: "bg-[rgba(87,80,241,0.07)] text-primary hover:bg-[rgba(87,80,241,0.07)] dark:bg-[#FFFFFF1A] dark:text-white",
        false: "hover:bg-gray-100 hover:text-dark hover:dark:bg-[#FFFFFF1A] hover:dark:text-white",
      },
      // Add this variant
      isDestructive: {
        true: "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400",
      }
    },
    defaultVariants: {
      isActive: false,
      isDestructive: false,
    },
  },
);


export function MenuItem(
  props: {
    className?: string;
    children: React.ReactNode;
    isActive: boolean;
    isDestructive?: boolean; // Add this
  } & ({ as?: "button"; onClick: () => void } | { as: "link"; href: string }),
) {
  const { toggleSidebar, isMobile } = useSidebarContext();

  const styles = menuItemBaseStyles({
    isActive: props.isActive,
    isDestructive: props.isDestructive, // Pass it here
    className: props.as === "link" ? "relative block py-2" : "flex w-full items-center gap-2 py-3",
  });

  if (props.as === "link") {
    return (
      <Link
        href={props.href}
        onClick={() => isMobile && toggleSidebar()}
        className={cn(styles, props.className)}
      >
        {props.children}
      </Link>
    );
  }

  return (
    <button
      onClick={props.onClick}
      aria-expanded={props.isActive}
      className={cn(styles, props.className)}
    >
      {props.children}
    </button>
  );
}

