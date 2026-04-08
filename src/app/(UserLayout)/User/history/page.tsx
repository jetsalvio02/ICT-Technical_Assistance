"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth/auth-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ServiceRequest {
  id: string;
  requestNumber: string;
  problemDescription: string;
  status: string;
  priority: string;
  createdAt: string;
  dateOfRequest: string;
  timeOfRequest: string | null;
  categories?: { categoryType: string; subCategory: string }[];
}

export default function HistoryPage() {
  const { user } = useAuth();

  // TanStack Query for fetching history
  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useQuery<ServiceRequest[]>({
    queryKey: ["history", user?.id],
    queryFn: async (): Promise<ServiceRequest[]> => {
      if (!user) throw new Error("User not authenticated");
      const res = await fetch(
        `/api/service-requests?userId=${user.id}&limit=50`,
      );
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!user,
    refetchInterval: 1000, // Poll every 1 seconds for real-time updates
    refetchIntervalInBackground: true,
  });

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

  const getCategoryLabel = (categories?: { categoryType: string }[]) => {
    if (!categories || categories.length === 0) return "General";
    return categories
      .map(
        (c) => c.categoryType.charAt(0).toUpperCase() + c.categoryType.slice(1),
      )
      .join(", ");
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Appointment History
        </h1>
        <p className="text-muted-foreground">
          View all your ICT support requests and their status.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No appointment history
              </h3>
              <p className="text-muted-foreground mb-4">
                Your submitted requests will appear here.
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = "/User/appointments")}
            >
              Create New Request
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {request.requestNumber}
                    </span>
                    {/* <Badge variant="outline" className="text-xs">
                      {request.priority}
                    </Badge> */}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {request.problemDescription}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>
                      {new Date(request.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    {request.timeOfRequest && (
                      <>
                        <span>{request.timeOfRequest}</span>
                        <span>•</span>
                      </>
                    )}
                    <Badge variant="outline">
                      {getCategoryLabel(request.categories)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}
                  >
                    {formatStatus(request.status)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
