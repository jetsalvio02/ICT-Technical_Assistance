"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Switch,
  Avatar,
  TablePagination,
} from "@mui/material";
import {
  IconRefresh,
  IconEdit,
  IconTrash,
  IconPlus,
  IconFileSpreadsheet,
  IconKey,
} from "@tabler/icons-react";
import PageContainer from "@/app/(AdminLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(AdminLayout)/components/shared/DashboardCard";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { useRef } from "react";

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    role: "",
  });
  const [resetUser, setResetUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    role: "User",
  });

  // Fetch Users using useQuery
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["users", page, rowsPerPage, search],
    queryFn: async () => {
      const res = await fetch(
        `/api/users?page=${page + 1}&limit=${rowsPerPage}&search=${encodeURIComponent(search)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const users = data?.data || [];
  const total = data?.pagination?.total || 0;

  // Mutations
  const toggleActiveMutation = useMutation({
    mutationFn: async (user: UserRecord) => {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditUser(null);
      Swal.fire("Updated!", "User information has been updated.", "success");
    },
    onError: (error: any) => {
      Swal.fire("Error!", error.message, "error");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Failed to reset password");
      return res.json();
    },
    onSuccess: () => {
      setResetUser(null);
      setNewPassword("");
      Swal.fire("Success!", "Password has been reset.", "success");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      Swal.fire("Deleted!", "User has been deleted.", "success");
    },
    onError: (error: any) => {
      Swal.fire("Error!", error.message, "error");
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to add user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsAddModalOpen(false);
      setNewUser({
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        role: "User",
      });
      Swal.fire("Success!", "User has been added with default password: <b>welcome@123</b>", "success");
    },
    onError: (error: any) => {
      Swal.fire("Error!", error.message, "error");
    },
  });

  const handleToggleActive = (user: UserRecord) => {
    toggleActiveMutation.mutate(user);
  };

  const handleUpdateUser = () => {
    if (!editUser) return;
    updateUserMutation.mutate({ id: editUser.id, ...editForm });
  };

  const handleResetPassword = () => {
    if (!resetUser || !newPassword) return;
    resetPasswordMutation.mutate({ id: resetUser.id, password: newPassword });
  };

  const handleDeleteUser = async (user: UserRecord) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    deleteUserMutation.mutate(user.id);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      Swal.fire("Error", "Please fill in all required fields", "error");
      return;
    }
    addUserMutation.mutate(newUser);
  };

  const handleDownloadTemplate = () => {
    const ws_data = [
      ["First Name", "Middle Name", "Last Name", "Email"],
      ["John", "Doe", "Smith", "john.doe@example.com"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");
    XLSX.writeFile(wb, "users_template.xlsx");
  };

  const handleImportUsers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

        if (jsonData.length === 0) {
          Swal.fire("Error", "The Excel file is empty", "error");
          setImporting(false);
          return;
        }

        // Map column names to keys
        const formattedData = jsonData
          .map((item) => ({
            firstName: item["First Name"] || item["firstName"],
            middleName: item["Middle Name"] || item["middleName"],
            lastName: item["Last Name"] || item["lastName"],
            email: item["Email"] || item["email"],
          }))
          .filter((u) => u.firstName && u.lastName && u.email);

        if (formattedData.length === 0) {
          Swal.fire(
            "Error",
            "No valid user data found in the file. Ensure columns 'First Name', 'Last Name', and 'Email' are present.",
            "error",
          );
          setImporting(false);
          return;
        }

        const res = await fetch("/api/users/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userData: formattedData }),
        });

        const result = await res.json();
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          Swal.fire({
            title: "Import Success",
            html: `<p>${result.results.imported} users imported.</p>
                   <p>${result.results.skipped} duplicates or invalid entries skipped.</p>`,
            icon: "success",
          });
        } else {
          throw new Error(result.message || "Import failed");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error("Import error:", error);
      Swal.fire("Error", error.message || "Failed to import users", "error");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getRoleChip = (role: string) => {
    const config: Record<
      string,
      { color: "error" | "primary" | "info" | "default" }
    > = {
      Administrator: { color: "error" },
      Technician: { color: "primary" },
      User: { color: "info" },
    };
    const c = config[role] || { color: "default" as const };
    return <Chip size="small" color={c.color} label={role} />;
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <PageContainer title="Users Management" description="Manage system users">
      <DashboardCard title="Users Management">
        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 300 } }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()} disabled={isRefetching}>
              <IconRefresh
                size={20}
                className={isRefetching ? "animate-spin" : ""}
              />
            </IconButton>
          </Tooltip>

          <Box sx={{ flexGrow: 1 }} />
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleImportUsers}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleDownloadTemplate}
          >
            <IconFileSpreadsheet size={20} />
            Template
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <IconFileSpreadsheet size={20} />
            {importing ? "Importing..." : "Import Users"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <IconPlus size={20} />
            Add User
          </Button>
        </Stack>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {total} user{total !== 1 ? "s" : ""} found
        </Typography>

        {/* Table */}
        {isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, display: { xs: "none", md: "table-cell" } }}>Role</TableCell>
                  {/* <TableCell sx={{ fontWeight: 700 }}>Active</TableCell> */}
                  <TableCell sx={{ fontWeight: 700, display: { xs: "none", lg: "table-cell" } }}>Last Login</TableCell>
                  <TableCell sx={{ fontWeight: 700, display: { xs: "none", lg: "table-cell" } }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="textSecondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: UserRecord) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: "primary.main",
                              fontSize: 14,
                            }}
                          >
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.firstName} {user.lastName}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{getRoleChip(user.role)}</TableCell>
                      {/* <TableCell>
                        <Switch
                          size="small"
                          checked={user.isActive}
                          disabled={
                            toggleActiveMutation.isPending &&
                            toggleActiveMutation.variables?.id === user.id
                          }
                          onChange={() => handleToggleActive(user)}
                          color="success"
                        />
                      </TableCell> */}
                      <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                        <Typography variant="body2" color="textSecondary">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditUser(user);
                                setEditForm({
                                  firstName: user.firstName,
                                  lastName: user.lastName,
                                  middleName: user.middleName || "",
                                  email: user.email,
                                  role: user.role,
                                });
                              }}
                            >
                              <IconEdit size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset Password">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setResetUser(user);
                                setNewPassword("");
                              }}
                            >
                              <IconKey size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              disabled={
                                deleteUserMutation.isPending &&
                                deleteUserMutation.variables === user.id
                              }
                              onClick={() => {
                                handleDeleteUser(user);
                              }}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </DashboardCard>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm({ ...editForm, firstName: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Middle Name (Optional)"
                value={editForm.middleName}
                onChange={(e) =>
                  setEditForm({ ...editForm, middleName: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Last Name"
                required
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm({ ...editForm, lastName: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editForm.role}
                  label="Role"
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                >
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Technician">Technician</MenuItem>
                  <MenuItem value="Administrator">Administrator</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateUser}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUser} onClose={() => setResetUser(null)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent sx={{ minWidth: 350 }}>
          {resetUser && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body1">
                Reset password for{" "}
                <strong>
                  {resetUser.firstName} {resetUser.lastName}
                </strong>
              </Typography>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetUser(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleResetPassword}
            disabled={resetPasswordMutation.isPending || !newPassword}
          >
            {resetPasswordMutation.isPending ? "Resetting..." : "Reset"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add User Dialog */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
        <form onSubmit={handleAddUser}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Middle Name (Optional)"
                value={newUser.middleName}
                onChange={(e) =>
                  setNewUser({ ...newUser, middleName: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Last Name"
                required
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  label="Role"
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Technician">Technician</MenuItem>
                  <MenuItem value="Administrator">Administrator</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary">
                Note: The user will be created with the default password:
                <b> welcome@123</b>
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addUserMutation.isPending}
            >
              {addUserMutation.isPending ? "Adding..." : "Add User"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
}
