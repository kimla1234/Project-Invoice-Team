"use client";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRightIcon, ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import { HiOutlinePhoto } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const COMPANY_TYPES = [
  { value: "products", label: "Products" },
  { value: "service", label: "Service" },
  { value: "recurring", label: "Recurring" },
  { value: "education", label: "Education" },
];

export default function Company() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("My Company");
  const [companyEmail, setCompanyEmail] = useState("company@example.com");
  const [companyPhone, setCompanyPhone] = useState("0123456789");
  const [companyType, setCompanyType] = useState<
    "products" | "service" | "recurring" | "education"
  >("products");

  // Address state
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [commune, setCommune] = useState("");
  const [village, setVillage] = useState("");
  const [streetEn, setStreetEn] = useState("");
  const [streetLocal, setStreetLocal] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [houseNoLocal, setHouseNoLocal] = useState("");

  const [logo, setLogo] = useState<string | null>(null);

  // Expand/collapse Address
  const [showAddress, setShowAddress] = useState(false);


useEffect(() => {
    // 1. Get the data from localStorage
    const savedData = localStorage.getItem("registered_user");

    if (savedData) {
      try {
        const user = JSON.parse(savedData);

        // 2. Map the data to your state variables
        // Basic Info
        setCompanyName(user.companyName || "");
        setCompanyEmail(user.companyEmail || "");
        setCompanyPhone(user.companyPhone || "");
        setCompanyType(user.companyType || "products");
        setLogo(user.companyLogo || null);

        // Address Info
        setProvince(user.province || "");
        setDistrict(user.district || "");
        setCommune(user.commune || "");
        setVillage(user.village || "");
        // Note: Your local storage key is 'street', but your state is 'streetEn'
        setStreetEn(user.street || ""); 
        setHouseNo(user.houseNo || "");
        
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    }
  }, []);




  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Check file size (optional but recommended for localStorage limits)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogo(base64String); // This sets the Base64 string to state
    };
    reader.readAsDataURL(file);
  }
};



const handleSave = () => {
  const existingData = JSON.parse(localStorage.getItem("registered_user") || "{}");
  
  const updatedData = {
    ...existingData,
    companyName,
    companyEmail,
    companyPhone,
    companyLogo: logo, // ប្រាកដថា logo ជា base64
    // ... data ផ្សេងៗទៀត
  };

  localStorage.setItem("registered_user", JSON.stringify(updatedData));

  // --- បន្ថែមត្រង់នេះ ---
  // បង្កើត Event ដើម្បីប្រាប់ Sidebar ឲ្យ update តាម
  window.dispatchEvent(new Event("company-updated"));
  // --------------------

  toast({
    title: "Company Updated",
    description: "Changes saved successfully.",
    className: "bg-green-600 text-white",
  });
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
          {logo ? (
            <Image src={logo} alt="Company Logo" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <HiOutlinePhoto className="text-3xl" />
            </div>
          )}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded border-gray-300 bg-slate-100 px-3 py-2 text-left"
                )}
              >
                <span className="capitalize">{companyType || "Select type"}</span>
                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
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

      {/* Address Section */}
      <div className="mb-4 flex cursor-pointer items-center hover:bg-slate-100 justify-between border p-2 rounded-lg border-dashed py-2 text-xl font-semibold" onClick={() => setShowAddress(!showAddress)}>
        Address
        {showAddress ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
      </div>

      {showAddress && (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-gray-700">Province</label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">Commune</label>
            <input
              type="text"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">Village</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">Street (English)</label>
            <input
              type="text"
              value={streetEn}
              onChange={(e) => setStreetEn(e.target.value)}
              className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">Street (Local)</label>
            <input
              type="text"
              value={streetLocal}
              onChange={(e) => setStreetLocal(e.target.value)}
              className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">House No.</label>
            <input
              type="text"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-gray-700">House No. (Local)</label>
            <input
              type="text"
              value={houseNoLocal}
              onChange={(e) => setHouseNoLocal(e.target.value)}
              className="w-full rounded border-gray-300 bg-slate-100 px-3 py-2"
            />
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
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
