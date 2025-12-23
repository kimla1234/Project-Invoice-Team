// types/formData.ts
export interface FullFormData {
  // Account info
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;

  // Company info
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyType?: "products" | "service" | "recurring" | "education";
  companyAddress?: string;
  companyLogo?: File | null;

  // Company details / address
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  street?: string;
  houseNo?: string;
}
