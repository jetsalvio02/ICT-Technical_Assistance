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
  Tab,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  IconRefresh,
  IconEdit,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import PageContainer from "@/app/(AdminLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(AdminLayout)/components/shared/DashboardCard";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DistrictRecord {
  id: string;
  name: string;
  type: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface OfficeRecord {
  id: string;
  name: string;
  type: string;
  districtId: string;
  district?: { id: string; name: string };
  schoolHead?: string | null;
  schoolHeadContact?: string | null;
  ictCoordinator?: string | null;
  ictCoordinatorContact?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("1");
  const [search, setSearch] = useState("");

  // Dialog State
  const [openDistrictDialog, setOpenDistrictDialog] = useState(false);
  const [openOfficeDialog, setOpenOfficeDialog] = useState(false);
  const [editDistrict, setEditDistrict] = useState<DistrictRecord | null>(null);
  const [editOffice, setEditOffice] = useState<OfficeRecord | null>(null);

  // Form State - District/Cluster
  const [districtForm, setDistrictForm] = useState({
    name: "",
    type: "District",
    code: "",
    description: "",
  });

  // Form State - Office/School
  const [officeForm, setOfficeForm] = useState({
    name: "",
    type: "Office",
    districtId: "",
    schoolHead: "",
    schoolHeadContact: "",
    ictCoordinator: "",
    ictCoordinatorContact: "",
    address: "",
  });

  // Queries
  const {
    data: districts,
    isLoading: loadingDistricts,
    refetch: refetchDistricts,
  } = useQuery<DistrictRecord[]>({
    queryKey: ["districts"],
    queryFn: async () => {
      const res = await fetch("/api/districts");
      if (!res.ok) throw new Error("Failed to fetch districts");
      return res.json();
    },
  });

  const {
    data: offices,
    isLoading: loadingOffices,
    refetch: refetchOffices,
  } = useQuery<OfficeRecord[]>({
    queryKey: ["offices"],
    queryFn: async () => {
      const res = await fetch("/api/offices");
      if (!res.ok) throw new Error("Failed to fetch offices");
      return res.json();
    },
  });

  // Mutations - Districts
  const saveDistrictMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editDistrict
        ? `/api/districts/${editDistrict.id}`
        : "/api/districts";
      const method = editDistrict ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save district");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      setOpenDistrictDialog(false);
      Swal.fire(
        "Success!",
        `District/Cluster has been ${editDistrict ? "updated" : "created"}.`,
        "success",
      );
    },
  });

  const deleteDistrictMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/districts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete district");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      Swal.fire("Deleted!", "District/Cluster has been deleted.", "success");
    },
  });

  // Mutations - Offices
  const saveOfficeMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editOffice ? `/api/offices/${editOffice.id}` : "/api/offices";
      const method = editOffice ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save office");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setOpenOfficeDialog(false);
      Swal.fire(
        "Success!",
        `Office/School has been ${editOffice ? "updated" : "created"}.`,
        "success",
      );
    },
  });

  const deleteOfficeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/offices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete office");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      Swal.fire("Deleted!", "Office/School has been deleted.", "success");
    },
  });

  // Handlers - District
  const handleAddDistrict = () => {
    setEditDistrict(null);
    setDistrictForm({ name: "", type: "District", code: "", description: "" });
    setOpenDistrictDialog(true);
  };

  const handleEditDistrict = (district: DistrictRecord) => {
    setEditDistrict(district);
    setDistrictForm({
      name: district.name,
      type: district.type,
      code: district.code || "",
      description: district.description || "",
    });
    setOpenDistrictDialog(true);
  };

  const handleDeleteDistrict = async (district: DistrictRecord) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) deleteDistrictMutation.mutate(district.id);
  };

  // Handlers - Office
  const handleAddOffice = () => {
    setEditOffice(null);
    setOfficeForm({
      name: "",
      type: "Office",
      districtId: "",
      schoolHead: "",
      schoolHeadContact: "",
      ictCoordinator: "",
      ictCoordinatorContact: "",
      address: "",
    });
    setOpenOfficeDialog(true);
  };

  const handleEditOffice = (office: OfficeRecord) => {
    setEditOffice(office);
    setOfficeForm({
      name: office.name,
      type: office.type,
      districtId: office.districtId,
      schoolHead: office.schoolHead || "",
      schoolHeadContact: office.schoolHeadContact || "",
      ictCoordinator: office.ictCoordinator || "",
      ictCoordinatorContact: office.ictCoordinatorContact || "",
      address: office.address || "",
    });
    setOpenOfficeDialog(true);
  };

  const handleDeleteOffice = async (office: OfficeRecord) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) deleteOfficeMutation.mutate(office.id);
  };

  const filteredDistricts = (districts || []).filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.type || "").toLowerCase().includes(search.toLowerCase()),
  );

  const filteredOffices = (offices || []).filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.type || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.district?.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageContainer
      title="Departments Management"
      description="Manage Offices, Schools, Districts and Clusters"
    >
      <DashboardCard title="Departments Management">
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList
              onChange={(e, newVal) => setTab(newVal)}
              aria-label="department tabs"
            >
              <Tab label="Districts & Clusters" value="1" />
              <Tab label="Offices & Schools" value="2" />
            </TabList>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 3 }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 300 }}
            />
            <Tooltip title="Refresh">
              <IconButton
                onClick={() =>
                  tab === "1" ? refetchDistricts() : refetchOffices()
                }
              >
                <IconRefresh size={20} />
              </IconButton>
            </Tooltip>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              color="primary"
              onClick={tab === "1" ? handleAddDistrict : handleAddOffice}
              startIcon={<IconPlus size={20} />}
            >
              Add {tab === "1" ? "District/Cluster" : "Office/School"}
            </Button>
          </Stack>

          <TabPanel value="1" sx={{ px: 0 }}>
            {loadingDistricts ? (
              <Skeleton variant="rectangular" height={400} />
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      {/* <TableCell sx={{ fontWeight: 700 }}>Code</TableCell> */}
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDistricts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDistricts.map((d) => (
                        <TableRow key={d.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {d.name}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={
                                d.type === "District" ? "primary" : "secondary"
                              }
                              label={d.type}
                            />
                          </TableCell>
                          {/* <TableCell>{d.code || "-"}</TableCell> */}
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditDistrict(d)}
                              >
                                <IconEdit size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteDistrict(d)}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value="2" sx={{ px: 0 }}>
            {loadingOffices ? (
              <Skeleton variant="rectangular" height={400} />
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        District/Cluster
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Contacts</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOffices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOffices.map((o) => (
                        <TableRow key={o.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {o.name}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="outlined"
                              color={o.type === "Office" ? "info" : "success"}
                              label={o.type}
                            />
                          </TableCell>
                          <TableCell>{o.district?.name || "-"}</TableCell>
                          <TableCell>
                            <Typography variant="caption" display="block">
                              Head: {o.schoolHead || "N/A"}
                            </Typography>
                            <Typography variant="caption" display="block">
                              ICT: {o.ictCoordinator || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditOffice(o)}
                              >
                                <IconEdit size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteOffice(o)}
                              >
                                <IconTrash size={18} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </TabContext>
      </DashboardCard>

      {/* District/Cluster Dialog */}
      <Dialog
        open={openDistrictDialog}
        onClose={() => setOpenDistrictDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editDistrict ? "Edit" : "Add"} District/Cluster
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={districtForm.type}
                label="Type"
                onChange={(e) =>
                  setDistrictForm({ ...districtForm, type: e.target.value })
                }
              >
                <MenuItem value="District">District</MenuItem>
                {/* <MenuItem value="Cluster">Cluster</MenuItem> */}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={
                districtForm.type === "District"
                  ? "District Name"
                  : "Cluster Name"
              }
              value={districtForm.name}
              onChange={(e) =>
                setDistrictForm({ ...districtForm, name: e.target.value })
              }
            />
            {/* <TextField
              fullWidth
              label="Code"
              value={districtForm.code}
              onChange={(e) =>
                setDistrictForm({ ...districtForm, code: e.target.value })
              }
            /> */}
            {/* <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={districtForm.description}
              onChange={(e) =>
                setDistrictForm({
                  ...districtForm,
                  description: e.target.value,
                })
              }
            /> */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDistrictDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!districtForm.name || saveDistrictMutation.isPending}
            onClick={() => saveDistrictMutation.mutate(districtForm)}
          >
            {saveDistrictMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Office/School Dialog */}
      <Dialog
        open={openOfficeDialog}
        onClose={() => setOpenOfficeDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editOffice ? "Edit" : "Add"} Office/School</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={officeForm.type}
                  label="Type"
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, type: e.target.value })
                  }
                >
                  <MenuItem value="Office">Office</MenuItem>
                  <MenuItem value="School">School</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>District/Cluster</InputLabel>
                <Select
                  value={officeForm.districtId}
                  label="District/Cluster"
                  onChange={(e) =>
                    setOfficeForm({ ...officeForm, districtId: e.target.value })
                  }
                >
                  {(districts || []).map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name} ({d.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              fullWidth
              label={
                officeForm.type === "Office" ? "Office Name" : "School Name"
              }
              value={officeForm.name}
              onChange={(e) =>
                setOfficeForm({ ...officeForm, name: e.target.value })
              }
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="School Head"
                value={officeForm.schoolHead}
                onChange={(e) =>
                  setOfficeForm({ ...officeForm, schoolHead: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Head Contact"
                value={officeForm.schoolHeadContact}
                onChange={(e) =>
                  setOfficeForm({
                    ...officeForm,
                    schoolHeadContact: e.target.value,
                  })
                }
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="ICT Coordinator"
                value={officeForm.ictCoordinator}
                onChange={(e) =>
                  setOfficeForm({
                    ...officeForm,
                    ictCoordinator: e.target.value,
                  })
                }
              />
              <TextField
                fullWidth
                label="ICT Contact"
                value={officeForm.ictCoordinatorContact}
                onChange={(e) =>
                  setOfficeForm({
                    ...officeForm,
                    ictCoordinatorContact: e.target.value,
                  })
                }
              />
            </Stack>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={officeForm.address}
              onChange={(e) =>
                setOfficeForm({ ...officeForm, address: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOfficeDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              !officeForm.name ||
              !officeForm.districtId ||
              saveOfficeMutation.isPending
            }
            onClick={() => saveOfficeMutation.mutate(officeForm)}
          >
            {saveOfficeMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
