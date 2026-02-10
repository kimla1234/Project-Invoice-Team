"use client";

import { Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { HiOutlinePhoto } from "react-icons/hi2";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadProfileImageMutation,
  useChangeMyPasswordMutation,
} from "@/redux/service/setting";

interface User {
  name: string;
  phoneNumber: string;
  email: string;
  imageProfile: string | null;
}

export default function Account() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const [changeMyPassword, { isLoading: isChangingPassword }] = useChangeMyPasswordMutation();

  const [user, setUser] = useState<User | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProfileImage, { isLoading: isUploading }] =useUploadProfileImageMutation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
useEffect(() => {
  if (!profile) return;

  setUser({
    name: profile.name,
    phoneNumber: profile.phoneNumber ?? "",
    email: profile.email,
    imageProfile: profile.imageProfile ?? null,
  });

  setPhotoPreview(profile.imageProfile ?? null);
}, [profile]);


  

  // Photo upload preview
 const handlePhotoUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files?.[0]) return;

  const file = e.target.files[0];

  // local preview
  setPhotoPreview(URL.createObjectURL(file));

  try {
    const formData = new FormData();
    formData.append("file", file);

    const updatedUser = await uploadProfileImage(formData).unwrap();

    // update UI with returned image URL
    setUser((prev) =>
      prev
        ? {
            ...prev,
            imageProfile: updatedUser.image_profile,
          }
        : prev
    );

    toast({
      title: "Profile image updated",
      description: "Your profile photo has been uploaded.",
      className: "bg-green-600 text-white",
    });
  } catch {
    toast({
      title: "Upload failed",
      description: "Could not upload profile image.",
      variant: "destructive",
    });
  }
};

  // Generic change handler
  const handleChange = (field: keyof User, value: string) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Inside your Account component's handleSave function:
 const handleSave = async () => {
  if (!user) return;

  try {
    await updateMyProfile({
      name: user.name,
      phoneNumber: user.phoneNumber,
    }).unwrap();

    toast({
      title: "Profile Updated",
      description: "Your profile has been saved.",
      className: "bg-green-600 text-white",
    });
  } catch {
    toast({
      title: "Save Failed",
      description: "Could not update profile.",
      variant: "destructive",
    });
  }
};

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }

    try {
      await changeMyPassword({
        oldPassword,
        newPassword,
        confirmPassword,
      }).unwrap();

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
        className: "bg-green-600 text-white",
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const desc = err?.data?.message || "Failed to change password.";
      toast({
        title: "Update Failed",
        description: desc,
        variant: "destructive",
      });
    }
  };

  if (isLoading || !user) return <p>Loading...</p>;

  return (
    <div className="mx-auto w-full rounded-md bg-white">
      <h2 className="mb-2 text-xl font-semibold">Profile Information</h2>
      <p className="mb-10 text-gray-500">
        Update your personal information and preferences
      </p>

      {/* Avatar */}
      <div className="mb-6 flex items-center space-x-5">
        <img
          width={96}
          height={96}
          src={`${process.env.NEXT_PUBLIC_NORMPLOV_API_URL}${user.imageProfile}`}
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
            label="Email"
            value={user.email}
            onChange={(v) => handleChange("email", v)}
            disabled
          />

          <Input
            label="Full Name"
            value={user.name}
            onChange={(v) => handleChange("name", v)}
          />

          <Input
            label="Phone Number"
            value={user.phoneNumber}
            onChange={(v) => handleChange("phoneNumber", v)}
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

      {/* Change Password */}
      <div className="mt-8">
        <h2 className="mb-2 text-xl font-semibold">Change Password</h2>
        <p className="mb-6 text-gray-500">Update your account password</p>

        <div className="flex w-full space-x-10">
          <div className="w-full">
            <div className="mb-4">
              <label className="mb-1 block text-gray-700">Old Password</label>
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded bg-slate-100 px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOld((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showOld ? "Hide password" : "Show password"}
                >
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-gray-700">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded bg-slate-100 px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded bg-slate-100 px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {isChangingPassword ? "Updating..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Input ---------- */
function Input({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-gray-700">{label}</label>

      <div className="relative">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded px-3 py-2
            ${disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed pr-10"
              : "bg-slate-100"}
          `}
        />

        {disabled && (
          <Lock
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
      </div>
    </div>
  );
}
