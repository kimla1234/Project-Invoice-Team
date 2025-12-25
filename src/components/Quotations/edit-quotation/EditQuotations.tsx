"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClientById, updateClient } from "@/components/Tables/clients";
import type { ClientData } from "@/types/client";
import { useToast } from "@/hooks/use-toast";

export default function EditQuotations() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientData | null>(null);
  const [form, setForm] = useState<Partial<ClientData>>({});

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      const found = await getClientById(id);
      if (mounted) {
        setClient(found ?? null);
        setForm(found ?? {});
        setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleChange = (key: keyof ClientData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const updated = await updateClient(id, form);
      if (updated) {
        toast({
          title: "Client updated",
          description: `Client #${updated.id} saved successfully`,
        });
        router.push("/clients");
      } else {
        toast({
          title: "Update failed",
          description: "Could not update this client",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-slate-600">Loading client...</div>
    );
  }

  if (!client) {
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
            value={form.gender ?? "Male"}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-slate-600">Contact</span>
          <input
            className="rounded-md border px-3 py-2"
            value={form.contact ?? ""}
            onChange={(e) => handleChange("contact", e.target.value)}
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
