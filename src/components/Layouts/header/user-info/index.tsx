"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
  DropdownMenuItem,
} from "../../../ui/dropdown";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "../../../ui/ConfirmModal";
import NavSheetItem from "../Sheet/NavSheetItem";
import { ProfileContent } from "../Sheet/ProfileContent";
import SettingContent from "../Sheet/SettingContent";
import { toast } from "@/hooks/use-toast";
import { useGetMyProfileQuery } from "@/redux/service/setting";

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const router = useRouter();

  // ✅ SINGLE SOURCE OF TRUTH
  const { data: user, isLoading } = useGetMyProfileQuery();

  const handleLogout = async () => {
    try {
      await fetch(`/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      toast({
        title: "Logout Successful",
        description: "You have been logged out.",
      });

      router.push("/login");
    } catch {
      toast({
        title: "Logout failed",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !user) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />;
  }

  const avatarSrc =
    user.imageProfile
      ? `${process.env.NEXT_PUBLIC_NORMPLOV_API_URL}${user.imageProfile}`
      : "/logo.png";

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="outline-none">
        <figure className="flex cursor-pointer items-center gap-3 bg">
          <img
            src={avatarSrc}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border-2 border-green-600 object-cover"
            alt="Avatar"
          />
          <figcaption className="flex items-center gap-1 font-medium max-[1024px]:sr-only">
            <span className="px-2 text-gray-700">{user.name}</span>
            <ChevronUpIcon
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
            />
          </figcaption>
          

          
        </figure>
      </DropdownTrigger>

      <DropdownContent align="end" className="bg-white w-50 border border-gray-200 rounded-md shadow-lg">
        <div className="px-5 py-3">
          <div className="text-lg font-medium">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>

        <hr />
        <button
          onClick={() => setShowSignOutModal(true)}
          className="w-full px-4 py-2 text-red-500 hover:bg-red-50"
        >
           Log out
        </button>
      </DropdownContent>

      <ConfirmModal
        open={showSignOutModal}
        title="Confirm Sign Out"
        description="Are you sure?"
        onConfirm={handleLogout}
        onCancel={() => setShowSignOutModal(false)}
      />
    </Dropdown>
  );
}
