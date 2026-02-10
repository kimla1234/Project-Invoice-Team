"use client";
import { get } from "idb-keyval";
import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
  DropdownMenuItem,
} from "../../../ui/dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "../../../ui/ConfirmModal";
import NavSheetItem from "../Sheet/NavSheetItem";
import { ProfileContent } from "../Sheet/ProfileContent";


import { toast } from "@/hooks/use-toast";
import Link from "next/link";
// ✅ Unified User type
export interface User {
  name: string;
  email: string;
  image_profile?: string | null;
}

interface UserInfoProps {
  user?: {
    name: string;
    email: string;
    image_profile?: string | null;
  };
}

export function UserInfo({ user: propUser }: UserInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  //const [user, setUser] = useState<User | null>(propUser || null);
  const router = useRouter();

  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Load from IndexedDB if no propUser

  const handleLogout = async () => {
    try {
      const res = await fetch(`/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: data.message || "Logout Successful!",
          description: "You have been safely logged out.",
          variant: "success", // Ensure your toaster supports this variant
          duration: 3000,
        });

        // Redirect and reload
        router.push(`/login`);
        //window.location.reload();
      } else {
        // If 400 (Token not found), the user is effectively logged out anyway
        toast({
          title: "Session Expired",
          description: data.message || "Your session was already cleared.",
          variant: "destructive", // Shadcn default for errors
          duration: 3000,
        });

        // Optional: Redirect anyway since the token is missing/invalid
        router.push(`/`);
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to reach the server. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Logout Error:", error);
    }
  };

  // ប្រើ propUser ផ្ទាល់ ដើម្បីឱ្យវា Update តាម NavbarComponent
  const user = propUser;

  const avatarSrc =
    user?.image_profile && user.image_profile.trim() !== ""
      ? user.image_profile
      : "/logo.png";

  if (!user) {
    // Optional: fallback skeleton while user loads
    return <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />;
  }

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <figure className="flex cursor-pointer items-center gap-3">
          <Image
            unoptimized
            // Use user?.profileImage which now matches the mappedUser key
            src={user?.image_profile || "/images/logo/logo-dark.svg"}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border-2 border-purple-600 object-cover"
            alt={user?.name || "Avatar"}
          />

          <figcaption className="flex items-center gap-1 font-medium max-[1024px]:sr-only">
            <span className="px-2 text-gray-700">{user.name}</span>

            <ChevronUpIcon
              className={cn(
                "mr-2 rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="-mr-1 border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.6rem]"
        align="end"
      >
        <figure className="flex items-start justify-between gap-2.5 px-5 py-3.5">
          <figcaption className="text-base font-medium">
            <div className="text-lg text-dark dark:text-white">{user.name}</div>
            <div className="text-sm text-gray-6">{user.email}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="space-y-1 p-2">
          {/* View Profile */}
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="p-0 focus:bg-transparent"
          >
            <NavSheetItem
              icon={<UserIcon />}
              label="View profile"
              title="Profile Information"
            >
              <ProfileContent />
            </NavSheetItem>
          </DropdownMenuItem>

          {/* Settings */}
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="p-0 focus:bg-transparent"
          >
             <Link
            href="/setting?tab=company"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 dark:hover:bg-dark-3"
          >
            <SettingsIcon />
            <span className="font-medium">Account Settings</span>
          </Link>
          </DropdownMenuItem>

          {/* Logout */}
          <button
            onClick={() => {
              setIsOpen(false);
              setShowSignOutModal(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOutIcon />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </DropdownContent>

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
