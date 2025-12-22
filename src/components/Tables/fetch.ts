import { ProductData } from "@/types/product";

// Mock product data
export const mockProducts: ProductData[] = [
  {
    id: 1,
    name: "Apple Watch Series 7",
    type: "Product",
    stock: 22,
    unitPrice: 296,
    currency: "USD",
  },
  {
    id: 2,
    name: "MacBook Pro M1 Repair Service",
    type: "Service",
    stock: 0,
    unitPrice: 120,
    currency: "USD",
  },
  {
    id: 3,
    name: "Dell Inspiron 15",
    type: "Product",
    stock: 64,
    unitPrice: 443,
    currency: "USD",
  },
  {
    id: 4,
    name: "HP ProBook 450",
    type: "Product",
    stock: 30,
    unitPrice: 499,
    currency: "USD",
  },
  {
    id: 5,
    name: "Keyboard Logitech K380",
    type: "Product",
    stock: 85,
    unitPrice: 39,
    currency: "USD",
  },
  {
    id: 6,
    name: "Mouse Logitech MX Master 3",
    type: "Product",
    stock: 40,
    unitPrice: 99,
    currency: "USD",
  },
  {
    id: 7,
    name: "Office Network Setup",
    type: "Service",
    stock: 0,
    unitPrice: 150,
    currency: "USD",
  },
  {
    id: 8,
    name: "Website Maintenance Monthly",
    type: "Service",
    stock: 0,
    unitPrice: 80,
    currency: "USD",
  },
  {
    id: 9,
    name: "Samsung 27” Monitor",
    type: "Product",
    stock: 18,
    unitPrice: 229,
    currency: "USD",
  },
  {
    id: 10,
    name: "External SSD 1TB",
    type: "Product",
    stock: 55,
    unitPrice: 149,
    currency: "KHR",
  },
  {
    id: 11,
    name: "Printer HP LaserJet",
    type: "Product",
    stock: 12,
    unitPrice: 320,
    currency: "USD",
  },
  {
    id: 12,
    name: "Cloud Backup Service",
    type: "Service",
    stock: 0,
    unitPrice: 60,
    currency: "USD",
  },
  {
    id: 13,
    name: "USB-C Hub 6-in-1",
    type: "Product",
    stock: 90,
    unitPrice: 45,
    currency: "USD",
  },
  {
    id: 14,
    name: "IT Consultation (Hourly)",
    type: "Service",
    stock: 0,
    unitPrice: 25,
    currency: "USD",
  },
  {
    id: 15,
    name: "Router TP-Link AX3000",
    type: "Product",
    stock: 26,
    unitPrice: 110,
    currency: "USD",
  },
  {
    id: 16,
    name: "Laptop Battery Replacement",
    type: "Service",
    stock: 0,
    unitPrice: 45,
    currency: "USD",
  },
  {
    id: 17,
    name: "Webcam Logitech C920",
    type: "Product",
    stock: 34,
    unitPrice: 79,
    currency: "USD",
  },
  {
    id: 18,
    name: "Annual Software License",
    type: "Service",
    stock: 0,
    unitPrice: 99,
    currency: "USD",
  },
  {
    id: 19,
    name: "UPS Power Backup 1200VA",
    type: "Product",
    stock: 14,
    unitPrice: 210,
    currency: "USD",
  },
  {
    id: 20,
    name: "On-site Hardware Installation",
    type: "Service",
    stock: 0,
    unitPrice: 70,
    currency: "USD",
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProductsTableData(): Promise<ProductData[]> {
  await delay(500);
  return mockProducts;
}

export async function getProductById(
  id: string,
): Promise<ProductData | undefined> {
  await delay(300);
  const numericId = parseInt(id, 10);
  return mockProducts.find((p) => p.id === numericId);
}

let nextId = mockProducts.length + 1;

export async function createProduct(
  newProduct: Partial<ProductData>,
): Promise<ProductData> {
  await delay(300);
  const product: ProductData = {
    id: nextId++,
    name: newProduct.name ?? "New Product",
    type: newProduct.type ?? "Product",
    stock: newProduct.stock ?? 0,
    unitPrice: newProduct.unitPrice ?? 0,
    currency: newProduct.currency ?? "USD",
    cost: newProduct.cost ?? 0,
    description: newProduct.description ?? "",
    lowStockThreshold: newProduct.lowStockThreshold ?? 0,
  };
  mockProducts.push(product);
  return product;
}

export async function updateProduct(
  id: string,
  updatedData: Partial<ProductData>,
): Promise<ProductData | null> {
  await delay(300);
  const numericId = parseInt(id, 10);
  const index = mockProducts.findIndex((p) => p.id === numericId);
  if (index === -1) return null;
  mockProducts[index] = { ...mockProducts[index], ...updatedData };
  return mockProducts[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  await delay(300);
  const numericId = parseInt(id, 10);
  const index = mockProducts.findIndex((p) => p.id === numericId);
  if (index === -1) return false;
  mockProducts.splice(index, 1);
  return true;
}

export async function fetchProductSummary() {
  await delay(300);
  const totalItems = mockProducts.length;
  const totalProducts = mockProducts.filter((p) => p.type === "Product").length;
  const totalServices = mockProducts.filter((p) => p.type === "Service").length;
  return { totalItems, totalProducts, totalServices };
}

// ✅ FIXED FILTER FUNCTION (Case-insensitive)
export async function getFilteredProducts({
  searchTerm,
  selectedCurrencies,
  selectedStatuses,
}: {
  searchTerm: string;
  selectedCurrencies: string[];
  selectedStatuses: string[];
}) {
  await new Promise((r) => setTimeout(r, 300));

  return mockProducts.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchCurrency =
      selectedCurrencies.length === 0 ||
      selectedCurrencies.some(
        (cur) =>
          cur.trim().toUpperCase() === product.currency.trim().toUpperCase(),
      );

    const matchType =
      selectedStatuses.length === 0 ||
      selectedStatuses.some(
        (status) =>
          status.trim().toLowerCase() === product.type.trim().toLowerCase(),
      );

    return matchSearch && matchType && matchCurrency;
  });
}
