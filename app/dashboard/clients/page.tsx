
import { TableSkeleton } from "@/components/table-skeleton"


import { columns, Client } from '@/components/data-table'; // Assuming columns and Client type are exported
import { DataTableContent } from './data-table-content';
import { Suspense } from 'react';

// Simulate fetching data - Replace this with your actual data fetching logic
async function getClients(): Promise<Client[]> {
  // Simple Dummy Data matching the Client type:
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
    },
    // Add more dummy clients if needed
  ];
}

// This is a Server Component by default in Next.js App Router
export default async function DashboardClientsPage() { // Renamed component slightly for clarity
  // Fetch the data
  const clientData = await getClients();

  // Render the DataTableContent component, passing data and columns
  return (
    // Using a fragment here, assuming layout provides container/padding
    <Suspense fallback={<TableSkeleton />}>

      <DataTableContent columns={columns} data={clientData} />
    </Suspense>
  );
}