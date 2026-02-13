"use client"; // Add this at the very top

import { ClientResponse } from "@/types/client";
import { useState } from "react";
import { Search, X, Plus, Check, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation"; // Change from next/router


type ClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientResponse[];
  onSelectClient: (client: ClientResponse) => void;
  onCreateNew?: () => void;
};

export const ClientModal = ({ isOpen, onClose, clients, onSelectClient }: ClientModalProps) => {
  const router = useRouter(); // Add this line
  const [searchTerm, setSearchTerm] = useState("");
  const [activeClient, setActiveClient] = useState<ClientResponse | null>(null);

  if (!isOpen) return null;

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = () => {
    console.log("Creating new client...")
    router.push('/clients/create'); 
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 flex h-[550px] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        
        <div className="flex items-center border-b px-4 py-4">
          <Search className="mr-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Client's business, name, email, phone..."
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={onClose} className="ml-2 rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 border-r bg-white p-4">
            <p className="mb-4 text-sm font-medium text-gray-500">Select a client</p>
            
            <button 
              type="button"
              onClick={handleCreateClient}
              className="mb-4 flex w-full items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Create a new client</span>
            </button>

            <div className="space-y-1 overflow-y-auto">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setActiveClient(client)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all ${
                    activeClient?.id === client.id 
                      ? "bg-purple-50 text-purple-600 shadow-sm" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onDoubleClick={() => {
                    onSelectClient(client);
                    onClose();
                  }}
                >
                  <span className="font-medium">{client.name}</span>
                  {activeClient?.id === client.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-8">
            {activeClient ? (
              <div className="flex flex-col items-center">
                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <UserCircle2 className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{activeClient.name}</h3>
                </div>

                <div className="w-full border-t pt-8">
                  <dl className="grid grid-cols-[120px_1fr] gap-y-6 text-base">
                    <dt className="font-semibold text-gray-900">Name</dt>
                    <dd className="text-gray-700">{activeClient.name}</dd>

                    <dt className="font-semibold text-gray-900">Phone number</dt>
                    <dd className="text-gray-700">{activeClient.phoneNumber || 'N/A'}</dd>

                    <dt className="font-semibold text-gray-900">Address</dt>
                    <dd className="text-gray-700">{activeClient.address || 'N/A'}</dd>
                  </dl>
                </div>

                <button 
                  onClick={() => { onSelectClient(activeClient); onClose(); }}
                  className="mt-10 w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Select this client
                </button>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <UserCircle2 className="mb-2 h-16 w-16 opacity-20" />
                <p>Select a client to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};