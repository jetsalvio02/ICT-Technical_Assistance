"use client";

import { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
  Pagination,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import {
  IconRefresh,
  IconEye,
  IconUserCheck,
  IconX,
  IconCheck,
  IconPrinter,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import PageContainer from "@/app/(AdminLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(AdminLayout)/components/shared/DashboardCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

interface ServiceRequest {
  id: string;
  requestNumber: string;
  problemDescription: string;
  status: string;
  priority: string;
  createdAt: string;
  dateOfRequest: string;
  timeOfRequest?: string;
  schoolHead?: string;
  schoolHeadContact?: string;
  ictCoordinator?: string;
  ictCoordinatorContact?: string;
  depEdEmail?: string;
  recoveryPersonalEmail?: string;
  recoveryMobileNumber?: string;
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    phone?: string;
  };
  office?: { name: string };
  district?: { name: string };
  categories?: { categoryType: string; subCategory: string }[];
  findings?: {
    itemDescription: string;
    serialNumber?: string;
    problemIssue: string;
    status?: string;
    recommendationDescription?: string;
    actionTaken?: string;
  }[];
  assignedTo?: { firstName: string; lastName: string } | null;
}

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
}

export default function RequestListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignRequestId, setAssignRequestId] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  // Findings modal state
  const [findingsDialogOpen, setFindingsDialogOpen] = useState(false);
  const [findingsRequestId, setFindingsRequestId] = useState<string>("");
  const [findingsForm, setFindingsForm] = useState({
    itemDescription: "",
    serialNumber: "",
    problemIssue: "",
    status: "",
    recommendationDescription: "",
    actionTaken: "",
  });

  // Edit modal state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRequestId, setEditRequestId] = useState<string>("");
  const [editForm, setEditForm] = useState({
    problemDescription: "",
    priority: "medium",
    schoolHead: "",
    schoolHeadContact: "",
    ictCoordinator: "",
    ictCoordinatorContact: "",
    depEdEmail: "",
    recoveryPersonalEmail: "",
    recoveryMobileNumber: "",
  });

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  // Fetch Requests
  const {
    data: requestsData,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["service-requests", page, statusFilter, debouncedSearch, limit],
    queryFn: async () => {
      let url = `/api/service-requests?page=${page}&limit=${limit}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (debouncedSearch)
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
  });

  // Fetch Technicians
  const { data: technicians = [] } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const res = await fetch("/api/users?limit=100");
      if (!res.ok) throw new Error("Failed to fetch technicians");
      const data = await res.json();
      return (data.data || []).filter(
        (u: any) => u.role === "Technician" || u.role === "Administrator",
      ) as Technician[];
    },
  });

  const requests = requestsData?.data || [];
  const totalPages = requestsData?.pagination?.totalPages || 1;

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const assignTechnicianMutation = useMutation({
    mutationFn: async ({
      id,
      technicianId,
    }: {
      id: string;
      technicianId: string;
    }) => {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: technicianId }),
      });
      if (!res.ok) throw new Error("Failed to assign technician");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      setAssignDialogOpen(false);
      setSelectedTechnician("");
      Swal.fire("Assigned!", "Technician has been assigned.", "success");
    },
  });

  const completeWithFindingsMutation = useMutation({
    mutationFn: async ({
      id,
      findingsData,
    }: {
      id: string;
      findingsData: typeof findingsForm;
    }) => {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", findingsData }),
      });
      if (!res.ok) throw new Error("Failed to complete request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setFindingsDialogOpen(false);
      setFindingsForm({
        itemDescription: "",
        serialNumber: "",
        problemIssue: "",
        status: "",
        recommendationDescription: "",
        actionTaken: "",
      });
      Swal.fire(
        "Completed!",
        "Request has been marked as completed.",
        "success",
      );
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      Swal.fire("Deleted!", "Request has been deleted.", "success");
    },
  });

  const updateRequestDetailsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      setEditDialogOpen(false);
      Swal.fire("Updated!", "Request details have been updated.", "success");
    },
  });

  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleOpenFindings = (id: string) => {
    setFindingsRequestId(id);
    setFindingsForm({
      itemDescription: "",
      serialNumber: "",
      problemIssue: "",
      status: "",
      recommendationDescription: "",
      actionTaken: "",
    });
    setFindingsDialogOpen(true);
  };

  const handleSubmitFindings = () => {
    // if (
    //   !findingsForm.itemDescription ||
    //   !findingsForm.problemIssue ||
    //   !findingsForm.status
    // ) {
    //   Swal.fire("Error", "Please fill in all required fields.", "error");
    //   return;
    // }
    completeWithFindingsMutation.mutate({
      id: findingsRequestId,
      findingsData: findingsForm,
    });
  };

  const handleAssign = () => {
    if (!assignRequestId || !selectedTechnician) return;
    assignTechnicianMutation.mutate({
      id: assignRequestId,
      technicianId: selectedTechnician,
    });
  };

  const handleDeleteRequest = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRequestMutation.mutate(id);
      }
    });
  };

  const handleOpenEdit = (req: ServiceRequest) => {
    setEditRequestId(req.id);
    setEditForm({
      problemDescription: req.problemDescription || "",
      priority: req.priority || "medium",
      schoolHead: req.schoolHead || "",
      schoolHeadContact: req.schoolHeadContact || "",
      ictCoordinator: req.ictCoordinator || "",
      ictCoordinatorContact: req.ictCoordinatorContact || "",
      depEdEmail: req.depEdEmail || "",
      recoveryPersonalEmail: req.recoveryPersonalEmail || "",
      recoveryMobileNumber: req.recoveryMobileNumber || "",
    });

    // Populate findings if available
    const initialFinding = req.findings?.[0];
    setFindingsForm({
      itemDescription: initialFinding?.itemDescription || "",
      serialNumber: initialFinding?.serialNumber || "",
      problemIssue: initialFinding?.problemIssue || "",
      status: initialFinding?.status || "",
      recommendationDescription:
        initialFinding?.recommendationDescription || "",
      actionTaken: initialFinding?.actionTaken || "",
    });

    setEditDialogOpen(true);
  };

  const handleUpdateDetails = () => {
    updateRequestDetailsMutation.mutate({
      id: editRequestId,
      data: {
        ...editForm,
        findingsData: findingsForm,
      },
    });
  };

  const handlePrint = async (requestId: string) => {
    try {
      const res = await fetch(`/api/service-requests/${requestId}`);
      if (!res.ok) throw new Error("Failed to fetch request");
      const req: ServiceRequest = await res.json();

      const cats = req.categories || [];
      const hardwareSubs = [
        "Printer",
        "System Unit",
        "Monitor/Display",
        "Internal",
        "Peripherals",
        "Connectors/Plugs/Power",
      ];
      const softwareSubs = [
        "OS",
        "Drivers",
        "Malware",
        "Installation",
        "Update",
        "Files/Data",
      ];
      const networkSubs = ["LAN Configuration", "Router/Cables", "Internet"];
      const otherSubs = ["DCP"];

      const isChecked = (type: string, sub: string) =>
        cats.some(
          (c) =>
            c.categoryType?.toLowerCase() === type.toLowerCase() &&
            c.subCategory?.toLowerCase() === sub.toLowerCase(),
        );

      const checkMark = (type: string, sub: string) =>
        isChecked(type, sub) ? "✓" : "";

      // Pad findings to at least 6 rows
      const findingsRows = [...(req.findings || [])];
      while (findingsRows.length < 6)
        findingsRows.push({
          itemDescription: "",
          serialNumber: "",
          problemIssue: "",
        });

      // Action taken
      const actionText = (req.findings || [])
        .map((f) => f.actionTaken)
        .filter(Boolean)
        .join("; ");

      // Status/Recommendation mapping
      const statusMap: Record<string, string> = {
        good: "GOOD/RETURNED",
        authorized: "CHECK FOR AUTHORIZED SERVICE CENTER",
        replacement: "FOR PART REPLACEMENT",
        unserviceable: "UNSERVICEABLE",
      };
      const findingStatuses = (req.findings || [])
        .map((f) => f.status)
        .filter(Boolean);
      const isStatusChecked = (key: string) =>
        findingStatuses.includes(key) ? "✓" : "";

      const formatDate = (d: string) => {
        if (!d) return "";
        return new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      };

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<base href="${window.location.origin}">
<title>ICT TA Form - ${req.requestNumber}</title>
<style>
  @page { size: 8.5in 13in; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: #000;
    background: #fff;
    width: 8.5in;
    min-height: 13in;
    padding: 6mm;
    margin: 0 auto;
  }
  .form-container {
    width: 100%;
    min-height: calc(13in - 12mm);
    border: 1.5px solid #000;
    display: flex;
    flex-direction: column;
  }
  .header {
    text-align: center;
    padding: 14px 14px 10px;
    border-bottom: 1.5px solid #000;
  }
  .header .seal { font-size: 11px; margin-bottom: 3px; }
  .header .republic { font-family: 'Old English Text MT', 'Times New Roman', serif; font-size: 16px; }
  .header .deped { font-family: 'Old English Text MT', 'Times New Roman', serif; font-size: 24px; font-weight: bold; }
  .header .region { font-size: 13px; }
  .header .division { font-size: 14px; font-weight: bold; }
  .header .form-title { font-size: 14px; font-weight: bold; }
  .two-col {
    display: flex;
    border-bottom: 1.5px solid #000;
  }
  .two-col .left {
    flex: 1;
    padding: 8px 10px;
    border-right: 1.5px solid #000;
  }
  .two-col .right {
    flex: 1;
    padding: 8px 10px;
  }
  .field-row {
    display: flex;
    margin-bottom: 4px;
    font-size: 12px;
    line-height: 1.8;
  }
  .field-label {
    font-weight: normal;
    min-width: 135px;
    white-space: nowrap;
  }
  .field-value {
    flex: 1;
    border-bottom: 1px solid #000;
    min-height: 18px;
    padding-left: 4px;
    font-weight: bold;
  }
  .section-title {
    font-weight: bold;
    font-size: 12px;
    text-align: center;
    padding: 1px;
  }
  .italic-label { font-style: italic; font-weight: bold; }
  .indent { padding-left: 20px; }

  /* Nature of Request table */
  .nature-table {
    width: 100%;
    border-collapse: collapse;
    border-bottom: 1.5px solid #000;
  }
  .nature-table th, .nature-table td {
    border: 1px solid #000;
    padding: 2px 4px;
    font-size: 11px;
    text-align: center;
    vertical-align: middle;
  }
  .nature-table th {
    font-weight: bold;
    background: #f0f0f0;
  }
  .nature-header-label {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    font-weight: bold;
    font-size: 11px;
    padding: 4px 2px;
  }

  /* Findings table */
  .findings-table {
    width: 100%;
    border-collapse: collapse;
    border-bottom: 1.5px solid #000;
  }
  .findings-table th, .findings-table td {
    border: 1px solid #000;
    padding: 3px 5px;
    font-size: 9px;
    vertical-align: top;
  }
  .findings-table th {
    font-weight: bold;
    text-align: center;
    background: #f0f0f0;
  }
  .findings-vert {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    font-weight: bold;
    font-size: 9px;
    text-align: center;
    padding: 4px 2px;
  }

  /* Action Taken */
  .action-section {
    display: flex;
    border-bottom: 1.5px solid #000;
    min-height: 90px;
  }
  .action-label {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    font-weight: bold;
    font-size: 11px;
    text-align: center;
    border-right: 1px solid #000;
    padding: 4px 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 25px;
  }
  .action-content {
    flex: 1;
    padding: 5px 8px;
    font-size: 12px;
    line-height: 1.8;
  }

  /* Status */
  .status-section {
    padding: 5px 8px;
    border-bottom: 1.5px solid #000;
    font-size: 12px;
    line-height: 1.7;
  }

  /* Bottom section */
  .bottom-section {
    display: flex;
    border-bottom: 1.5px solid #000;
  }
  .bottom-section .col {
    flex: 1;
    padding: 5px 8px;
    font-size: 11px;
  }
  .bottom-section .col:not(:last-child) {
    border-right: 1.5px solid #000;
  }
  .feedback-boxes {
    display: flex;
    gap: 4px;
    margin-top: 3px;
    margin-bottom: 5px;
  }
  .feedback-box {
    border: 1px solid #000;
    width: 56px;
    height: 36px;
    text-align: center;
    font-size: 9px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 1px;
  }
  .sig-line {
    border-top: 1px solid #000;
    margin-top: 15px;
    padding-top: 2px;
    text-align: center;
    font-size: 10px;
  }
  .noted-name {
    font-weight: bold;
    font-size: 13px;
    text-align: center;
    margin-top: 10px;
  }
  .noted-title {
    font-size: 10px;
    text-align: center;
  }

  /* Footer */
  .footer {
    display: flex;
    padding: 10px 8px;
    font-size: 10px;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #000;
  }
  .footer-left {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
  }
  .footer-info {
    flex: 2;
    text-align: center;
    line-height: 1.4;
    font-size: 10px;
  }
  .doc-code-table {
    border-collapse: collapse;
    font-size: 9px;
  }
  .doc-code-table td {
    border: 1px solid #000;
    padding: 2px 5px;
  }

  .ict-unit-line {
    text-align: center;
    font-size: 12px;
    padding: 2px;
    border-bottom: 1.5px solid #000;
  }

  @media print {
    @page { size: 8.5in 13in; margin: 0; }
    body {
      width: 8.5in;
      min-height: 13in;
      padding: 6mm;
      margin: 0;
    }
    .form-container { border: 1.5px solid #000; }
  }
</style>
</head>
<body>
<div class="form-container">
  <!-- HEADER -->
  <div class="header" style="position: relative; padding-top: 84px;">
    <img src="/logo.png" alt="DepEd Logo" style="position:absolute; left:50%; top:8px; transform: translateX(-50%); width:82px; height:auto;" />
    <div class="republic">Republic of the Philippines</div>
    <div class="deped">Department of Education</div>
    <div class="region">Region VI-Western Visayas</div>
    <div class="division">SCHOOLS DIVISION OF KABANKALAN CITY</div>
    <div class="form-title">ICT TECHNICAL ASSISTANCE (TA) FORM</div>
  </div>

  <!-- CLIENT INFORMATION + SHORT DESCRIPTION -->
  <div class="two-col">
    <div class="left">
      <div style="font-weight:bold; font-size:12px; text-align:center; margin-bottom:5px;">CLIENT INFORMATION</div>
      <div class="field-row"><span class="field-label">First Name:</span><span class="field-value">${
        req.requester?.firstName || ""
      }</span></div>
      <div class="field-row"><span class="field-label">Last Name:</span><span class="field-value">${
        req.requester?.lastName || ""
      }</span></div>
      <div class="field-row"><span class="field-label">Office/School:</span><span class="field-value">${
        req.office?.name || ""
      }</span></div>
      <div class="field-row"><span class="field-label">Date of Request:</span><span class="field-value">${formatDate(
        req.dateOfRequest,
      )}</span></div>
      <div class="field-row"><span class="field-label">Time of Request:</span><span class="field-value">${
        req.timeOfRequest || ""
      }</span></div>
      <div class="field-row"><span class="italic-label">If Applicable:</span></div>
      <div class="field-row"><span class="field-label">District/Cluster:</span><span class="field-value">${
        req.district?.name || ""
      }</span></div>
      <div class="field-row"><span class="field-label">School Head:</span><span class="field-value">${
        req.schoolHead || ""
      }</span></div>
      <div class="field-row"><span class="field-label">Contact No.:</span><span class="field-value">${
        req.schoolHeadContact || ""
      }</span></div>
      <div class="field-row"><span class="field-label">ICT Coordinator:</span><span class="field-value">${
        req.ictCoordinator || ""
      }</span></div>
      <div class="field-row"><span class="field-label">Contact No.:</span><span class="field-value">${
        req.ictCoordinatorContact || ""
      }</span></div>
      <div style="height:5px;"></div>
      <div class="field-row"><span class="italic-label" style="font-size:10px;">For DepED Email Creation/Reset/Suspension/Deletion:</span></div>
      <div class="field-row"><span class="field-label">Middle Name:</span><span class="field-value">${
        req.requester?.middleName || ""
      }</span></div>
      <div class="field-row"><span class="field-label">DepED Email:</span><span class="field-value">${
        req.depEdEmail || ""
      }</span></div>
      <div class="field-row"><span class="italic-label">Recovery Information:</span></div>
      <div class="field-row indent"><span class="field-label">Personal E-Mail:</span><span class="field-value">${
        req.recoveryPersonalEmail || ""
      }</span></div>
      <div class="field-row indent"><span class="field-label">Permanent Mobile No.:</span><span class="field-value">${
        req.recoveryMobileNumber || ""
      }</span></div>
    </div>
    <div class="right">
      <div style="font-weight:bold; font-style:italic; font-size:12px; margin-bottom:6px;">Short Description of your Request/Problems Encountered:</div>
      <div style="font-size:12px; line-height:1.7; min-height:195px; border-bottom:1px solid #000; padding:2px 0;">${
        req.problemDescription || ""
      }</div>
    </div>
  </div>

  <!-- ICT UNIT LINE -->
  <div class="ict-unit-line">---for the ICT Unit---</div>

  <!-- NATURE OF REQUEST -->
  <table class="nature-table">
    <tr>
      <th rowspan="4" style="width:25px;"><div class="nature-header-label">NATURE OF<br>REQUEST</div></th>
      <th colspan="2" style="font-size:11px;">Hardware</th>
      <th colspan="2" style="font-size:11px;">Software</th>
      <th colspan="1" style="font-size:11px;">Network</th>
      <th style="font-size:11px;">Others</th>
    </tr>
    <tr>
      <td style="font-size:10px;"><span style="font-size:9px;">1.</span> Printer<br><strong>${checkMark(
        "hardware",
        "Printer",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">4.</span> Internal<br><strong>${checkMark(
        "hardware",
        "Internal",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">7.</span> OS<br><strong>${checkMark(
        "software",
        "OS",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">10.</span> Installation<br><strong>${checkMark(
        "software",
        "Installation",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">13.</span> LAN Configuration<br><strong>${checkMark(
        "network",
        "LAN Configuration",
      )}</strong></td>
      <td style="font-size:10px;" rowspan="3"><span style="font-size:9px;">16.</span> DCP<br><strong>${checkMark(
        "other",
        "DCP",
      )}</strong></td>
    </tr>
    <tr>
      <td style="font-size:10px;"><span style="font-size:9px;">2.</span> System Unit<br><strong>${checkMark(
        "hardware",
        "System Unit",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">5.</span> Peripherals<br><strong>${checkMark(
        "hardware",
        "Peripherals",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">8.</span> Drivers<br><strong>${checkMark(
        "software",
        "Drivers",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">11.</span> Update<br><strong>${checkMark(
        "software",
        "Update",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">14.</span> Router/Cables<br><strong>${checkMark(
        "network",
        "Router/Cables",
      )}</strong></td>
    </tr>
    <tr>
      <td style="font-size:10px;"><span style="font-size:9px;">3.</span> Monitor/Display<br><strong>${checkMark(
        "hardware",
        "Monitor/Display",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">6.</span> Connectors/Plugs/Power<br><strong>${checkMark(
        "hardware",
        "Connectors/Plugs/Power",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">9.</span> Malware<br><strong>${checkMark(
        "software",
        "Malware",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">12.</span> Files/Data<br><strong>${checkMark(
        "software",
        "Files/Data",
      )}</strong></td>
      <td style="font-size:10px;"><span style="font-size:9px;">15.</span> Internet<br><strong>${checkMark(
        "network",
        "Internet",
      )}</strong></td>
    </tr>
  </table>

  <!-- FINDINGS -->
  <table class="findings-table">
    <tr>
      <th rowspan="${
        findingsRows.length + 1
      }" style="width:25px;"><div class="findings-vert">FINDINGS</div></th>
      <th style="width:35%;">ITEM DESCRIPTION<br><span style="font-weight:normal;">(Property Number)</span></th>
      <th style="width:30%;">SERIAL NO.<br><span style="font-weight:normal;">(Please specify)</span></th>
      <th style="width:35%;">PROBLEM/ISSUE<br><span style="font-weight:normal;">(Please specify)</span></th>
    </tr>
    ${findingsRows
      .map(
        (f) => `
    <tr>
      <td style="min-height:26px;">${f.itemDescription || ""}</td>
      <td>${f.serialNumber || ""}</td>
      <td>${f.problemIssue || ""}</td>
    </tr>`,
      )
      .join("")}
  </table>

  <!-- ACTION TAKEN -->
  <div class="action-section">
    <div class="action-label">ACTION<br>TAKEN</div>
    <div class="action-content">${actionText}</div>
  </div>

  <!-- STATUS/RECOMMENDATION -->
  <div class="status-section">
    <strong>STATUS/RECOMMENDATION:</strong><br>
    <span>( ${isStatusChecked("good")} ) GOOD/RETURNED</span>
    &nbsp;&nbsp;&nbsp;
    <span>( ${isStatusChecked(
      "authorized",
    )} ) CHECK FOR AUTHORIZED SERVICE CENTER</span>
    &nbsp;&nbsp;&nbsp;
    <span>( ${isStatusChecked("replacement")} ) FOR PART REPLACEMENT</span>
    &nbsp;&nbsp;&nbsp;
    <span>( ${isStatusChecked("unserviceable")} ) UNSERVICEABLE</span>
    ${
      req.findings?.[0]?.recommendationDescription
        ? `<div style="margin-top:5px; border-bottom:1px solid #000; min-height:15px; font-weight:bold;">${req.findings[0].recommendationDescription}</div>`
        : '<div style="margin-top:5px; border-bottom:1px solid #000; min-height:15px;"></div><div style="border-bottom:1px solid #000; min-height:15px;"></div>'
    }
  </div>

  <!-- BOTTOM SECTION -->
  <div class="bottom-section">
    <div class="col">
      <strong>CLIENT FEEDBACK (SDO Client):</strong>
      <div class="feedback-boxes">
        <div class="feedback-box"><div style="font-size:10px;"></div><div>Excellent<br>(4)</div></div>
        <div class="feedback-box"><div style="font-size:10px;"></div><div>Very<br>Satisfactory<br>(3)</div></div>
        <div class="feedback-box"><div style="font-size:10px;"></div><div>Good<br>(2)</div></div>
        <div class="feedback-box"><div style="font-size:10px;"></div><div>Unsatisfactory (1)</div></div>
      </div>
      <div class="field-row"><span class="field-label">Date Finished:</span><span class="field-value">${
        req.status === "completed" && req.createdAt
          ? formatDate(req.createdAt)
          : ""
      }</span></div>
      <div class="field-row"><span class="field-label">Time Finished:</span><span class="field-value"></span></div>
    </div>
    <div class="col" style="display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <strong>Client (SDO Proper)/<br>School Head (Schools):</strong>
      </div>
      <!--<div style="margin-top:auto; height:40px; border:1px solid #ccc; width:60px; margin-bottom:5px; margin-left:auto; margin-right:auto;"></div>-->
      <div style="margin-top:auto;">
        <div class="noted-name">${req.requester?.firstName.toUpperCase() || ""} ${req.requester?.lastName.toUpperCase() || ""}</div>
      </div>
      <div class="sig-line">Signature Over Printed Name</div>
    </div>
    <div class="col" style="display:flex; flex-direction:column; justify-content:space-between;">
      <div><strong>Noted/Processed by:</strong></div>
      <div style="margin-top:auto;">
        <div class="noted-name">${settings?.data?.infoOfficer?.firstName.toUpperCase() || ""} ${settings?.data?.infoOfficer?.lastName.toUpperCase() || ""}</div>
        <div class="noted-title">Information Technology Officer I</div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">
      <img src="/images/logos/Picture1.png" alt="DepEd" style="height:35px; width:auto;">
      <img src="/images/logos/light_logo_rep.png" alt="Bagong Pilipinas" style="height:35px; width:auto;">
      <img src="/logo.png" alt="Division Seal" style="height:35px; width:auto;">
    </div>
    <div class="footer-info">
      Address: Tayum Street, Barangay 8, Kabankalan City, Negros Occidental<br>
      Telephone Number: (034) 468-9149<br>
      E-mail: kabankalan.city001@deped.gov.ph
    </div>
    <div style="flex: 1; display: flex; justify-content: flex-end;">
      <table class="doc-code-table">
        <tr><td>Doc Code:</td><td><strong>FM-SDO-ICT-001</strong></td><td>Rev:</td><td>01</td></tr>
        <tr><td colspan="2">As of:</td><td colspan="2">Page 1</td></tr>
      </table>
    </div>
  </div>
</div>
</body>
</html>`;

      const printWindow = window.open("", "_blank");
      // if (printWindow) {
      //   printWindow.document.write(html);
      //   printWindow.document.close();
      //   printWindow.focus();
      //   setTimeout(() => printWindow.print(), 500);
      // }
      if (printWindow) {
        printWindow.document.write(`
    ${html}
    <script>
      function waitForImages() {
        const images = Array.from(document.images);
        if (!images.length) return Promise.resolve();
        return Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              const done = () => resolve();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            });
          }),
        );
      }

      function printWhenReady() {
        waitForImages().then(() => {
          setTimeout(() => {
            window.print();
          }, 150);
        });
      }

      window.onafterprint = function() {
        window.close();
      };

      if (document.readyState === "complete") {
        printWhenReady();
      } else {
        window.addEventListener("load", printWhenReady, { once: true });
      }
    <\/script>
  `);

        printWindow.document.close();
        printWindow.focus();
      }
    } catch (error) {
      console.error("Print error:", error);
      Swal.fire("Error", "Failed to generate print form.", "error");
    }
  };

  const getStatusChip = (status: string) => {
    const config: Record<
      string,
      {
        color: "warning" | "info" | "success" | "error" | "default";
        label: string;
      }
    > = {
      pending: { color: "warning", label: "Pending" },
      assigned: { color: "info", label: "Assigned" },
      in_progress: { color: "info", label: "In Progress" },
      completed: { color: "success", label: "Completed" },
      cancelled: { color: "error", label: "Cancelled" },
    };
    const c = config[status] || { color: "default" as const, label: status };
    return <Chip size="small" color={c.color} label={c.label} />;
  };

  const getPriorityChip = (priority: string) => {
    const config: Record<
      string,
      { color: "error" | "warning" | "info" | "success" }
    > = {
      critical: { color: "error" },
      high: { color: "warning" },
      medium: { color: "info" },
      low: { color: "success" },
    };
    const c = config[priority] || { color: "info" as const };
    return (
      <Chip
        size="small"
        variant="outlined"
        color={c.color}
        label={priority}
        sx={{ textTransform: "capitalize" }}
      />
    );
  };

  return (
    <PageContainer
      title="Request List"
      description="Manage all service requests"
    >
      <DashboardCard title="All Service Requests">
        {/* Filters */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <TextField
            size="small"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["service-requests"],
                })
              }
            >
              <IconRefresh
                size={20}
                className={isRefetching ? "animate-spin" : ""}
              />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Table */}
        {isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ overflowX: "auto" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Request #</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      Description
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      Requester
                    </TableCell>
                    {/* <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell> */}
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        display: { xs: "none", lg: "table-cell" },
                      }}
                    >
                      Assigned To
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography color="textSecondary">
                          No requests found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req: ServiceRequest) => (
                      <TableRow key={req.id} hover>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            fontFamily="monospace"
                          >
                            {req.requestNumber}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", md: "table-cell" } }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {req.problemDescription}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", sm: "table-cell" } }}
                        >
                          <Typography variant="body2">
                            {req.requester
                              ? `${req.requester.firstName} ${req.requester.lastName}`
                              : "—"}
                          </Typography>
                        </TableCell>
                        {/* <TableCell>{getPriorityChip(req.priority)}</TableCell> */}
                        <TableCell
                          sx={{ display: { xs: "none", lg: "table-cell" } }}
                        >
                          <Typography variant="body2">
                            {req.assignedTo
                              ? `${req.assignedTo.firstName} ${req.assignedTo.lastName}`
                              : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(req.status)}</TableCell>
                        <TableCell
                          sx={{ display: { xs: "none", sm: "table-cell" } }}
                        >
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            suppressHydrationWarning
                          >
                            {new Date(req.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                          >
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => setSelectedRequest(req)}
                              >
                                <IconEye size={18} />
                              </IconButton>
                            </Tooltip>
                            {req.status !== "completed" &&
                              req.status !== "cancelled" && (
                                <Tooltip title="Mark Complete">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    disabled={
                                      completeWithFindingsMutation.isPending &&
                                      findingsRequestId === req.id
                                    }
                                    onClick={() => handleOpenFindings(req.id)}
                                  >
                                    <IconCheck size={18} />
                                  </IconButton>
                                </Tooltip>
                              )}

                            <Tooltip title="Print TA Form">
                              <IconButton
                                size="small"
                                onClick={() => handlePrint(req.id)}
                              >
                                <IconPrinter size={18} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Assign Technician">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setAssignRequestId(req.id);
                                  setAssignDialogOpen(true);
                                }}
                              >
                                <IconUserCheck size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Request">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEdit(req)}
                              >
                                <IconPencil size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRequest(req.id)}
                                disabled={deleteRequestMutation.isPending}
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

            <TablePagination
              component="div"
              count={requestsData?.pagination?.total || 0}
              page={page - 1}
              onPageChange={(_, newPage) => setPage(newPage + 1)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              rowsPerPageOptions={[10, 15, 25, 50, 100]}
              sx={{ borderTop: "1px solid", borderColor: "divider", mt: 2 }}
            />
          </>
        )}
      </DashboardCard>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">
                  {selectedRequest.requestNumber}
                </Typography>
                {getStatusChip(selectedRequest.status)}
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Problem Description
                  </Typography>
                  <Typography>{selectedRequest.problemDescription}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Requester
                  </Typography>
                  <Typography>
                    {selectedRequest.requester
                      ? `${selectedRequest.requester.firstName} ${selectedRequest.requester.lastName} (${selectedRequest.requester.email})`
                      : "—"}
                  </Typography>
                </Box>
                {selectedRequest.categories &&
                  selectedRequest.categories.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        Categories
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedRequest.categories.map((c, i) => (
                          <Chip
                            key={i}
                            size="small"
                            label={`${c.categoryType}: ${c.subCategory}`}
                            sx={{ textTransform: "capitalize" }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                {selectedRequest.findings &&
                  selectedRequest.findings.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Findings
                      </Typography>
                      {selectedRequest.findings.map((f: any, i: number) => (
                        <Box
                          key={i}
                          sx={{
                            mt: 1,
                            p: 2,
                            bgcolor: "grey.50",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2">
                            <strong>Item:</strong> {f.itemDescription}
                          </Typography>
                          {f.serialNumber && (
                            <Typography variant="body2">
                              <strong>Serial:</strong> {f.serialNumber}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            <strong>Issue:</strong> {f.problemIssue}
                          </Typography>
                          {f.status && (
                            <Typography
                              variant="body2"
                              sx={{ textTransform: "capitalize" }}
                            >
                              <strong>Status:</strong> {f.status}
                            </Typography>
                          )}
                          {f.actionTaken && (
                            <Typography variant="body2">
                              <strong>Action:</strong> {f.actionTaken}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedRequest(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Assign Technician Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
      >
        <DialogTitle>Assign Technician</DialogTitle>
        <DialogContent sx={{ minWidth: 350 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Select Technician</InputLabel>
            <Select
              value={selectedTechnician}
              label="Select Technician"
              onChange={(e) => setSelectedTechnician(e.target.value)}
            >
              {technicians.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedTechnician || assignTechnicianMutation.isPending}
          >
            {assignTechnicianMutation.isPending ? "Assigning..." : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Findings Dialog - shown when completing a request */}
      <Dialog
        open={findingsDialogOpen}
        onClose={() => setFindingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700} component="div">
            Findings
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            Provide details about the item and findings
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Item Description (Property Number)"
              placeholder="e.g., Dell Laptop, HP Printer, etc."
              // required
              fullWidth
              value={findingsForm.itemDescription}
              onChange={(e) =>
                setFindingsForm((prev) => ({
                  ...prev,
                  itemDescription: e.target.value,
                }))
              }
            />
            <TextField
              label="Serial Number"
              placeholder="Enter serial number or property number"
              fullWidth
              value={findingsForm.serialNumber}
              onChange={(e) =>
                setFindingsForm((prev) => ({
                  ...prev,
                  serialNumber: e.target.value,
                }))
              }
            />
            <TextField
              label="Problem/Issue Encountered"
              placeholder="Describe the specific problem or issue found during inspection..."
              // required
              fullWidth
              multiline
              rows={3}
              value={findingsForm.problemIssue}
              onChange={(e) =>
                setFindingsForm((prev) => ({
                  ...prev,
                  problemIssue: e.target.value,
                }))
              }
            />
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}>
                Status/Recommendation
              </FormLabel>
              <RadioGroup
                value={findingsForm.status}
                onChange={(e) =>
                  setFindingsForm((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <FormControlLabel
                  value="good"
                  control={<Radio />}
                  label="Good/Returned"
                />
                <FormControlLabel
                  value="authorized"
                  control={<Radio />}
                  label="Check for Authorized Service Center"
                />
                <FormControlLabel
                  value="replacement"
                  control={<Radio />}
                  label="For Part Replacement"
                />
                <FormControlLabel
                  value="unserviceable"
                  control={<Radio />}
                  label="Unserviceable"
                />
              </RadioGroup>
            </FormControl>
            <TextField
              label="Description"
              placeholder="Provide more details about the status/recommendation..."
              fullWidth
              multiline
              rows={2}
              value={findingsForm.recommendationDescription}
              onChange={(e) =>
                setFindingsForm((prev) => ({
                  ...prev,
                  recommendationDescription: e.target.value,
                }))
              }
            />
            <TextField
              label="Action Taken"
              placeholder="Describe any actions taken or recommendations..."
              fullWidth
              multiline
              rows={3}
              value={findingsForm.actionTaken}
              onChange={(e) =>
                setFindingsForm((prev) => ({
                  ...prev,
                  actionTaken: e.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFindingsDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmitFindings}
            disabled={completeWithFindingsMutation.isPending}
          >
            {completeWithFindingsMutation.isPending
              ? "Completing..."
              : "Complete Request"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Service Request</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={4} sx={{ mt: 1 }}>
            {/* Request Details Section */}
            {/* <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Request Details
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Problem Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={editForm.problemDescription}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      problemDescription: e.target.value,
                    }))
                  }
                />
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editForm.priority}
                    label="Priority"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
                  Contact Information Overrides
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="School Head"
                    fullWidth
                    value={editForm.schoolHead}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        schoolHead: e.target.value,
                      }))
                    }
                  />
                  <TextField
                    label="School Head Contact"
                    fullWidth
                    value={editForm.schoolHeadContact}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        schoolHeadContact: e.target.value,
                      }))
                    }
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="ICT Coordinator"
                    fullWidth
                    value={editForm.ictCoordinator}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        ictCoordinator: e.target.value,
                      }))
                    }
                  />
                  <TextField
                    label="ICT Coordinator Contact"
                    fullWidth
                    value={editForm.ictCoordinatorContact}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        ictCoordinatorContact: e.target.value,
                      }))
                    }
                  />
                </Stack>
                <TextField
                  label="DepEd Email"
                  fullWidth
                  value={editForm.depEdEmail}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      depEdEmail: e.target.value,
                    }))
                  }
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Recovery Personal Email"
                    fullWidth
                    value={editForm.recoveryPersonalEmail}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        recoveryPersonalEmail: e.target.value,
                      }))
                    }
                  />
                  <TextField
                    label="Recovery Mobile Number"
                    fullWidth
                    value={editForm.recoveryMobileNumber}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        recoveryMobileNumber: e.target.value,
                      }))
                    }
                  />
                </Stack>
              </Stack>
            </Box> */}

            {/* Findings Section */}
            <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Findings
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Provide details about the item and findings
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Item Description (Property Number)"
                  placeholder="e.g., Dell Laptop, HP Printer, etc."
                  fullWidth
                  value={findingsForm.itemDescription}
                  onChange={(e) =>
                    setFindingsForm((prev) => ({
                      ...prev,
                      itemDescription: e.target.value,
                    }))
                  }
                />
                <TextField
                  label="Serial Number"
                  placeholder="Enter serial number or property number"
                  fullWidth
                  value={findingsForm.serialNumber}
                  onChange={(e) =>
                    setFindingsForm((prev) => ({
                      ...prev,
                      serialNumber: e.target.value,
                    }))
                  }
                />
                <TextField
                  label="Problem/Issue Encountered"
                  placeholder="Describe the specific problem or issue found during inspection..."
                  fullWidth
                  multiline
                  rows={3}
                  value={findingsForm.problemIssue}
                  onChange={(e) =>
                    setFindingsForm((prev) => ({
                      ...prev,
                      problemIssue: e.target.value,
                    }))
                  }
                />
                <FormControl>
                  <FormLabel
                    sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
                  >
                    Status/Recommendation
                  </FormLabel>
                  <RadioGroup
                    value={findingsForm.status}
                    onChange={(e) =>
                      setFindingsForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <FormControlLabel
                      value="good"
                      control={<Radio />}
                      label="Good/Returned"
                    />
                    <FormControlLabel
                      value="authorized"
                      control={<Radio />}
                      label="Check for Authorized Service Center"
                    />
                    <FormControlLabel
                      value="replacement"
                      control={<Radio />}
                      label="For Part Replacement"
                    />
                    <FormControlLabel
                      value="unserviceable"
                      control={<Radio />}
                      label="Unserviceable"
                    />
                  </RadioGroup>
                </FormControl>
                <TextField
                  label="Description"
                  placeholder="Provide more details about the status/recommendation..."
                  fullWidth
                  multiline
                  rows={2}
                  value={findingsForm.recommendationDescription}
                  onChange={(e) =>
                    setFindingsForm((prev) => ({
                      ...prev,
                      recommendationDescription: e.target.value,
                    }))
                  }
                />
                <TextField
                  label="Action Taken"
                  placeholder="Describe any actions taken or recommendations..."
                  fullWidth
                  multiline
                  rows={3}
                  value={findingsForm.actionTaken}
                  onChange={(e) =>
                    setFindingsForm((prev) => ({
                      ...prev,
                      actionTaken: e.target.value,
                    }))
                  }
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateDetails}
            disabled={updateRequestDetailsMutation.isPending}
          >
            {updateRequestDetailsMutation.isPending
              ? "Updating..."
              : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
