"use client";

import React, { useState } from "react";
import { useGetMyClientsQuery } from "@/redux/service/client";
import { ClientResponse } from "@/types/client";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (client: ClientResponse) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSelectClient,
}) => {
  const { data: clients = [], isLoading } = useGetMyClientsQuery();
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-50 w-[500px] rounded-lg border bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Client</h2>
          <button
            onClick={onClose}
            className="font-bold text-red-500"
          >
            X
          </button>
        </div>

        <input
          type="text"
          placeholder="Search client..."
          className="mb-3 w-full rounded border p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {isLoading && (
            <p className="text-center text-gray-500">Loading...</p>
          )}

          {!isLoading && filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => {
                  onSelectClient(client);
                  onClose();
                }}
                className="cursor-pointer rounded p-2 hover:bg-gray-100"
              >
                <p className="font-semibold">{client.name}</p>
                <p className="text-sm text-gray-500">
                  {client.address}
                </p>
              </div>
            ))
          ) : (
            !isLoading && (
              <p className="text-center text-gray-500">
                No clients found
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};
