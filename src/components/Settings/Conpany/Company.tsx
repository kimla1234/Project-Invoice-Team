"use client";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { HiOutlinePhoto } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,useUploadCompanyLogoMutation,
} from "@/redux/service/setting";


const COMPANY_TYPES = [
  { value: "products", label: "Products" },
  { value: "service", label: "Service" },
  { value: "recurring", label: "Recurring" },
  { value: "education", label: "Education" },
];

export default function Company() {
  const { toast } = useToast();
  const { data, isLoading, error, refetch } = useGetMySettingsQuery();
  const [updateMySettings, { isLoading: isSaving }] = useUpdateMySettingsMutation();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [uploadCompanyLogo] = useUploadCompanyLogoMutation();
  const [companyType, setCompanyType] = useState<
    "products" | "service" | "recurring" | "education"
  >("products");
  const [typeOpen, setTypeOpen] = useState(false);

  // Company Address (single field)
  const [companyAddress, setCompanyAddress] = useState("");

  const [logo, setLogo] = useState<string | null>(null);

  // Removed expand/collapse for address; single input now


  useEffect(() => {
    if (data) {
      setCompanyName(data.companyName ?? "");
      setCompanyEmail(data.companyEmail ?? "");
      setCompanyPhone(data.companyPhoneNumber ?? "");
      setLogo(data.companyLogoUrl ?? null);
      setCompanyAddress(data.companyAddress ?? "");
    }
  }, [data]);




  const handleLogoUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files?.[0]) return;

  const file = e.target.files[0];

  try {
    const formData = new FormData();
    formData.append("file", file);

    const updated = await uploadCompanyLogo(formData).unwrap();

    setLogo(updated.companyLogoUrl);

    toast({
      title: "Logo updated",
      description: "Company logo uploaded successfully.",
      className: "bg-green-600 text-white",
    });
  } catch {
    toast({
      title: "Upload failed",
      description: "Could not upload company logo.",
      variant: "destructive",
    });
  }
};



  const handleSave = async () => {
    try {
      const payload = {
        companyName,
        companyEmail,
        companyPhoneNumber: companyPhone,
        companyAddress,
        companyLogoUrl: logo ?? undefined,
      };

      const res = await updateMySettings(payload).unwrap();

      toast({
        title: "Company Updated",
        description: "Changes saved successfully.",
        className: "bg-green-600 text-white",
      });

      await refetch();
    } catch (err: any) {
      const desc = err?.data?.message || "Failed to update company settings.";
      toast({
        title: "Update Failed",
        description: desc,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto w-full rounded-md bg-white ">
      <h2 className="mb-2 text-xl font-semibold">Company Information</h2>
      <p className="mb-6 text-gray-500">
        Update your company details and preferences
      </p>

      {/* Logo Upload */}
      <div className="mb-6 flex items-center space-x-5">
        <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100">
            <img src={`${process.env.NEXT_PUBLIC_NORMPLOV_API_URL}${logo}`} alt="Company Logo" className="object-cover" />
        </div>
        <div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-gray-700 hover:bg-gray-300">
            <HiOutlinePhoto className="text-xl" />
            Upload Logo
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
          <p className="mt-1 text-center text-sm text-gray-400">
            JPG, PNG up to 2MB
          </p>
        </div>
      </div>

      {/* Company Details */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-gray-700">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-gray-700">Company Email</label>
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-gray-700">Company Phone</label>
          <input
            type="text"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
          />
        </div>
        <div className="w-full">
          <label className="mb-1 block text-gray-700">Company Type</label>
          <DropdownMenu open={typeOpen} onOpenChange={setTypeOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded border-gray-300 bg-slate-100 px-3 py-2 text-left"
                )}
              >
                <span className="capitalize">{companyType || "Select type"}</span>
                <ChevronRightIcon className={cn("h-4 w-4 text-gray-500 transition-transform duration-200", typeOpen && "rotate-90")} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="h-auto w-[600px] p-2">
              {COMPANY_TYPES.map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  className="capitalize hover:bg-slate-100"
                  onSelect={() => setCompanyType(item.value as any)}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Company Address (single input) */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-gray-700">Company Address</label>
          <input
            type="text"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
