"use client";
import { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from "@mui/material";
import {
  IconFileText,
  IconClock,
  IconProgress,
  IconCircleCheck,
  IconUsers,
} from "@tabler/icons-react";
import { useTheme } from "@mui/material/styles";
import PageContainer from "@/app/(AdminLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(AdminLayout)/components/shared/DashboardCard";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Stats {
  totalRequests: number;
  totalUsers: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byDistrict?: { name: string; count: number }[];
  byOffice?: { name: string; count: number }[];
  monthly: { month: string; count: number }[];
}

interface RecentRequest {
  id: string;
  requestNumber: string;
  problemDescription: string;
  status: string;
  priority: string;
  createdAt: string;
  requester?: { firstName: string; lastName: string };
}

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, requestsRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/service-requests?limit=10"),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
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
  }, []);

  const statCards = [
    {
      title: "Total Requests",
      value: stats?.totalRequests ?? 0,
      icon: <IconFileText size={28} />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light,
    },
    {
      title: "Pending",
      value: (stats?.byStatus?.pending ?? 0) + (stats?.byStatus?.assigned ?? 0),
      icon: <IconClock size={28} />,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light,
    },
    // {
    //   title: "In Progress",
    //   value: stats?.byStatus?.in_progress ?? 0,
    //   icon: <IconProgress size={28} />,
    //   color: theme.palette.info.main,
    //   bgColor: theme.palette.info.light,
    // },
    {
      title: "Completed",
      value: stats?.byStatus?.completed ?? 0,
      icon: <IconCircleCheck size={28} />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light,
    },
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: <IconUsers size={28} />,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light,
    },
  ];

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
      { color: "error" | "warning" | "info" | "success"; label: string }
    > = {
      critical: { color: "error", label: "Critical" },
      high: { color: "warning", label: "High" },
      medium: { color: "info", label: "Medium" },
      low: { color: "success", label: "Low" },
    };
    const c = config[priority] || { color: "info" as const, label: priority };
    return (
      <Chip size="small" variant="outlined" color={c.color} label={c.label} />
    );
  };

  // Chart config for monthly requests
  const chartOptions: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#000",
      toolbar: { show: true },
      height: 300,
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories:
        stats?.monthly?.map((m) => {
          const [year, month] = m.month.split("-");
          return new Date(
            parseInt(year),
            parseInt(month) - 1,
          ).toLocaleDateString("en-US", { month: "short" });
        }) || [],
    },
    yaxis: { tickAmount: 4 },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
    },
    tooltip: { theme: "dark" },
  };

  const chartSeries = [
    {
      name: "Requests",
      data: stats?.monthly?.map((m) => m.count) || [],
    },
  ];

  // Chart config for District requests
  const districtChartOptions: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#000",
      toolbar: { show: true },
      height: 350,
    },
    colors: [theme.palette.info.main],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
    },
    dataLabels: { enabled: true, style: { colors: ["#000"] } },
    xaxis: {
      categories: stats?.byDistrict?.map((d) => d.name) || [],
    },
    tooltip: { theme: "dark" },
  };

  const districtChartSeries = [
    {
      name: "Requests",
      data: stats?.byDistrict?.map((d) => d.count) || [],
    },
  ];

  // Chart config for Office requests
  const officeChartOptions: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#000",
      toolbar: { show: true },
      height: 450,
    },
    colors: [theme.palette.success.main],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
    },
    dataLabels: { enabled: true, style: { colors: ["#000"] } },
    xaxis: {
      categories: stats?.byOffice?.map((o) => o.name) || [],
    },
    tooltip: { theme: "dark" },
  };

  const officeChartSeries = [
    {
      name: "Requests",
      data: stats?.byOffice?.map((o) => o.count) || [],
    },
  ];

  return (
    <PageContainer
      title="Admin Dashboard"
      description="ICT Technical Assistance Dashboard"
    >
      <Box>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((card, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
              <Card elevation={2}>
                <CardContent>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={80} />
                  ) : (
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle2" color="textSecondary">
                          {card.title}
                        </Typography>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: card.bgColor,
                            color: card.color,
                            display: "flex",
                          }}
                        >
                          {card.icon}
                        </Box>
                      </Stack>
                      <Typography variant="h4" fontWeight={700}>
                        {card.value}
                      </Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* District and Office Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <DashboardCard title="Requests by District/Cluster">
              {isLoading ? (
                <Skeleton variant="rectangular" height={350} />
              ) : (
                <Chart
                  options={districtChartOptions}
                  series={districtChartSeries}
                  type="bar"
                  height={350}
                  width="100%"
                />
              )}
            </DashboardCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <DashboardCard title="Requests by Office/School">
              {isLoading ? (
                <Skeleton variant="rectangular" height={450} />
              ) : (
                <Chart
                  options={officeChartOptions}
                  series={officeChartSeries}
                  type="bar"
                  height={450}
                  width="100%"
                />
              )}
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Monthly Chart */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12 }}>
            <DashboardCard title="Monthly Request Volume">
              {isLoading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="bar"
                  height={300}
                  width="100%"
                />
              )}
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Recent Requests Table */}
        <DashboardCard title="Recent Requests">
          {isLoading ? (
            <Skeleton variant="rectangular" height={300} />
          ) : (
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
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">
                          No requests yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentRequests.map((req) => (
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
                              maxWidth: 250,
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
                        <TableCell>{getStatusChip(req.status)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DashboardCard>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
