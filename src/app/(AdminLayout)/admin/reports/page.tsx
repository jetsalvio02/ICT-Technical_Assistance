"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Divider,
} from "@mui/material";
import {
  IconChartPie,
  IconChecks,
  IconClock,
  IconFileText,
} from "@tabler/icons-react";
import PageContainer from "@/app/(AdminLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(AdminLayout)/components/shared/DashboardCard";
import { useTheme } from "@mui/material/styles";
import dynamic from "next/dynamic";
import * as XLSX from "xlsx";
import { IconDownload } from "@tabler/icons-react";
import { Button } from "@mui/material";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const getChartColors = (
  theme: any,
  chartType: string,
  count: number,
  isSuccess: boolean = false,
) => {
  if (chartType === "bar") {
    return [isSuccess ? theme.palette.success.main : theme.palette.info.main];
  }

  const baseColors = [
    theme.palette.primary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.secondary.main,
  ];

  const colors = [...baseColors];
  for (let i = baseColors.length; i < Math.max(count, baseColors.length); i++) {
    const hue = (i * 137.508) % 360;
    colors.push(`hsl(${Math.round(hue)}, 70%, 50%)`);
  }
  return colors;
};

interface QuarterData {
  total: number;
  months: string;
  byStatus: Record<string, number>;
}

interface ReportsResponse {
  year: number;
  availableYears: number[];
  data: {
    Q1: QuarterData;
    Q2: QuarterData;
    Q3: QuarterData;
  };
  byDistrict: { name: string; count: number }[];
  byOffice: { name: string; count: number }[];
}

