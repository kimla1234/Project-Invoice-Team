"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Edit2, Trash2, SearchX } from "lucide-react";

import { ClientData } from "@/types/client";
import { getClientsTableData, deleteClient } from "./clients";
import { PaginationControls } from "../ui/pagination-controls";
import { ConfirmDeleteClient } from "../Clients/delete-client/ConfirmDeleteClient";
import { SiNginxproxymanager } from "react-icons/si";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type VisibleColumns = {
  ID: boolean;
  Name: boolean;
  Gender: boolean;
  Contact: boolean;
  Address: boolean;
};

interface ClientTableProps {
  visibleColumns: VisibleColumns;
  searchTerm: string;
  selectedGenders: string[];
  onExportDataChange?: (rows: ClientData[]) => void;
  onDataChanged?: () => void;
}

export function ClientTable({
  visibleColumns,
  searchTerm,
  selectedGenders,
  onExportDataChange,
  onDataChanged,
}: ClientTableProps) {
  const [data, setData] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const totalPages = useMemo(() => {
    return Math.ceil(totalRows / rowsPerPage);
  }, [totalRows, rowsPerPage]);

  const fetchData = async (page: number, limit: number) => {
    setIsLoading(true);
    try {
      const allClients = await getClientsTableData();
      // Apply filters
      const filtered = allClients.filter((c) => {
        const q = searchTerm.trim().toLowerCase();
        const matchesSearch = q
          ? [c.name, c.gender, c.contact, c.address, String(c.id)]
              .filter(Boolean)
              .some((field) => String(field).toLowerCase().includes(q))
          : true;
        const matchesGender = selectedGenders && selectedGenders.length > 0
          ? selectedGenders.includes(c.gender)
          : true;
        return matchesSearch && matchesGender;
      });
      setTotalRows(filtered.length);
      const startIndex = (page - 1) * limit;
      const pagedClients = filtered.slice(startIndex, startIndex + limit);
      setData(pagedClients);
      // Provide full filtered dataset to export handler
      onExportDataChange?.(filtered);
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setIsLoading(false);
    }
  };
    useEffect(() => {
        fetchData(currentPage, rowsPerPage);
    }, [currentPage, rowsPerPage, searchTerm, selectedGenders]);

  const handleDelete = (id: number) => {
    setDeleteClientId(id);
    setIsDeleteModalOpen(true);
  };
    const confirmDelete = async () => {
    if (deleteClientId === null) return;
    try {
        const success = await deleteClient(deleteClientId.toString());
        if (success) {
        toast({
            title: "Client Deleted",
            description: "The client has been successfully deleted.",
            variant: "success",
        });
        fetchData(currentPage, rowsPerPage);
        onDataChanged?.();
        } else {
        toast({
            title: "Deletion Failed",
            description: "Failed to delete the client. Please try again.",
            variant: "destructive",
        });
        }
    } catch (error) {
        toast({
        title: "Error",
        description: "An error occurred while deleting the client.",
        variant: "destructive",
        });
    }
    setIsDeleteModalOpen(false);
    setDeleteClientId(null);
  };
    const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteClientId(null);
  }
    return (
    <div className="w-full">
        <Table>
        <TableHeader>
          <TableRow>
          {visibleColumns.ID && (
            <TableHead className="w-[50px]">ID</TableHead>
          )}
          {visibleColumns.Name && <TableHead>Name</TableHead>}
          {visibleColumns.Gender && <TableHead> Gender</TableHead>}
          {visibleColumns.Contact && <TableHead>Contact</TableHead>}
          {visibleColumns.Address && <TableHead>Address</TableHead>}
          {/* Always show actions column */}
          <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
            <TableCell colSpan={(visibleColumns.ID?1:0)+(visibleColumns.Name?1:0)+(visibleColumns.Gender?1:0)+(visibleColumns.Contact?1:0)+(visibleColumns.Address?1:0)+1} className="h-24 text-center">
                Loading...
                </TableCell>
            </TableRow>
            ) : data.length === 0 ? (
            <TableRow>
            <TableCell colSpan={(visibleColumns.ID?1:0)+(visibleColumns.Name?1:0)+(visibleColumns.Gender?1:0)+(visibleColumns.Contact?1:0)+(visibleColumns.Address?1:0)+1} className="h-24 text-center">
                No clients found.
                </TableCell>
            </TableRow>
            ) : (
            data.map((client) => (
              <TableRow key={client.id} className="hover:bg-gray-50 dark:hover:bg-dark-3">
              {visibleColumns.ID && (
                <TableCell className="font-medium">{client.id}</TableCell>
              )}
              {visibleColumns.Name && <TableCell>{client.name}</TableCell>}
              {visibleColumns.Gender && <TableCell>{client.gender}</TableCell>}
              {visibleColumns.Contact && <TableCell>{client.contact}</TableCell>}
              {visibleColumns.Address && <TableCell>{client.address}</TableCell>}
              <TableCell >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {/* Use a button inside the trigger for proper semantics/styling */}
                          <button className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-3">
                            <MoreHorizontal className="size-5 text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>

                        {/* Align the menu to the right side of the trigger */}
                        <DropdownMenuContent align="end" className="w-44">
                          <div className="px-2 border-b py-1">
                            Actions
                          </div>
                          <div>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/clients/${client.id}/edit`}
                                className="flex items-center focus:bg-primary/10"
                              >
                                <Edit2 className="mr-2 size-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                           

                            <DropdownMenuItem
                              onClick={() => handleDelete(client.id)}
                              className="flex items-center text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
              </TableRow>
            ))
            )}
        </TableBody>
        </Table>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalItems={totalRows}
          onPageChange={(page) => {
            setCurrentPage(page);
            fetchData(page, rowsPerPage);
          }}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
            fetchData(1, rows);
          }}
          availableRowsPerPage={[5, 8, 10, 20, 50]}
        />
        <ConfirmDeleteClient
        open={isDeleteModalOpen}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        />

    </div>
  );
}