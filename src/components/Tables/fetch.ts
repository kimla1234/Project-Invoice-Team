import { ProductData } from "@/types/product";
import product01 from "../../../public/images/product/01.png";

// ឈ្មោះ Key សម្រាប់រក្សាទុកក្នុង Browser Storage
const STORAGE_KEY = "inventory_products";

// ១. ទិន្នន័យគំរូដើម (Initial Mock Data)
const initialProducts: ProductData[] = [
  { id: 1, name: "Apple Watch Series 7",type : "Product", stock: 22, lowStockThreshold: 5, unitPrice: 296, currency: "USD" ,image :"/images/product/01.png"},
  { id: 2, name: "MacBook Pro M1 Repair Service",type : "Product", lowStockThreshold: 5, stock: 0, unitPrice: 120, currency: "USD" , image : "https://macfinder.co.uk/wp-content/smush-webp/2023/08/img-MacBook-Pro-Retina-16-Inch-41411-scaled-scaled-1250x1250.jpg.webp" },
  { id: 3, name: "Dell Inspiron 15",type : "Product", stock: 64,lowStockThreshold: 5, unitPrice: 443, currency: "USD" , image:"https://storage.iserp.cloud/ice/undefined/1727151420615-2.jpg" },
  { id: 4, name: "HP ProBook 450",type : "Product", stock: 30,lowStockThreshold: 5, unitPrice: 499, currency: "USD" , image:"https://kaas.hpcloud.hp.com/PROD/v2/renderbinary/10218038/7802537/com-win-nb-p-probook-450-g10-roc-15-product-specification/com-nb-probook-440-450-g10-roc-product-image" },
  { id: 5, name: "Keyboard Logitech K380",type : "Product",  stock: 85, lowStockThreshold: 5,unitPrice: 39, currency: "USD" ,image:"https://i5.walmartimages.com/seo/Logitech-K380-Multi-Device-Bluetooth-Keyboard-Black_a053303c-b5fd-45e3-8f10-72ad2c57b78e_1.99de7ff48dd9d63b15e848e9aef53889.jpeg"},
  { id: 6, name: "Mouse Logitech MX Master 3", type : "Product", stock: 40, lowStockThreshold: 5,unitPrice: 99, currency: "USD", image:"https://gearstudiokh.com/web/image/product.template/476/image_1024?unique=c7b6e7d" },
  { id: 7, name: "Office Network Setup", type : "Product", stock: 0, lowStockThreshold: 5,unitPrice: 150, currency: "USD" ,image : "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"},
  { id: 8, name: "Website Maintenance Monthly", type : "Product", stock: 0,lowStockThreshold: 10, unitPrice: 80, currency: "USD" ,image : "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"},
  { id: 9, name: "Samsung 27” Monitor", type : "Product", stock: 18,lowStockThreshold: 5, unitPrice: 229, currency: "USD" ,image : "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"},
  { id: 10, name: "External SSD 1TB",type : "Product", stock: 55, lowStockThreshold: 5,unitPrice: 149, currency: "KHR" ,image : "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"},
  { id: 11, name: "Printer HP LaserJet",type : "Product",stock: 12, lowStockThreshold: 5,unitPrice: 320, currency: "USD" ,image : "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"},
  { id: 12, name: "Cloud Backup Service", type : "Product",stock: 0, lowStockThreshold: 5,unitPrice: 60, currency: "USD" ,image : "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"},
  { id: 13, name: "USB-C Hub 6-in-1", type : "Product",stock: 90,lowStockThreshold: 5, unitPrice: 45, currency: "USD",image : "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg" },
  { id: 14, name: "IT Consultation (Hourly)",type : "Product", stock: 0,lowStockThreshold: 5, unitPrice: 25, currency: "USD" ,image : "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"},
  { id: 15, name: "Router TP-Link AX3000", type : "Product", stock: 26, lowStockThreshold: 5,unitPrice: 110, currency: "USD" ,image : "https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"},
];

