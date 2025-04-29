"use client"; // Make this a Client Component

import React, { useState, useEffect, useMemo, useCallback, useTransition, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet"; // Only need Sheet itself here
import { TableSkeleton } from "@/components/table-skeleton";
import { DataTableContent } from './data-table-content';
import { columns } from "./components/columns"; // Ensure this uses User columns
import { User, getUsers, NewUserData, getUserById, updateUser, deleteUser } from '@/services/users'; // USE USER SERVICES
import { Toaster } from "@/components/ui/sonner";
import { PlusCircle, Loader2, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { toast } from "sonner";
// Import the extracted components
import { UserSheetContent } from './components/UserSheetContent'; // Renamed for clarity, ensure file exists
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog'; // Import the generic dialog
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'; // Import the generic overlay
import { DataTablePagination } from '@/components/data-table-pagination'; // Import DataTablePagination
// Import TanStack Table hooks and types
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState, // Import PaginationState type
  // Add other necessary imports if needed later (e.g., sorting, filtering)
} from '@tanstack/react-table';
import { useAppSelector } from '@/store/hooks';
import { selectSalonId } from '@/store/slices/authSlice';
import { InviteUserSheet } from './components/InviteUserSheet';

type SheetMode = 'add' | 'view' | 'edit' | null;

// --- Main Page Component (Refactored for Users) ---
export default function UsersPage() {

  const selectedSalonId=useAppSelector(selectSalonId) || ''


  const [userData, setUserData] = useState<User[]>([]); // State for User data
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalRecords, setTotalRecords] = useState(0);

  // Debounce search with useRef and setTimeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Page/Sheet specific loading states
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sheet state
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // State for selected User
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null); // State for User to delete

  // --- TanStack Table State ---
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  // --- Action Handlers (Define BEFORE useReactTable) ---
  const handleOpenSheet = useCallback((mode: SheetMode, user: User | null = null) => { // Parameter is User
    setSheetMode(mode);
    setSelectedUser(user); // Set selected User
    setIsSheetOpen(true);
  }, []);

  const handleViewUser = useCallback(async (user: User) => { // Parameter is User
    try {
      setIsPageLoading(true);
      const freshUserData = await getUserById(user.id); // Use getUserById
      handleOpenSheet('view', freshUserData);
    } catch (error) {
      console.error(`Error fetching user with ID ${user.id}:`, error);
      toast.error("Error Loading User", { // Updated text
        description: error instanceof Error ? error.message : "Failed to load user details" // Updated text
      });
      handleOpenSheet('view', user); // Fallback
    } finally {
      setIsPageLoading(false);
    }
  }, [handleOpenSheet]);

  const handleEditUser = useCallback((user: User) => { // Parameter is User
    handleOpenSheet('edit', user);
  }, [handleOpenSheet]);

  const handleDeleteRequest = useCallback((user: User | null) => { // Parameter is User
    if (!user) return;
    setUserToDelete(user); // Set User to delete
    setIsDeleteDialogOpen(true);
  }, []);

  // --- Data Loading ---
  const loadData = useCallback(async (selectedSalonId: string, search?: string, page: number = pageIndex, size: number = pageSize) => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = page * size;
      const response = await getUsers(selectedSalonId,search, skip, size); // Use getUsers
      setUserData(response.records); // Set User data
      setTotalRecords(response.metadata.totalRecords);
    } catch (err) {
      console.error("Failed to load user data:", err); // Updated text
      setError(err instanceof Error ? err.message : "Failed to load users"); // Updated text
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize,selectedSalonId]);

  // Now add the invite sheet state and handlers AFTER loadData is defined
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);

  const handleOpenInviteSheet = useCallback(() => {
    setIsInviteSheetOpen(true);
  }, []);

  const handleCloseInviteSheet = useCallback(() => {
    setIsInviteSheetOpen(false);
  }, []);

  const handleInviteSuccess = useCallback(() => {
    // Optionally refresh the user list
    loadData(selectedSalonId, debouncedSearchTerm, pageIndex, pageSize);
  }, [loadData, selectedSalonId, debouncedSearchTerm, pageIndex, pageSize]);

  // --- TanStack Table Instance ---
  const table = useReactTable<User>({ // Generic is User
    data: userData ?? [], // Use User data
    columns, // Assumes columns are updated for User
    pageCount: Math.ceil(totalRecords / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    meta: useMemo(() => ({
        viewUser: handleViewUser, // Updated handler name
        editUser: handleEditUser, // Updated handler name
        deleteUser: (user: User) => handleDeleteRequest(user), // Updated handler name
    }), [handleViewUser, handleEditUser, handleDeleteRequest]), // Updated dependencies
    debugTable: process.env.NODE_ENV === 'development',
  });

  // --- Debounced Search Effect ---
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchTerm === "") {
      setDebouncedSearchTerm("");
      table.setPageIndex(0);
    } else {
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        table.setPageIndex(0);
      }, 500);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, table]);

  // --- WORKAROUND for lingering pointer-events: none on body ---
  useEffect(() => {
    // Check both sheet and dialog state
    if (!isSheetOpen && !isDeleteDialogOpen) {
      const timer = setTimeout(() => {
          if (document.body.style.pointerEvents === 'none') {
              document.body.style.pointerEvents = 'auto'; // Reset pointer events
          }
      }, 100); // Delay might need adjustment
      return () => clearTimeout(timer);
    }
  }, [isSheetOpen, isDeleteDialogOpen]);
  // --- END WORKAROUND ---

  // Load data when pagination or search term changes
  useEffect(() => {
    loadData(selectedSalonId,debouncedSearchTerm, pageIndex, pageSize);
  }, [ debouncedSearchTerm, pageIndex, pageSize,selectedSalonId]);

  // --- Sheet Handlers ---
  const handleChangeSheetMode = useCallback((mode: SheetMode, user: User | null = selectedUser) => { // Parameter is User
    setSheetMode(mode);
    setSelectedUser(user); // Set selected User
  }, [selectedUser]);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    // Add a slight delay before resetting pointer events if needed (from WORKAROUND)
    // setTimeout(() => {
    //     if (document.body.style.pointerEvents === 'none') {
    //         document.body.style.pointerEvents = 'auto';
    //     }
    // }, 150); // Adjust delay as needed
  }, []);


  // --- Delete Confirmation Handler ---
  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id); // Use deleteUser
      toast.success("User Deleted", { description: `${userToDelete.firstName} ${userToDelete.lastName} has been deleted.` }); // Updated text
      loadData(selectedSalonId,debouncedSearchTerm, table.getState().pagination.pageIndex, table.getState().pagination.pageSize);
      handleCloseSheet();
    } catch (error) {
      console.error("Failed to delete user:", error); // Updated text
      toast.error("Error Deleting User", { description: error instanceof Error ? error.message : "An unexpected error occurred." }); // Updated text
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null); // Clear User to delete
    }
  }, [
    userToDelete,
    debouncedSearchTerm,
    table,
    loadData,
    handleCloseSheet
  ]);

  const cancelDelete = useCallback(() => {
    setUserToDelete(null); // Clear User to delete
    setIsDeleteDialogOpen(false);
  }, []);

  // --- Component Handlers passed to Children ---
  const handleAddUserSuccess = useCallback((newOrUpdatedUser: NewUserData | User) => { // Parameter is User
    if ('id' in newOrUpdatedUser) {
      if (sheetMode === 'edit') {
        handleChangeSheetMode('view', newOrUpdatedUser as User); // Pass User
        loadData(selectedSalonId,debouncedSearchTerm, table.getState().pagination.pageIndex, table.getState().pagination.pageSize);
      } else if (sheetMode === 'add') {
        loadData(selectedSalonId,debouncedSearchTerm, table.getState().pagination.pageIndex, table.getState().pagination.pageSize);
        handleCloseSheet();
      }
    } else {
        console.error("handleAddUserSuccess called with unexpected data format:", newOrUpdatedUser); // Updated log
        toast.error("An unexpected error occurred during the operation.");
        loadData(selectedSalonId,debouncedSearchTerm, table.getState().pagination.pageIndex, table.getState().pagination.pageSize);
    }
  }, [
    sheetMode,
    handleChangeSheetMode,
    handleCloseSheet,
    loadData,
    debouncedSearchTerm,
    table,
  ]);

  const handleRequestDeleteFromSheet = useCallback(() => {
    handleDeleteRequest(selectedUser); // Pass selected User
  }, [handleDeleteRequest, selectedUser]);

  return (
    <div className="space-y-4 sm:p-2 p-4 relative">
      <LoadingOverlay
        isLoading={isPageLoading || isPending}
        message={isPending ? "Updating user information..." : "Loading user information..."} // Updated text
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4">
        <div className="flex-1"></div> {/* Spacer */}
        <div className="relative w-full sm:max-w-sm">
          <Input
            placeholder="Search users..." // Updated placeholder
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full"
          />
          {debouncedSearchTerm !== searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {/* <Button
            onClick={() => handleOpenSheet('add')}
            className="flex-none"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add User
          </Button> */}
          <Button
            onClick={handleOpenInviteSheet}
            variant="outline"
            className="flex-none"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Invite
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className="text-red-600 p-4 border border-red-600 bg-red-100 rounded-md">Error: {error}</div>}

      {/* Table Area */}
      <div className="rounded-md ">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <DataTableContent columns={columns} table={table} />
            <div className="p-4">
              <DataTablePagination
                table={table}
                pageSizeOptions={[5, 10, 20, 50]}
                totalRecords={totalRecords}
              />
            </div>
          </>
        )}
      </div>

      {/* User Sheet */}
      <Sheet
        key={selectedUser?.id ?? 'add'} // Key depends on selected User
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      >
        <UserSheetContent
            sheetMode={sheetMode}
            selectedUser={selectedUser} // Pass selected User
            onSuccess={handleAddUserSuccess} // Pass User success handler
            onChangeMode={handleChangeSheetMode}
            onCloseSheet={handleCloseSheet}
            onRequestDelete={handleRequestDeleteFromSheet}
            isLoading={false} // Keep this prop if UserSheetContent expects it
        />
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete User" // Updated title
        description="Are you sure you want to permanently delete this user? This action cannot be undone." // Updated description
        itemName={userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : undefined} // Use User data
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmButtonText="Delete"
        confirmButtonVariant="destructive"
      />

      {/* Add the InviteUserSheet */}
      <InviteUserSheet
        isOpen={isInviteSheetOpen}
        onClose={handleCloseInviteSheet}
        onSuccess={handleInviteSuccess}
      />

      {/* Toaster */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
