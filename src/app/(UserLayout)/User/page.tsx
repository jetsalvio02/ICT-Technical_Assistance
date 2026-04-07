"use client";

import { useAuth } from "@/app/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Plus,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Stats {
  totalRequests: number;
  byStatus: Record<string, number>;
}

interface ServiceRequest {
  id: string;
  requestNumber: string;
  problemDescription: string;
  status: string;
  createdAt: string;
  categories?: { categoryType: string; subCategory: string }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const [statsRes, requestsRes] = await Promise.all([
          fetch(`/api/stats?userId=${user!.id}`),
          fetch(`/api/service-requests?userId=${user!.id}&limit=5`),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (requestsRes.ok) {
          const data = await requestsRes.json();
          setRecentRequests(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    // Poll every 5 seconds for real-time updates
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [user]);

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

  const statCards = [
    {
      label: "Total Requests",
      value: stats?.totalRequests ?? 0,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      label: "Pending",
      value: (stats?.byStatus?.pending ?? 0) + (stats?.byStatus?.assigned ?? 0),
      icon: Clock,
      color: "text-amber-500",
    },
    {
      label: "In Progress",
      value: stats?.byStatus?.in_progress ?? 0,
      icon: AlertCircle,
      color: "text-orange-500",
    },
    {
      label: "Completed",
      value: stats?.byStatus?.completed ?? 0,
      icon: CheckCircle,
      color: "text-green-500",
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Here&apos;s your ICT support dashboard. Create new appointments or
          check your request history.
        </p>
      </div>

      {/* Quick Action Button */}
      <Button
        onClick={() => router.push("/User/appointments")}
        size="sm"
        className="gap-2 w-full sm:w-auto text-xs sm:text-base"
      >
        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
        <span>Create New Appointment</span>
      </Button>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">
                    {stat.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-muted rounded-lg flex-shrink-0">
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Requests Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Recent Requests
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/User/history")}
            className="w-full sm:w-auto"
          >
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : recentRequests.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-lg">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No requests yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first ICT support request to get started.
                </p>
              </div>
              <Button onClick={() => router.push("/User/appointments")}>
                Create New Request
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {recentRequests.map((request) => (
              <Card key={request.id} className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {request.requestNumber}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 truncate">
                      {request.problemDescription}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-fit ${getStatusColor(request.status)}`}
                  >
                    {formatStatus(request.status)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
