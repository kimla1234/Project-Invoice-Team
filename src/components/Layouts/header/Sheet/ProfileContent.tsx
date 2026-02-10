"use client";

import { useState, useEffect } from "react";
import { Camera, Edit2, X, Check, Loader2 } from "lucide-react";
import {
  useGetUserQuery,
  useUpdateProfileUserMutation,

} from "@/redux/service/user";
import { toast } from "@/hooks/use-toast";
import { set } from "idb-keyval";
import Image from "next/image";
import { usePostImageMutation } from "@/redux/service/products";

interface ProfileContentProps {
  user?: {
    name: string;
    email: string;
    image_profile?: string | null;
    phone_number?: string | null;
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
    phone_number: "",
    image_profile: "",
  });

  // 3️⃣ Avatar upload file
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (apiUser) {
      setFormData({
        name: apiUser.name ?? "",
        phone_number: apiUser.phone_number ?? "", // ✅ លែង Error ហើយ
        image_profile: apiUser.image_profile ?? "", // ✅ បន្ថែមឱ្យគ្រប់ Field តាម State
      });
    }
  }, [apiUser]);

  // 5️⃣ Handle profile save
  const handleSave = async () => {
    if (!apiUser?.uuid) return;

    try {
      const updatedData = { name: formData.name, phone: formData.phone_number };
      await updateProfileUser({
        user: {
          name: formData.name,
          phone_number: formData.phone_number, 
        },
      }).unwrap();


      const newStoredUser = {
        ...apiUser,
        ...updatedData,
        photo: apiUser.image_profile,
      };
      await set("registered_user", newStoredUser);

      toast({
        title: "ជោគជ័យ!",
        description: "ព័ត៌មានត្រូវបានកែសម្រួលរួចរាល់",
        variant: "success",
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
        phone_number: apiUser.phone_number ?? "", // កែឱ្យត្រូវឈ្មោះ Key ក្នុង State
        image_profile: apiUser.image_profile ?? "",
      });
    }
    setIsEditing(!isEditing);
  };

  // 7️⃣ Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return;

  const selectedFile = e.target.files[0];
  
  // ១. បង្កើត FormData ឱ្យត្រូវតាមការចង់បានរបស់ Mutation ថ្មី
  const formData = new FormData();
  formData.append("file", selectedFile); // "file" ត្រូវតែដូចឈ្មោះក្នុង Java Controller (@RequestParam)

  try {

    const uploadRes = await postImage(formData).unwrap();

    console.log("Upload Success:", uploadRes);

    
    const imageUri = uploadRes?.payload?.file_url || uploadRes?.uri;

    if (imageUri) {

      await updateProfileUser({
        user: { image_profile: imageUri },
      }).unwrap();

      toast({
        title: "Success!",
        description: "Profile picture updated successfully.",
      });
    }
  } catch (err: any) {
    console.error("Upload Error Details:", err);
    toast({
      title: "Upload Failed",
      description: err?.data?.message || "Something went wrong during upload.",
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
    <div className="mx-auto max-w-4xl flex flex-col min-h-[calc(100vh-80px)] py-6">
      {/* Photo Section */}
     <div className="flex-grow space-y-8">
        <div className="flex flex-col items-center">
        <div className="group relative">
          <div className="size-28 overflow-hidden rounded-full border-2 border-gray-50 bg-gray-100 shadow-sm">
            <Image
              unoptimized
              src={apiUser?.image_profile || "/logo.png"}
              alt="Profile"
              width={1000}
              height={1000}
              className="h-full w-full object-cover"
            />
          </div>
          {isEditing && (
            <label className="absolute bottom-1 right-1 cursor-pointer rounded-full border border-gray-100 bg-white p-2 shadow-lg hover:bg-gray-50">
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
                ? "border bg-white ring-1 ring-blue-100"
                : "cursor-not-allowed bg-slate-100"
            }`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-sm font-semibold text-gray-700">
            Email
          </label>
          <input
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-slate-100 p-3 opacity-70"
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
                ? "border bg-white ring-1 ring-blue-100"
                : "cursor-not-allowed bg-slate-100"
            }`}
            value={formData.phone_number}
            onChange={(e) =>
              setFormData({ ...formData, phone_number: e.target.value })
            }
          />
        </div>
      </div>
      </div>

      {/* Actions */}
      <div className=" mt-auto ">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-white transition-all hover:bg-primary/50"
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-white shadow-sm hover:bg-primary/50 disabled:bg-blue-300"
            >
              {isUpdating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