// ២. Helper functions សម្រាប់គ្រប់គ្រង LocalStorage
const getStoredData = (): ProductData[] => {
  if (typeof window === "undefined") return initialProducts; // ការពារ Error ពេល Build (SSR)
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // បើគ្មានទិន្នន័យក្នុង storage ទេ យកទិន្នន័យដើមមកប្រើ ហើយរក្សាទុកចូល storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
    return initialProducts;
  }
  return JSON.parse(stored);
};

const saveStoredData = (data: ProductData[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

// ៣. Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- API Functions សម្រាប់ប្រើប្រាស់ក្នុង Components ---

export async function getProductsTableData(): Promise<ProductData[]> {
  await delay(500);
  return getStoredData();
}

export async function getProductById(id: string): Promise<ProductData | undefined> {
  await delay(300);
  const products = getStoredData();
  const numericId = parseInt(id, 10);
  return products.find((p) => p.id === numericId);
}

export async function createProduct(newProduct: Partial<ProductData>): Promise<ProductData> {
  await delay(300);
  const products = getStoredData();
  
  const product: ProductData = {
    id: Date.now(), // ប្រើ Timestamp ដើម្បីឱ្យ ID មិនជាន់គ្នា
    name: newProduct.name ?? "New Item",
    type: newProduct.type ?? "Product",
    stock: newProduct.stock ?? 0,
    unitPrice: newProduct.unitPrice ?? 0,
    currency: newProduct.currency ?? "USD",
    image: newProduct.image ?? "", 
    description: newProduct.description ?? "",
    lowStockThreshold: newProduct.lowStockThreshold ?? 0,
  };

  const updatedProducts = [...products, product];
  saveStoredData(updatedProducts);
  return product;
}

export async function updateProduct(id: string, updatedData: Partial<ProductData>): Promise<ProductData | null> {
  await delay(300);
  const products = getStoredData();
  const numericId = parseInt(id, 10);
  const index = products.findIndex((p) => p.id === numericId);
  
  if (index === -1) return null;

  products[index] = { ...products[index], ...updatedData };
  saveStoredData(products);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  await delay(300);
  const products = getStoredData();
  const numericId = parseInt(id, 10);
  
  const filteredProducts = products.filter((p) => p.id !== numericId);
  
  if (products.length === filteredProducts.length) return false;

  saveStoredData(filteredProducts); // រក្សាទុកទិន្នន័យថ្មីក្រោយពេលលុប
  return true;
}

export async function fetchProductSummary() {
  await delay(300);
  const products = getStoredData();

  const totalItems = products.length;

  const totalProducts = products.filter(
    (p) => (p.stock ?? 0) > 0
  ).length;

  const outOfStock = products.filter(
    (p) => (p.stock ?? 0) === 0
  ).length;

  const lowStock = products.filter(
    (p) =>
      (p.stock ?? 0) > 0 &&
      (p.stock ?? 0) <= (p.lowStockThreshold ?? 0)
  ).length;

  return {
    totalItems,
    totalProducts,
    outOfStock,
    lowStock,
  };
}



export async function getFilteredProducts({
  searchTerm,
  selectedCurrencies,
  selectedStatuses,
}: {
  searchTerm: string;
  selectedCurrencies: string[];
  selectedStatuses: string[];
}) {
  await delay(300);
  const products = getStoredData();

  return products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCurrency =
      selectedCurrencies.length === 0 ||
      selectedCurrencies.some(
        (cur) =>
          cur.trim().toUpperCase() === (product.currency ?? "").trim().toUpperCase()
      );

    const matchType =
      selectedStatuses.length === 0 ||
      selectedStatuses.some(
        (status) => status.trim().toLowerCase() === (product.type ?? "").trim().toLowerCase()
      );

    return matchSearch && matchType && matchCurrency;
  });
}


