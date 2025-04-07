import { columns, Client } from '@/components/data-table'; // Assuming columns and Client type are exported
import { DataTable } from '@/components/data-table';     // Assuming DataTable component is exported

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
  ];
}

// This is a Server Component by default in Next.js App Router
export default async function ClientsPage() {
  // Fetch the data
  const clientData = await getClients();

  // Render the page with the DataTable
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8"> {/* Added padding */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Clients</h1> {/* Styled heading */}
      <DataTable columns={columns} data={clientData} />
    </div>
  );
}