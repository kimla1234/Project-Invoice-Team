export interface SettingResponse {
  userId: number;

  invoiceFooter: string | null;
  invoiceNote: string | null;
  signatureUrl: string | null;

  companyName: string | null;
  companyPhoneNumber: string | null;
  companyEmail: string | null;
  companyAddress: string | null;
  companyLogoUrl: string | null;
}
export interface SettingUpdateRequest {
  invoiceFooter?: string;
  invoiceNote?: string;
  signatureUrl?: string;

  companyName?: string;
  companyPhoneNumber?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyLogoUrl?: string;
}
export interface UserProfileUpdateRequest {
  name?: string;
  phone_number?: string;
  image_profile?: string | null;
}
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface ChangePasswordResponse {
  userId: number;
  message: string;
}