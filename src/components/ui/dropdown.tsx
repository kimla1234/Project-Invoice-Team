"use client";

import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";
import { SetStateActionType } from "@/types/set-state-action-type";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";

type DropdownContextType = {
  isOpen: boolean;
  handleOpen: () => void;
  handleClose: () => void;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdownContext must be used within a Dropdown");
  }
  return context;
}

type DropdownProps = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: SetStateActionType<boolean>;
};

export function Dropdown({ children, isOpen, setIsOpen }: DropdownProps) {
  const triggerRef = useRef<HTMLElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;

      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.removeProperty("pointer-events");

      setTimeout(() => {
        triggerRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
  }

  function handleOpen() {
    setIsOpen(true);
  }

  return (
    <DropdownContext.Provider value={{ isOpen, handleOpen, handleClose }}>
      <div className="relative" onKeyDown={handleKeyDown}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

type DropdownContentProps = {
  align?: "start" | "end" | "center";
  className?: string;
  children: React.ReactNode;
};



export function DropdownContent({
  children,
  align = "center",
  className,
}: DropdownContentProps) {
  const { isOpen, handleClose } = useDropdownContext();

  // 1. Define the close logic in a separate function
  const handleClickOutside = (event: any) => {
    if (!isOpen) return;

    const target = event?.target as HTMLElement;

    // Check if the click is inside a Portal or a Sheet
    const isInsidePortal = target?.closest('[data-radix-portal]');
    const isInsideDialog = target?.closest('[role="dialog"]');

    // If it's in a portal or dialog, do nothing (don't close)
    if (isInsidePortal || isInsideDialog) {
      return;
    }

    handleClose();
  };

  // 2. Pass the function to the hook. 
  // If your hook only accepts 0 arguments, use an arrow function wrapper:
  const contentRef = useClickOutside<HTMLDivElement>(() => {
    // We call our handler and pass the window event manually to avoid TS errors
    handleClickOutside(window.event);
  });

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        "fade-in-0 zoom-in-95 pointer-events-auto absolute z-[9999] mt-2 min-w-[8rem] rounded-lg",
        {
          "animate-in right-0": align === "end",
          "left-0": align === "start",
          "left-1/2 -translate-x-1/2": align === "center",
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

type DropdownTriggerProps = React.HTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { handleOpen, isOpen } = useDropdownContext();

  return (
    <button
      className={className}
      onClick={handleOpen}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
    </button>
  );
}

export function DropdownClose({ children }: PropsWithChildren) {
  const { handleClose } = useDropdownContext();

  return <div onClick={handleClose}>{children}</div>;
}

// បន្ថែម DropdownMenuItem ទៅក្នុង dropdown.tsx របស់អ្នក
export function DropdownMenuItem({ 
  children, 
  className, 
  onSelect 
}: { 
  children: React.ReactNode; 
  className?: string;
  onSelect?: (e: any) => void;
}) {
  const { handleClose } = useDropdownContext();

  const handleClick = (e: React.MouseEvent) => {
    // Stop the event from bubbling to the contentRef's click listener
    e.stopPropagation();

    let isPrevented = false;
    const customEvent = {
      preventDefault: () => { isPrevented = true; }
    };

    if (onSelect) {
      onSelect(customEvent);
    }

    if (!isPrevented) {
      handleClose();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn("cursor-pointer outline-none", className)}
    >
      {children}
    </div>
  );
}