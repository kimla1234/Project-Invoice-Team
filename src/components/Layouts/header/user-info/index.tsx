"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { useRouter } from "next/navigation"; // Import router for logout
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface User {
  fullName: string;
  email: string;
  photo: string | null;
}

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);




  useEffect(() => {
    const loadUser = () => {
      const sessionData = localStorage.getItem("user_session");
      if (sessionData) {
        setUser(JSON.parse(sessionData));
      }
    };

    loadUser(); // Load on mount

    // Listen for the custom event we created
    window.addEventListener("local-storage-update", loadUser);
    
    // Also keep the standard storage listener for other tabs
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("local-storage-update", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);


  useEffect(() => {
  const loadUser = () => {
    const sessionData = localStorage.getItem("user_session");
    if (sessionData) setUser(JSON.parse(sessionData));
  };

  loadUser();

  // ចាប់ព្រឹត្តិការណ៍នៅពេល localStorage មានការប្រែប្រួល
  window.addEventListener("storage", loadUser);
  return () => window.removeEventListener("storage", loadUser);
}, []);

// Show modal instead of direct logout
  const handleLogoutClick = () => {
    setShowSignOutModal(true);
  };

  // 2. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("user_session"); // Clear the session
    // Optional: localStorage.removeItem("registered_user"); // Only if you want to wipe the "account" too
    router.push("/login");
  };

  if (!user) return null;

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <figure className="flex items-center gap-3">
          <Image
            src={user.photo || "/images/user/user-03.png"}
            className="size-11 rounded-full border-2 border-primary object-cover"
            alt={`Avatar of ${user.fullName}`}
            width={44} // Use actual sizes for optimization
            height={44}
          />

          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{user.fullName}</span>
            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <Image
            src={user.photo || "/images/user/user-03.png"}
            className="size-12 rounded-full object-cover"
            alt={`Avatar for ${user.fullName}`}
            width={48}
            height={48}
          />

          <figcaption className="space-y-1 text-base font-medium">
            <div className="text-dark dark:text-white">
              {user.fullName}
            </div>
            <div className="text-gray-6 text-sm">{user.email}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-[#4B5563] dark:text-dark-6">
          <Link
            href="/setting?tab=account"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 dark:hover:bg-dark-3"
          >
            <UserIcon />
            <span className="font-medium">View profile</span>
          </Link>

          <Link
            href="/setting?tab=company"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 dark:hover:bg-dark-3"
          >
            <SettingsIcon />
            <span className="font-medium">Account Settings</span>
          </Link>

          {/* 3. Added Logout Button */}
          <button
            onClick={handleLogoutClick} 
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOutIcon />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </DropdownContent>
      {/* Confirm Sign Out Modal */}
      <ConfirmModal
        open={showSignOutModal}
        title="Confirm Sign Out"
        description="Are you sure you want to sign out?"
        onConfirm={handleLogout}
        onCancel={() => setShowSignOutModal(false)}
      />
    </Dropdown>
  );
}