const ReportsPage = () => {
  const theme = useTheme();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedOffice, setSelectedOffice] = useState<string>("");
  const [data, setData] = useState<ReportsResponse["data"] | null>(null);
  const [byDistrict, setByDistrict] = useState<
    ReportsResponse["byDistrict"] | null
  >(null);
  const [byOffice, setByOffice] = useState<ReportsResponse["byOffice"] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [districtChartType, setDistrictChartType] = useState<"bar" | "pie" | "donut">("bar");
  const [officeChartType, setOfficeChartType] = useState<"bar" | "pie" | "donut">("bar");

  const fetchFilters = async () => {
    try {
      const distRes = await fetch("/api/districts");
      if (distRes.ok) setDistricts(await distRes.json());
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const fetchOffices = async (districtId: string) => {
    if (!districtId) {
      setOffices([]);
      return;
    }
    try {
      const offRes = await fetch(`/api/offices?districtId=${districtId}`);
      if (offRes.ok) setOffices(await offRes.json());
    } catch (error) {
      console.error("Error fetching offices:", error);
    }
  };

  const fetchReports = async (
    selectedYear: number,
    distId?: string,
    offId?: string,
  ) => {
    setIsLoading(true);
    try {
      let url = `/api/reports/quarters?year=${selectedYear}`;
      if (distId) url += `&districtId=${distId}`;
      if (offId) url += `&officeId=${offId}`;

      const res = await fetch(url);
      if (res.ok) {
        const json: ReportsResponse = await res.json();
        setData(json.data);
        setByDistrict(json.byDistrict);
        setByOffice(json.byOffice);
        if (json.availableYears) {
          setAvailableYears(json.availableYears);
        }
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async (quarter?: number) => {
    try {
      let url = `/api/reports/export?year=${year}`;
      if (quarter) url += `&quarter=${quarter}`;
      if (selectedDistrict) url += `&districtId=${selectedDistrict}`;
      if (selectedOffice) url += `&officeId=${selectedOffice}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch export data");

      const data = await res.json();
      if (!data || data.length === 0) {
        alert(
          quarter
            ? "No data available to export for this quarter."
            : "No data available to export for the selected filters.",
        );
        return;
      }

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Set column widths for better readability
      worksheet["!cols"] = [
        { wch: 15 }, // Quarter
        { wch: 20 }, // Request Number
        { wch: 15 }, // Date of Request
        { wch: 20 }, // Requester
        { wch: 25 }, // Office/School
        { wch: 25 }, // District/Cluster
        { wch: 40 }, // Problem Description
        { wch: 40 }, // Action Taken
        { wch: 15 }, // Completed At
        { wch: 22 }, // Created At
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        quarter ? `Quarter ${quarter}` : "Reports",
      );

      // Generate filename
      let filename = `ICT_Technical_Assistance_Report_${year}`;
      if (quarter) filename += `_Q${quarter}`;
      if (selectedDistrict) {
        const dist = districts.find((d) => d.id === selectedDistrict);
        if (dist) filename += `_${dist.name.replace(/\s+/g, "_")}`;
      }
      filename += ".xlsx";

      // Download file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export Excel report. Please try again.");
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchOffices(selectedDistrict);
    setSelectedOffice("");
  }, [selectedDistrict]);

  useEffect(() => {
    fetchReports(year, selectedDistrict, selectedOffice);
  }, [year, selectedDistrict, selectedOffice]);

  const renderQuarterCard = (
    title: string,
    quarterNum: number,
    qData?: QuarterData,
  ) => {
    if (isLoading || !qData) {
      return <Skeleton variant="rectangular" height={360} />;
    }

    const { total, months, byStatus } = qData;
    const completed = byStatus["completed"] || 0;
    const pending = (byStatus["pending"] || 0) + (byStatus["assigned"] || 0);
    const inProgress = byStatus["in_progress"] || 0;
    const cancelled = byStatus["cancelled"] || 0;

    const chartOptions: any = {
      chart: {
        type: "donut",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      },
      labels: ["Completed", "Pending/Assigned", "In Progress", "Cancelled"],
      colors: [
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.error.main,
      ],
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              value: {
                show: true,
                fontSize: "16px",
                fontWeight: "bold",
              },
              total: {
                show: true,
                showAlways: true,
                label: "Total Requests",
                fontSize: "12px",
                color: theme.palette.text.secondary,
              },
            },
          },
        },
      },
      stroke: { show: false },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: { theme: "dark" },
    };

    const other = total - completed - pending - inProgress - cancelled;
    const chartSeries = [completed, pending, inProgress, cancelled];
    if (other > 0) {
      chartOptions.labels.push("Other");
      chartOptions.colors.push(theme.palette.grey[400]);
      chartSeries.push(other);
    }

    return (
      <DashboardCard
        title={title}
        action={
          <Button
            size="small"
            startIcon={<IconDownload size={16} />}
            onClick={() => handleExportExcel(quarterNum)}
            disabled={!qData || qData.total === 0}
          >
            Excel
          </Button>
        }
      >
        <Stack spacing={2}>
          <Typography variant="body2" color="textSecondary" align="center">
            {months}
          </Typography>

          <Box mt={2}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
            >
              <IconFileText size={24} color={theme.palette.primary.main} />
              <Typography variant="h3" fontWeight="bold">
                {total}
              </Typography>
            </Stack>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              align="center"
            >
              Total Recorded Requests
            </Typography>
          </Box>

          <Divider />

          {total > 0 ? (
            <Box position="relative">
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="donut"
                height={220}
                width={"100%"}
              />
            </Box>
          ) : (
            <Box
              height={220}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography color="textSecondary">
                No data for this quarter
              </Typography>
            </Box>
          )}

          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconChecks size={20} color={theme.palette.success.main} />
              <Typography variant="body2">Completed: {completed}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconClock size={20} color={theme.palette.warning.main} />
              <Typography variant="body2">Pending: {pending}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </DashboardCard>
    );
  };

  // Chart config for District requests
  const districtCategories = byDistrict?.map((d) => d.name) || [];
  const districtData = byDistrict?.map((d) => d.count) || [];

  const districtChartOptions: any = {
    chart: {
      type: districtChartType,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#000",
      toolbar: { show: true },
      height: 350,
    },
    ...(districtChartType !== "bar" && {
      labels: districtCategories.length > 0 ? districtCategories : ["No data"],
    }),
    colors: getChartColors(theme, districtChartType, districtCategories.length),
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        if (districtChartType === "bar") return val;
        return opts.w.config.series[opts.seriesIndex];
      },
    },
    ...(districtChartType === "bar" && {
      xaxis: {
        categories: districtCategories,
        tickAmount: districtData.length
          ? Math.max(...districtData) < 5
            ? Math.max(...districtData)
            : 5
          : 1,
        labels: {
          formatter: function (val: string) {
            return Math.floor(Number(val)).toString();
          },
        },
      },
    }),
    tooltip: { theme: "dark" },
  };

  const districtChartSeries =
    districtChartType === "bar"
      ? [{ name: "Requests", data: districtData }]
      : districtData.length > 0
      ? districtData
      : [0];

  const districtAction = (
    <FormControl size="small" variant="outlined" sx={{ minWidth: 100 }}>
      <Select
        value={districtChartType}
        onChange={(e) =>
          setDistrictChartType(e.target.value as "bar" | "pie" | "donut")
        }
        sx={{
          bgcolor: "background.paper",
          fontSize: "0.875rem",
          "& .MuiSelect-select": { py: 0.5 },
        }}
      >
        <MenuItem value="bar">Bar</MenuItem>
        <MenuItem value="pie">Pie</MenuItem>
        <MenuItem value="donut">Donut</MenuItem>
      </Select>
    </FormControl>
  );

  // Chart config for Office requests
  const officeCategories = byOffice?.map((o) => o.name) || [];
  const officeData = byOffice?.map((o) => o.count) || [];

  const officeChartOptions: any = {
    chart: {
      type: officeChartType,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#000",
      toolbar: { show: true },
      height: 450,
    },
    ...(officeChartType !== "bar" && {
      labels: officeCategories.length > 0 ? officeCategories : ["No data"],
    }),
    colors: getChartColors(theme, officeChartType, officeCategories.length, true),
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        if (officeChartType === "bar") return val;
        return opts.w.config.series[opts.seriesIndex];
      },
    },
    ...(officeChartType === "bar" && {
      xaxis: {
        categories: officeCategories,
        tickAmount: officeData.length
          ? Math.max(...officeData) < 5
            ? Math.max(...officeData)
            : 5
          : 1,
        labels: {
          formatter: function (val: string) {
            return Math.floor(Number(val)).toString();
          },
        },
      },
    }),
    tooltip: { theme: "dark" },
  };

  const officeChartSeries =
    officeChartType === "bar"
      ? [{ name: "Requests", data: officeData }]
      : officeData.length > 0
      ? officeData
      : [0];

  const officeAction = (
    <FormControl size="small" variant="outlined" sx={{ minWidth: 100 }}>
      <Select
        value={officeChartType}
        onChange={(e) =>
          setOfficeChartType(e.target.value as "bar" | "pie" | "donut")
        }
        sx={{
          bgcolor: "background.paper",
          fontSize: "0.875rem",
          "& .MuiSelect-select": { py: 0.5 },
        }}
      >
        <MenuItem value="bar">Bar</MenuItem>
        <MenuItem value="pie">Pie</MenuItem>
        <MenuItem value="donut">Donut</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <PageContainer
      title="3-Quarter Reports"
      description="ICT Technical Assistance 3-Quarter Reports"
    >
      <Box
        mb={3}
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "start", md: "center" }}
        gap={2}
      >
        <Typography variant="h4" fontWeight={600}>
          (4-Month) Reports
        </Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>District/Cluster</InputLabel>
            <Select
              value={selectedDistrict}
              label="District/Cluster"
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <MenuItem value="">
                <em>All Districts</em>
              </MenuItem>
              {districts.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: 150 }}
            disabled={!selectedDistrict}
          >
            <InputLabel>Office/School</InputLabel>
            <Select
              value={selectedOffice}
              label="Office/School"
              onChange={(e) => setSelectedOffice(e.target.value)}
            >
              <MenuItem value="">
                <em>All Offices</em>
              </MenuItem>
              {offices.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.name} ({o.district?.name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              label="Year"
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {availableYears.length > 0 ? (
                availableYears.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value={new Date().getFullYear()}>
                  {new Date().getFullYear()}
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            startIcon={<IconDownload size={20} />}
            onClick={() => handleExportExcel()}
            sx={{ height: 40 }}
          >
            Export Excel
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          {renderQuarterCard("Quarter 1", 1, data?.Q1)}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {renderQuarterCard("Quarter 2", 2, data?.Q2)}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {renderQuarterCard("Quarter 3", 3, data?.Q3)}
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <DashboardCard title="Annual Requests by District/Cluster" action={districtAction}>
            {isLoading ? (
              <Skeleton variant="rectangular" height={350} />
            ) : (
              <Chart
                options={districtChartOptions}
                series={districtChartSeries}
                type={districtChartType}
                height={350}
                width="100%"
              />
            )}
          </DashboardCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <DashboardCard title="Annual Requests by Office/School" action={officeAction}>
            {isLoading ? (
              <Skeleton variant="rectangular" height={450} />
            ) : (
              <Chart
                options={officeChartOptions}
                series={officeChartSeries}
                type={officeChartType}
                height={450}
                width="100%"
              />
            )}
          </DashboardCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default ReportsPage;
