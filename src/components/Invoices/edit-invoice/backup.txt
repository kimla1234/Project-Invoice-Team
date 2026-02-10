// components/Invoices/edit/component/EditInvoiceForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useUpdateInvoiceMutation, useGetInvoiceByIdQuery } from "@/redux/service/invoices";
import { useGetMyProductsQuery } from "@/redux/service/products";
import { useToast } from "@/hooks/use-toast";
import { InvoiceItemRequest } from "@/types/invoice";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";

interface EditInvoiceFormProps {
  invoiceId: number;
}

export default function EditInvoiceForm({ invoiceId }: EditInvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: invoice, isLoading: loadingInvoice } = useGetInvoiceByIdQuery(invoiceId);
  const { data: products = [], isLoading: loadingProducts } = useGetMyProductsQuery();
  const [updateInvoice, { isLoading: updating }] = useUpdateInvoiceMutation();

  const [clientId, setClientId] = useState<number>(0);
  const [status, setStatus] = useState<string>("pending");
  const [taxPercentage, setTaxPercentage] = useState<number>(10);
  const [items, setItems] = useState<InvoiceItemRequest[]>([]);

  // Load invoice data when fetched
  useEffect(() => {
    if (invoice) {
      console.log('Full response:', invoice);
      console.log('Items:', invoice.items);
      console.log('First item:', invoice.items[0]);
      console.log('Has deletedAt?', 'deletedAt' in invoice.items[0]);
      
      setClientId(invoice.clientId);
      setStatus(invoice.status || "pending");
      
      const mappedItems: InvoiceItemRequest[] = invoice.items.map(item => ({
        productId: item.productId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal, // Fixed: was looking for subTotal but response has subtotal
      }));
      setItems(mappedItems);

      if (invoice.subtotal > 0) {
        const calculatedTaxPercentage = (invoice.tax / invoice.subtotal) * 100;
        setTaxPercentage(Number(calculatedTaxPercentage.toFixed(2)));
      }
    }
  }, [invoice]);

  const handleAddItem = (productId: number) => {
    if (!productId) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newItem: InvoiceItemRequest = {
      productId: product.id,
      unitPrice: product.price,
      quantity: 1,
      subtotal: product.price * 1,
    };

    setItems([...items, newItem]);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updated = [...items];
    updated[index].quantity = quantity;
    updated[index].subtotal = updated[index].unitPrice * quantity;
    setItems(updated);
  };

  const handleUpdateUnitPrice = (index: number, unitPrice: number) => {
    if (unitPrice < 0) return;
    
    const updated = [...items];
    updated[index].unitPrice = unitPrice;
    updated[index].subtotal = unitPrice * updated[index].quantity;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = (subtotal * taxPercentage) / 100;
  const grandTotal = subtotal + taxAmount; // Fixed: This line was incomplete

  const handleSubmit = async (e: React.FormEvent) => { // Fixed: This line had a syntax error
    e.preventDefault();

    if (!clientId) {
      toast({
        title: "Validation Error",
        description: "Please select a client.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateInvoice({
        id: invoiceId,
        body: {
          clientId,
          subtotal,
          tax: taxAmount,
          grandTotal,
          items,
          status,
        },
      }).unwrap();

      toast({
        title: "Invoice Updated",
        description: "Invoice has been updated successfully.",
        className: "bg-green-600 text-white",
      });

      router.push('/invoices');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update invoice.",
        variant: "destructive",
      });
    }
  };

  if (loadingInvoice || loadingProducts) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Invoice not found</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client ID <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={clientId || ""}
          onChange={(e) => setClientId(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter client ID"
          required
        />
      </div>

      {/* Status Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700">Invoice Items</h3>
        </div>

        <div className="flex gap-2">
          <select
            onChange={(e) => {
              handleAddItem(Number(e.target.value));
              e.target.value = "";
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a product to add</option>
            {products.map((p) => (
              <option key={p.uuid} value={p.id}>
                {p.name} - ${p.price.toFixed(2)} ({p.stockQuantity} in stock)
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              const select = document.querySelector('select[onChange]') as HTMLSelectElement;
              if (select?.value) {
                handleAddItem(Number(select.value));
                select.value = "";
              }
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            No items added yet. Select a product above to add items.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product?.name || `Product #${item.productId}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock: {product?.stockQuantity || 0}
                    </p>
                  </div>

                  <div className="w-32">
                    <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateUnitPrice(index, Number(e.target.value))}
                      className="border border-gray-300 rounded px-3 py-1.5 w-full text-sm"
                      min="0"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(index, Number(e.target.value))}
                      className="border border-gray-300 rounded px-3 py-1.5 w-full text-sm"
                      min="1"
                    />
                  </div>

                  <div className="w-28 text-right">
                    <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                    <p className="font-semibold text-gray-900">
                      ${item.subtotal}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tax Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tax Percentage (%)
        </label>
        <input
          type="number"
          step="0.01"
          value={taxPercentage}
          onChange={(e) => setTaxPercentage(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="10"
          min="0"
          max="100"
        />
        <p className="text-sm text-gray-500 mt-1">
          Tax Amount: ${taxAmount.toFixed(2)}
        </p>
      </div>

      {/* Totals Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Tax ({taxPercentage}%):</span>
          <span className="font-medium">${taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
          <span>Grand Total:</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.push('/invoices')}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updating || items.length === 0}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {updating ? "Updating..." : "Update Invoice"}
        </button>
      </div>
    </form>
  );
}