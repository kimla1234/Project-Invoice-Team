import { useToast } from "@/hooks/use-toast";
import { useCreateProductTypeMutation } from "@/redux/service/products";
import { useState } from "react";

export function CreateProductTypeForm({ onSuccess }: { onSuccess: () => void }) {
  const [typeName, setTypeName] = useState("");
  const [createType, { isLoading }] = useCreateProductTypeMutation(); // Make sure this is in your service
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!typeName.trim()) return;
    try {
      await createType({ name: typeName }).unwrap();
      toast({ title: "Success", description: "Product type created." , variant: "success", });
      setTypeName("");
      onSuccess();
    } catch (err) {
      toast({ title: "Error", description: "Failed to create type.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <div>
        <label className="text-sm font-medium">Type Name</label>
        <input
          className="w-full border rounded-lg p-2 mt-1"
          placeholder="e.g. BEVERAGES"
          value={typeName}
          onChange={(e) => setTypeName(e.target.value)}
        />
      </div>
      <button
        onClick={handleCreate}
        disabled={isLoading}
        className="w-full bg-primary text-white py-2 rounded-lg font-bold"
      >
        {isLoading ? "Saving..." : "Save Product Type"}
      </button>
    </div>
  );
}