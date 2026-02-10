export type Gender = "MALE" | "FEMALE";

export interface ClientCreateRequest {
  name: string;
  gender: Gender;
  phoneNumber: string;
  address: string;
}
export interface ClientUpdateRequest {
  name: string;
  gender: Gender;
  phoneNumber: string;
  address: string;
}

export interface ClientResponse {
  id: number;
  name: string;
  gender: Gender;
  phoneNumber: string;
  address: string;
  createAt: string;
  updatedAt: string;
  deletedAt: string | null;
}