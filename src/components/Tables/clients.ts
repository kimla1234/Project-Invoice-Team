import { ClientData } from "@/types/client";

// Mock client data
export const mockClients: ClientData[] = [
  {
    id: 1,
    name: "John Doe",
    gender: "Male",
    contact: "855922334455",
    address: "#4 Street, City",
  },
  {
    id: 2,
    name: "Jane Smith",
    gender: "Female",
    contact: "855912345678",
    address: "#4 Street, City",
  },
  {
    id: 3,
    name: "Alice Johnson",
    gender: "Female",
    contact: "855944556677",
    address: "#4 Street, City",
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* =========================
   READ
========================= */

export async function getClientsTableData(): Promise<ClientData[]> {
  await delay(500);
  return mockClients;
}

export async function getClientById(
  id: string,
): Promise<ClientData | undefined> {
  await delay(300);
  const numericId = parseInt(id, 10);
  return mockClients.find((c) => c.id === numericId);
}

/* =========================
   CREATE
========================= */

let nextId = mockClients.length + 1;

export async function createClient(
  newClient: Partial<ClientData>,
): Promise<ClientData> {
  await delay(300);

  const client: ClientData = {
    id: nextId++,
    name: newClient.name ?? "New Client",
    gender: newClient.gender ?? "Male",
    contact: newClient.contact ?? "",
    address: newClient.address ?? "",
  };

  mockClients.push(client);
  return client;
}

/* =========================
   UPDATE
========================= */

export async function updateClient(
  id: string,
  updatedData: Partial<ClientData>,
): Promise<ClientData | null> {
  await delay(300);

  const numericId = parseInt(id, 10);
  const index = mockClients.findIndex((c) => c.id === numericId);

  if (index === -1) return null;

  mockClients[index] = {
    ...mockClients[index],
    ...updatedData,
  };

  return mockClients[index];
}

/* =========================
   DELETE
========================= */

export async function deleteClient(id: string): Promise<boolean> {
  await delay(300);

  const numericId = parseInt(id, 10);
  const index = mockClients.findIndex((c) => c.id === numericId);

  if (index === -1) return false;

  mockClients.splice(index, 1);
  return true;
}

/* =========================
   SUMMARY
========================= */

export async function fetchClientSummary() {
  await delay(300);

  const totalClients = mockClients.length;
  const totalMale = mockClients.filter((c) => c.gender === "Male").length;
  const totalFemale = mockClients.filter((c) => c.gender === "Female").length;

  return { totalClients, totalMale, totalFemale };
}

/* =========================
   FILTER (Case-insensitive)
========================= */

export async function getFilteredClients({
  searchTerm,
  selectedGenders,
}: {
  searchTerm: string;
  selectedGenders: string[];
}) {
  await delay(300);

  return mockClients.filter((client) => {
    const matchSearch = client.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchGender =
      selectedGenders.length === 0 ||
      selectedGenders.some(
        (g) => g.toLowerCase() === client.gender.toLowerCase(),
      );

    return matchSearch && matchGender;
  });
}
