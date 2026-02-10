"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {useGetClientByIdQuery, useUpdateClientMutation,} from "@/redux/service/client";
import type { ClientUpdateRequest} from "@/types/client";

import { useToast } from "@/hooks/use-toast";

export default function EditClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const {
    data: client,
    isLoading,
    isError,
  } = useGetClientByIdQuery(Number(id), {
    skip: !id,
  });
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();
  const [form, setForm] = useState<ClientUpdateRequest>({
    name: "",
    gender: "MALE",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    if (!client) return;

    setForm({
      name: client.name,
      gender: client.gender,
      phoneNumber: client.phoneNumber,
      address: client.address,
    });
  }, [client]);

  const handleChange = (key: keyof ClientUpdateRequest, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!id) return;

  try {
    await updateClient({
      id: Number(id),
      body: {
        ...form,
        gender: form.gender, // already MALE/FEMALE
      },
    }).unwrap();

    toast({
      title: "Client updated",
      description: "Client updated successfully.",
      className: "bg-green-600 text-white",
    });

    router.push("/clients");
  } catch (error) {
    toast({
      title: "Update failed",
      description: "Could not update this client.",
      variant: "destructive",
    });
  }
};


  if (isLoading) {
    return (
      <div className="p-6 text-slate-600">Loading client...</div>
    );
  }

  if (isError || !client) {
    return (
      <div className="p-6 text-red-600">Client not found.</div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-xl rounded-lg border bg-white p-6 shadow-md dark:border-dark-3 dark:bg-dark-2">
        <div className="mb-4 text-xl font-semibold text-slate-700">Edit Client #{client.id}</div>
        <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-slate-600">Name</span>
          <input
            className="rounded-md border px-3 py-2"
            value={form.name ?? ""}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-slate-600">Gender</span>
          <select
            className="rounded-md border px-3 py-2"
            value={form.gender}
            onChange={(e) => handleChange("gender", e.target.value === "Male" ? "MALE" : "FEMALE")}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-slate-600">Contact</span>
          <input
            className="rounded-md border px-3 py-2"
            value={form.phoneNumber ?? ""}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-slate-600">Address</span>
          <input
            className="rounded-md border px-3 py-2"
            value={form.address ?? ""}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </label>

        <div className="mt-2 flex gap-3">
          <button type="button" onClick={() => router.push("/clients")} className="rounded-lg border px-4 py-2">
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-white">
            Save Changes
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
