// components/CreateClients.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSkipBack } from "react-icons/fi";
import { Dropdown, DropdownContent, DropdownTrigger } from "../../ui/dropdown";
import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCreateClientMutation } from "../../../redux/service/client";

export default function CreateClients() {
  const router = useRouter();
  const { toast } = useToast();

  const [createClient, { isLoading }] = useCreateClientMutation();

  // Dropdown state
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientGender, setClientGender] = useState<"MALE" | "FEMALE">("MALE");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");

  // Error state
  const [errors, setErrors] = useState({
    clientName: "",
    clientGender: "",
    contact: "",
    address: "",
  });

  const options: ("MALE" | "FEMALE")[] = ["MALE", "FEMALE"];

  const validateForm = () => {
    const newErrors = {
      clientName: "",
      clientGender: "",
      contact: "",
      address: "",
    };

    let isValid = true;

    if (!clientName.trim()) {
      newErrors.clientName = "Client Name is required.";
      isValid = false;
    }

    if (!clientGender.trim()) {
      newErrors.clientGender = "Client Gender is required.";
      isValid = false;
    }

    if (!contact.trim()) {
      newErrors.contact = "Contact is required.";
      isValid = false;
    }

    if (!address.trim()) {
      newErrors.address = "Address is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await createClient({
        name: clientName,
        gender: clientGender,
        phoneNumber: contact,
        address: address,
      }).unwrap();

      toast({
        title: "Client Created",
        description: `${res.data.name} has been added successfully.`,
        className: "bg-green-600 text-white",
        duration: 3000,
      });

      router.push("/clients");
    } catch (error) {
      toast({
        title: "Creation Failed",
        description:
          "There was an error creating the client. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full justify-center  lg:p-10 bg-gray-50/30 dark:bg-transparent">
  {/* Container: Fluid on mobile, max-width on desktop */}
  <div className="w-full max-w-4xl space-y-6">
    
    {/* Header: Stacks on very small screens, row on larger ones */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-block rounded-lg border border-gray-100 bg-white p-2 px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Create New Client
        </h3>
      </div>

      <Link
        href="/clients"
        className="inline-flex items-center justify-center rounded-lg border bg-white px-4 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-gray-50 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800 dark:text-purple-400"
      >
        <FiSkipBack className="mr-2 h-4 w-4" />
        Back to Clients
      </Link>
    </div>

    {/* Form Card */}
    <div className="w-full rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-10">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Input Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          
          {/* Client Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Full name"
              className={cn(
                "w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 dark:border-gray-600 dark:bg-gray-700",
                errors.clientName && "border-red-500 ring-red-500/10"
              )}
            />
            {errors.clientName && (
              <p className="text-xs font-medium text-red-500">{errors.clientName}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Client Gender
            </label>
            <div className="relative">
              <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
                <DropdownTrigger className="w-full">
                  <button
                    type="button" // Important to prevent form submission
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(!isOpen);
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-left transition-all hover:bg-white dark:border-gray-600 dark:bg-gray-700"
                  >
                    <span className={!clientGender ? "text-gray-400" : ""}>
                      {clientGender || "Select gender"}
                    </span>
                    <ChevronUpIcon
                      className={cn(
                        "h-5 w-5 text-gray-400 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                </DropdownTrigger>

                <DropdownContent className="z-50 mt-2 w-full overflow-hidden rounded-lg border bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800">
                  {options.map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setClientGender(opt);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20",
                        clientGender === opt && "bg-purple-50 font-bold text-purple-600 dark:bg-purple-900/30"
                      )}
                    >
                      {opt}
                    </div>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>
            {errors.clientGender && (
              <p className="text-xs font-medium text-red-500">{errors.clientGender}</p>
            )}
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Contact Number
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+855..."
              className={cn(
                "w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 transition-all dark:border-gray-600 dark:bg-gray-700",
                errors.contact && "border-red-500"
              )}
            />
            {errors.contact && (
              <p className="text-xs font-medium text-red-500">{errors.contact}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, Country"
              className={cn(
                "w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 transition-all dark:border-gray-600 dark:bg-gray-700",
                errors.address && "border-red-500"
              )}
            />
            {errors.address && (
              <p className="text-xs font-medium text-red-500">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse gap-3 pt-4 border-t border-gray-50 dark:border-gray-700 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full sm:w-auto flex items-center justify-center rounded-lg bg-purple-600 px-8 py-3 font-bold text-white transition-all hover:bg-purple-700 active:scale-95 shadow-md shadow-purple-200 dark:shadow-none",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? "Saving..." : "Create Client"}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
  );
}
