"use client";

import { mockUser } from "@/data/mockUser";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";
import { set, get } from "idb-keyval";
interface User {
  fullName: string;
  phoneNumber: string;
  email: string;
  bio: string;
  language: string;
  photo: string | null;
}

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();

useEffect(() => {
  const loadUserData = async () => {
    const savedUser = await get("registered_user");

    if (savedUser) {
      setUser(savedUser);
    } else {
      setUser(mockUser);
    }
  };

  loadUserData();
}, []);

  // Photo upload preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // 1. Simple Guard: Reject if file is > 1MB (Base64 will make it ~1.3MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 1MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setUser((prev) => (prev ? { ...prev, photo: base64 } : prev));
    };
    reader.readAsDataURL(file);
  };

  // Generic change handler
  const handleChange = (field: keyof User, value: string) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Inside your Account component's handleSave function:
  const handleSave = async () => {
    if (!user) return;

    try {
      // SAVE EVERYTHING TO INDEXEDDB (No 5MB limit issue)
      await set("registered_user", user);

      // SAVE ONLY ESSENTIAL DATA TO LOCALSTORAGE
      // We remove the photo from the session object to keep it tiny
      const { photo, ...sessionData } = user;
      localStorage.setItem(
        "user_session",
        JSON.stringify({ ...sessionData, isLoggedIn: true }),
      );

      // Trigger update for other components
      window.dispatchEvent(new Event("local-storage-update"));

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved to IndexedDB.",
        className: "bg-green-600 text-white",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save profile data.",
        variant: "destructive",
      });
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="mx-auto w-full rounded-md bg-white">
      <h2 className="mb-2 text-xl font-semibold">Profile Information</h2>
      <p className="mb-10 text-gray-500">
        Update your personal information and preferences
      </p>

      {/* Avatar */}
      <div className="mb-6 flex items-center space-x-5">
        <Image
          width={96}
          height={96}
          src={photoPreview || user.photo || "/images/user/user-03.png"}
          alt="Profile"
          className="h-24 w-24 rounded-full object-cover"
        />

        <div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-gray-700 hover:bg-gray-200">
            <HiOutlinePhoto className="text-xl" />
            Upload Photo
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
          <p className="mt-1 text-sm text-gray-400">JPG, PNG up to 2MB</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex w-full space-x-10">
        <div className="w-full">
          <Input
            label="Full Name"
            value={user.fullName}
            onChange={(v) => handleChange("fullName", v)}
          />

          <Input
            label="Email"
            value={user.email}
            onChange={(v) => handleChange("email", v)}
          />

          <Input
            label="Phone Number"
            value={user.phoneNumber}
            onChange={(v) => handleChange("phoneNumber", v)}
          />
        </div>

        <div className="w-full">
          <label className="mb-1 block text-gray-700">Bio</label>
          <textarea
            value={user.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="min-h-[125px] w-full rounded bg-slate-100 px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ---------- Reusable Input ---------- */
function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded bg-slate-100 px-3 py-2"
      />
    </div>
  );
}
