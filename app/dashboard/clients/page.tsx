"use client"; // Make this a Client Component

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Input } from "@/components/ui/input"; // Assuming Shadcn UI Input
import { TableSkeleton } from "@/components/table-skeleton";
import { DataTableContent } from './data-table-content';
import { Client, columns } from "./components/columns";

// Simulate fetching data - Replace this with your actual data fetching logic
async function getClients(): Promise<Client[]> {
  console.log("Fetching client data...");
  // Reduced Dummy Data matching the Client type:
  return [
    {
      id: "CLI-001",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      contact: "123-456-7890",
      last_visit: "2024-07-15",
    },
    {
      id: "CLI-002",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@test.co",
      contact: "987-654-3210",
      last_visit: "2024-07-10",
    },
    {
      id: "CLI-003",
      first_name: "Peter",
      last_name: "Jones",
      email: "peter.jones@sample.net",
      contact: "555-123-4567",
      last_visit: "2024-06-20",
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      last_visit: "2024-07-18",
    }
  ];
}

export default function DashboardClientsPage() {
  const [clientData, setClientData] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await getClients();
      setClientData(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return clientData;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return clientData.filter(client =>
      Object.values(client).some(value =>
        String(value).toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  }, [clientData, searchTerm]);

  return (
    <div className="space-y-4" >
      {/* Add Search Input - Aligned Right */}
      <div className="flex items-center justify-end pr-4 ">
         <Input
           placeholder="Search clients... (any field)"
           value={searchTerm}
           onChange={(event) => setSearchTerm(event.target.value)}
           className="max-w-sm"
         />
       </div>

      {/* Render Table - Use Suspense or handle loading state */}
      {isLoading ? (
         <TableSkeleton />
      ) : (
         <DataTableContent columns={columns} data={filteredData} />
      )}

      {/* Alternative with Suspense (if DataTableContent supports it) */}
      {/*
      <Suspense fallback={<TableSkeleton />}>
        <DataTableContent columns={columns} data={filteredData} />
      </Suspense>
      */}
    </div>
  );
}
