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
  Avatar,
  TablePagination,
  Button,
} from "@mui/material";
import {
  IconRefresh,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";
import PageContainer from "@/app/(AdminLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(AdminLayout)/components/shared/DashboardCard";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function PendingAccountsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["pending-users", page, rowsPerPage, search],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/pending-users?page=${page + 1}&limit=${rowsPerPage}&search=${encodeURIComponent(search)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch pending users");
      return res.json();
    },
  });

  const pendingUsers = data?.data || [];
  const total = data?.pagination?.total || 0;

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/pending-users/${id}`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to approve user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      Swal.fire("Approved!", "The user account has been activated.", "success");
    },
    onError: (error: any) => {
      Swal.fire("Error!", error.message, "error");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/pending-users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to reject user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      Swal.fire("Rejected!", "The user has been removed.", "success");
    },
    onError: (error: any) => {
      Swal.fire("Error!", error.message, "error");
    },
  });

  const handleApprove = async (user: PendingUser) => {
    const result = await Swal.fire({
      title: "Approve Account?",
      html: `Approve <strong>${user.firstName} ${user.lastName}</strong>'s account?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#757575",
      confirmButtonText: "Yes, approve!",
    });
    if (result.isConfirmed) {
      approveMutation.mutate(user.id);
    }
  };

  const handleReject = async (user: PendingUser) => {
    const result = await Swal.fire({
      title: "Reject Account?",
      html: `This will permanently delete <strong>${user.firstName} ${user.lastName}</strong>'s registration.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#757575",
      confirmButtonText: "Yes, reject!",
    });
    if (result.isConfirmed) {
      rejectMutation.mutate(user.id);
    }
  };

  return (
    <PageContainer
      title="Pending Accounts"
      description="Approve or reject pending user registrations"
    >
      <DashboardCard
        title="Pending Accounts"
        action={
          <Chip
            label={`${total} pending`}
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
          flexWrap="wrap"
        >
          <TextField
            size="small"
            placeholder="Search pending users..."
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
        </Stack>

        {isLoading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : pendingUsers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              No pending accounts
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              All user registrations have been processed.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ overflowX: "auto" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      display: { xs: "none", md: "table-cell" },
                    }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      display: { xs: "none", lg: "table-cell" },
                    }}
                  >
                    Registered
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingUsers.map((user: PendingUser) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "warning.main",
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
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      <Chip size="small" color="info" label={user.role} />
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", lg: "table-cell" } }}
                    >
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
                        <Tooltip title="Approve">
                          <span>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<IconCheck size={16} />}
                              disabled={
                                approveMutation.isPending &&
                                approveMutation.variables === user.id
                              }
                              onClick={() => handleApprove(user)}
                              sx={{ textTransform: "none" }}
                            >
                              Approve
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <span>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<IconTrash size={16} />}
                              disabled={
                                rejectMutation.isPending &&
                                rejectMutation.variables === user.id
                              }
                              onClick={() => handleReject(user)}
                              sx={{ textTransform: "none" }}
                            >
                              Reject
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {pendingUsers.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </DashboardCard>
    </PageContainer>
  );
}
