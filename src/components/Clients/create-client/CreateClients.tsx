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
    <div className="flex h-auto w-full justify-center p-10">
      <div className="w-[70%] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="rounded-lg border bg-white p-2 dark:bg-gray-800">
            <h3 className="text-md font-bold text-gray-900 dark:text-gray-300">
              Create New Client
            </h3>
          </div>

          <Link
            href="/clients"
            className="text-md flex items-center rounded-lg border bg-white p-2 font-medium text-primary hover:text-red-400 dark:hover:text-blue-400"
          >
            <FiSkipBack className="mr-2 h-5 w-5" />
            Back to Clients
          </Link>
        </div>

        {/* Form */}
        <div className="w-full rounded-md border bg-white p-7 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-medium">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Input name"
                  className={cn(
                    "w-full rounded-lg border p-2",
                    errors.clientName && "border-red-500",
                  )}
                />
                {errors.clientName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.clientName}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="mb-1.5 block font-medium">Client Gender</label>
                <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
                  <DropdownTrigger className="w-full">
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border p-2"
                    >
                      {clientGender}
                      <ChevronUpIcon
                        className={cn(
                          "h-[18px] w-[18px] rotate-180 transition-transform",
                          isOpen && "rotate-0",
                        )}
                        strokeWidth={1.5}
                      />
                    </div>
                  </DropdownTrigger>

                  <DropdownContent className="z-50 mt-1 w-full space-y-2 border bg-white p-3 shadow-sm">
                    {options.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setClientGender(opt);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "cursor-pointer rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-50",
                          clientGender === opt &&
                            "bg-gray-100 text-primary"
                        )}
                      >
                        {opt}
                      </div>
                    ))}
                  </DropdownContent>
                </Dropdown>
                {errors.clientGender && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.clientGender}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div>
                <label className="mb-1.5 block font-medium">Contact</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Input contact number"
                  className={cn(
                    "w-full rounded-lg border p-2",
                    errors.contact && "border-red-500"
                  )}
                />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-500">{errors.contact}</p>
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Address */}
              <div>
                <label className="mb-1.5 block font-medium">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Input address"
                  className={cn(
                    "w-full rounded-lg border p-2",
                    errors.address && "border-red-500"
                  )}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              {/* Spacer */}
              <div className="hidden md:block" />
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "rounded-lg bg-primary px-5 py-2 text-white",
                  isLoading && "opacity-70"
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
