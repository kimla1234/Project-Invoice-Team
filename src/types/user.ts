export type UserResponse = {
  uuid: string;
  name: string | null;
  email: string | null;
  image_profile: string | null;
  dob: string | null;
  phone_number: string | null;
  roles: string[];
  country: string | null;
  city: string | null;
  isBlock: boolean;
  isDelete: boolean;
  createdAt: string | null;
  lastModifiedAt: string | null;
};