"use client";

import { useState, useEffect } from "react";
import { Camera, Edit2, X, Check, Loader2 } from "lucide-react";
import {
  useGetUserQuery,
  useUpdateProfileUserMutation,
  usePostImageMutation,
} from "@/redux/service/user";
import { toast } from "@/hooks/use-toast";
import { set } from "idb-keyval";

interface ProfileContentProps {
  user?: {
    name: string;
    email: string;
    profileImage?: string | null;
    phone?: string | null;
  };
}

export function ProfileContent({}: ProfileContentProps) {
  // 1️⃣ RTK Query Hooks
  const { data: apiUser, isLoading: isFetching } = useGetUserQuery();
  const [updateProfileUser, { isLoading: isUpdating }] =
    useUpdateProfileUserMutation();
  const [postImage] = usePostImageMutation();

  const [isEditing, setIsEditing] = useState(false);

  // 2️⃣ Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // 3️⃣ Avatar upload file
  const [file, setFile] = useState<File | null>(null);

  // 4️⃣ Sync API data to form
  useEffect(() => {
    if (apiUser) {
      setFormData({
        name: apiUser.name ?? "",
        phone: apiUser.phone ?? "",
      });
    }
  }, [apiUser]);

  // 5️⃣ Handle profile save
  const handleSave = async () => {
    if (!apiUser?.uuid) return;

    try {
      const updatedData = { name: formData.name, phone: formData.phone };
      await updateProfileUser({
        uuid: apiUser.uuid,
        user: {
          name: formData.name,
          phone: formData.phone,
        },
      }).unwrap();

      // ✅ បន្ថែមការ Update IndexedDB ភ្លាមៗ
      const newStoredUser = { 
        ...apiUser, 
        ...updatedData, 
        photo: apiUser.profileImage 
      };
      await set("registered_user", newStoredUser);

      toast({
        title: "ជោគជ័យ!",
        description: "ព័ត៌មានត្រូវបានកែសម្រួលរួចរាល់",
        variant: "default",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "មានបញ្ហា!",
        description: "មិនអាចរក្សាទុកការកែប្រែបានទេ",
        variant: "destructive",
      });
    }
  };

  // 6️⃣ Toggle edit mode
  const toggleEdit = () => {
    if (isEditing && apiUser) {
      setFormData({
        name: apiUser.name ?? "",
        phone: apiUser.phone ?? "",
      });
    }
    setIsEditing(!isEditing);
  };

  // 7️⃣ Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !apiUser?.uuid) return;

    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    try {
      // Upload image to media service
      const uploadRes = await postImage({
        uuid: apiUser.uuid,
        avatar_url: selectedFile,
      }).unwrap();

      // Assuming backend returns { uri: "..." }
      const imageUri = (uploadRes as any)?.uri;
      if (!imageUri) throw new Error("Upload failed");

      // Update user profile with new image URI
      await updateProfileUser({
        uuid: apiUser.uuid,
        user: { profileImage: imageUri },
      }).unwrap();

      toast({
        title: "ជោគជ័យ!",
        description: "រូបភាពប្រូហ្វាយថ្មីត្រូវបានរក្សា",
        variant: "default",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "មានបញ្ហា!",
        description: "មិនអាចបញ្ចូលរូបភាពបានទេ",
        variant: "destructive",
      });
    }
  };

  if (isFetching)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6">
      {/* Photo Section */}
      <div className="flex flex-col items-center">
        <div className="group relative">
          <div className="size-28 overflow-hidden rounded-full border-2 border-gray-50 bg-gray-100 shadow-sm">
            <img
              src={apiUser?.profileImage || "/logo.png"}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          {isEditing && (
            <label className="absolute bottom-1 right-1 rounded-full border border-gray-100 bg-white p-2 shadow-lg hover:bg-gray-50 cursor-pointer">
              <Camera className="size-4 text-gray-600" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          )}
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Profile Information
          </h2>
          <p className="text-sm text-gray-500">
            Update your personal information and preferences
          </p>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Form Fields */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-semibold text-gray-700">
            Full Name
          </label>
          <input
            disabled={!isEditing}
            className={`w-full rounded-xl p-3 outline-none transition-all ${
              isEditing
                ? "bg-white border ring-1 ring-blue-100"
                : "bg-slate-100 cursor-not-allowed"
            }`}
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-semibold text-gray-700">
            Email (Read Only)
          </label>
          <input
            disabled
            className="w-full rounded-xl p-3 bg-slate-100 cursor-not-allowed opacity-70"
            value={apiUser?.email ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-semibold text-gray-700">
            Phone Number
          </label>
          <input
            disabled={!isEditing}
            className={`w-full rounded-xl p-3 outline-none transition-all ${
              isEditing
                ? "bg-white border ring-1 ring-blue-100"
                : "bg-slate-100 cursor-not-allowed"
            }`}
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 font-medium text-white transition-all hover:bg-zinc-800"
          >
            <Edit2 className="size-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={toggleEdit}
              disabled={isUpdating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="size-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
