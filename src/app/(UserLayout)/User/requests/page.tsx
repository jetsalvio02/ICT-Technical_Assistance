"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/app/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Search, Filter, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface ServiceRequest {
  id: string;
  requestNumber: string;
  problemDescription: string;
  status: string;
  priority: string;
  createdAt: string;
  categories?: { categoryType: string; subCategory: string }[];
}

export default function RequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // TanStack Query for fetching requests
  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["requests", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      const res = await fetch(
        `/api/service-requests?userId=${user.id}&limit=100`,
      );
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!user,
    refetchInterval: 1000, // Poll every 1 seconds for real-time updates
    refetchIntervalInBackground: true,
  });

  const filteredRequests = useMemo(() => {
    let filtered: ServiceRequest[] = requests;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r: ServiceRequest) =>
          r.requestNumber.toLowerCase().includes(q) ||
          r.problemDescription.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (r: ServiceRequest) => r.status === statusFilter,
      );
    }

    return filtered;
  }, [requests, searchQuery, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Request deleted successfully");
        // Invalidate the query to refetch updated data
        // Note: We don't have access to queryClient here, so we rely on refetchInterval
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("An error occurred while deleting the request");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/User/appointments?edit=${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-amber-100 text-amber-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) =>
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const statuses = ["all", "pending", "in_progress", "completed"];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            All Requests
          </h1>
          <p className="text-muted-foreground">
            Manage and track all your ICT technical assistance requests.
          </p>
        </div>
        <Button
          onClick={() => router.push("/User/appointments")}
          className="w-full sm:w-auto"
        >
          New Request
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by request number or description..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize text-xs"
            >
              {s === "all" ? "All" : formatStatus(s)}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {requests.length === 0
                  ? "No requests yet"
                  : "No matching requests"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {requests.length === 0
                  ? "Create your first ICT support request to get started."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
            {requests.length === 0 && (
              <Button onClick={() => router.push("/User/appointments")}>
                Create New Request
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="p-4 sm:p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {request.requestNumber}
                    </span>
                    {/* <Badge variant="outline" className="text-xs capitalize">
                      {request.priority}
                    </Badge> */}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {request.problemDescription}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-medium w-fit ${getStatusColor(request.status)}`}
                >
                  {formatStatus(request.status)}
                </span>
                {request.status === "pending" && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEdit(request.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(request.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
