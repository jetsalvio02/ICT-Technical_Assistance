import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface ReviewStepProps {
  data: any;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const { data: districts } = useQuery<any[]>({
    queryKey: ["districts"],
    queryFn: async () => {
      const res = await fetch("/api/districts");
      if (!res.ok) throw new Error("Failed to fetch districts");
      return res.json();
    },
  });

  const { data: offices } = useQuery<any[]>({
    queryKey: ["offices"],
    queryFn: async () => {
      const res = await fetch("/api/offices");
      if (!res.ok) throw new Error("Failed to fetch offices");
      return res.json();
    },
  });

  const districtName =
    districts?.find((d) => d.id === data.district)?.name ||
    data.district ||
    "Not provided";
  const officeName =
    offices?.find((o) => o.id === data.office)?.name ||
    data.office ||
    "Not provided";
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review Your Information
        </h2>
        <p className="text-muted-foreground">
          Please review all details before submitting
        </p>
      </div>

      {/* Client Information Section */}
      <Card className="bg-muted/30 border border-border">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </span>
            Client Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">Name</p>
              <p className="text-foreground">
                {data.firstName} {data.lastName}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Office/School</p>
              <p className="text-foreground">{officeName}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">
                Date of Request
              </p>
              <p className="text-foreground">
                {formatDate(data.dateOfRequest)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Time</p>
              <p className="text-foreground">
                {data.timeOfRequest || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">
                District/Cluster
              </p>
              <p className="text-foreground">{districtName}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">School Head</p>
              <p className="text-foreground">
                {data.schoolHead || "Not provided"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground font-medium">
                ICT Coordinator
              </p>
              <p className="text-foreground">
                {data.ictCoordinator || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Problem Description Section */}
      <Card className="bg-muted/30 border border-border">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              2
            </span>
            Problem Description
          </h3>
          <p className="text-foreground whitespace-pre-wrap text-sm">
            {data.problemDescription || "Not provided"}
          </p>
        </div>
      </Card>

      {/* Nature of Request Section */}
      <Card className="bg-muted/30 border border-border">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              3
            </span>
            Nature of Request
          </h3>
          <div className="flex gap-2 flex-wrap">
            {data.hardwareType && (
              <Badge
                variant="secondary"
                className="bg-accent/20 text-foreground border border-accent"
              >
                Hardware: {data.hardwareType}
              </Badge>
            )}
            {data.softwareType && (
              <Badge
                variant="secondary"
                className="bg-accent/20 text-foreground border border-accent"
              >
                Software: {data.softwareType}
              </Badge>
            )}
            {data.networkType && (
              <Badge
                variant="secondary"
                className="bg-accent/20 text-foreground border border-accent"
              >
                Network: {data.networkType}
              </Badge>
            )}
            {data.otherType && (
              <Badge
                variant="secondary"
                className="bg-accent/20 text-foreground border border-accent"
              >
                Other:{" "}
                {data.otherType === "other"
                  ? data.otherCustom || "Other"
                  : data.otherType}
              </Badge>
            )}
            {!data.hardwareType &&
              !data.softwareType &&
              !data.networkType &&
              !data.otherType && (
                <p className="text-muted-foreground text-sm">Not selected</p>
              )}
          </div>
        </div>
      </Card>

      {/* Findings Section */}
      {/* <Card className="bg-muted/30 border border-border">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              4
            </span>
            Findings
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium">
                Item Description
              </p>
              <p className="text-foreground">
                {data.itemDescription || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Serial Number</p>
              <p className="text-foreground">
                {data.serialNumber || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Problem/Issue</p>
              <p className="text-foreground whitespace-pre-wrap">
                {data.problemIssue || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">
                Status/Recommendation
              </p>
              <p className="text-foreground capitalize">
                {data.status || "Not selected"}
              </p>
            </div>
            {data.actionTaken && (
              <div>
                <p className="text-muted-foreground font-medium">
                  Action Taken
                </p>
                <p className="text-foreground whitespace-pre-wrap">
                  {data.actionTaken}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card> */}

      {/* Confirmation Message */}
      <div className="bg-accent/10 border-2 border-accent rounded-lg p-4">
        <p className="text-sm text-foreground font-medium">
          ✓ All information is complete and ready to submit
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Click Submit to send your ICT Technical Assistance request
        </p>
      </div>
    </div>
  );
}
