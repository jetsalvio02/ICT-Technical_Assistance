import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface NatureOfRequestStepProps {
  data: any;
  onInputChange: (field: any, value: string) => void;
}

const HARDWARE_OPTIONS = [
  { id: "printer", label: "Printer" },
  { id: "systemUnit", label: "System Unit" },
  { id: "monitor", label: "Monitor/Display" },
];

const SOFTWARE_OPTIONS = [
  { id: "installation", label: "Installation" },
  { id: "drivers", label: "Drivers" },
  { id: "malware", label: "Malware" },
];

const NETWORK_OPTIONS = [
  { id: "installation", label: "Installation" },
  { id: "router", label: "Router/Cables" },
  { id: "internet", label: "Internet" },
];

const OTHER_OPTIONS = [
  { id: "dcp", label: "DCP" },
  { id: "other", label: "Other (please specify)" },
];

export function NatureOfRequestStep({
  data,
  onInputChange,
}: NatureOfRequestStepProps) {
  const handleCheckChange = (
    field: string,
    value: string,
    checked: boolean | "indeterminate",
  ) => {
    onInputChange(field, checked ? value : "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Nature of Request
        </h2>
        <p className="text-muted-foreground">
          Select the category that best describes your request
        </p>
      </div>

      {/* Hardware Section */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Hardware</FieldLegend>
          <div className="space-y-3 mt-4">
            {HARDWARE_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center gap-3">
                <Checkbox
                  id={`hardware-${option.id}`}
                  checked={data.hardwareType === option.id}
                  onCheckedChange={(checked) =>
                    handleCheckChange(
                      "hardwareType",
                      option.id,
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor={`hardware-${option.id}`}
                  className="font-normal cursor-pointer text-foreground"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FieldSet>
      </FieldGroup>

      {/* Software Section */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Software</FieldLegend>
          <div className="space-y-3 mt-4">
            {SOFTWARE_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center gap-3">
                <Checkbox
                  id={`software-${option.id}`}
                  checked={data.softwareType === option.id}
                  onCheckedChange={(checked) =>
                    handleCheckChange(
                      "softwareType",
                      option.id,
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor={`software-${option.id}`}
                  className="font-normal cursor-pointer text-foreground"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FieldSet>
      </FieldGroup>

      {/* Network Section */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Network</FieldLegend>
          <div className="space-y-3 mt-4">
            {NETWORK_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center gap-3">
                <Checkbox
                  id={`network-${option.id}`}
                  checked={data.networkType === option.id}
                  onCheckedChange={(checked) =>
                    handleCheckChange(
                      "networkType",
                      option.id,
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor={`network-${option.id}`}
                  className="font-normal cursor-pointer text-foreground"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </FieldSet>
      </FieldGroup>

      {/* Other Section */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Others</FieldLegend>
          <div className="space-y-3 mt-4">
            {OTHER_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center gap-3">
                <Checkbox
                  id={`other-${option.id}`}
                  checked={data.otherType === option.id}
                  onCheckedChange={(checked) =>
                    handleCheckChange(
                      "otherType",
                      option.id,
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor={`other-${option.id}`}
                  className="font-normal cursor-pointer text-foreground"
                >
                  {option.label}
                </Label>
              </div>
            ))}
            {data.otherType === "other" && (
              <div className="mt-2 pl-9">
                <Input
                  placeholder="Please specify other request..."
                  value={data.otherCustom || ""}
                  onChange={(e) => onInputChange("otherCustom", e.target.value)}
                  className="max-w-md"
                />
              </div>
            )}
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
