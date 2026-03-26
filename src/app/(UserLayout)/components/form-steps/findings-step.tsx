import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";

interface FindingsStepProps {
  data: any;
  onInputChange: (field: any, value: string) => void;
}

const STATUS_OPTIONS = [
  { value: "good", label: "Good/Returned" },
  { value: "authorized", label: "Check for Authorized Service Center" },
  { value: "replacement", label: "For Part Replacement" },
  { value: "unserviceable", label: "Unserviceable" },
];

export function FindingsStep({ data, onInputChange }: FindingsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Findings
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Provide details about the item and findings
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="itemDescription">
            Item Description (Property Number) *
          </FieldLabel>
          <Input
            id="itemDescription"
            placeholder="e.g., Dell Laptop, HP Printer, etc."
            value={data.itemDescription}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange("itemDescription", e.target.value)
            }
            className="bg-card border-border"
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="serialNumber">Serial Number</FieldLabel>
          <Input
            id="serialNumber"
            placeholder="Enter serial number or property number"
            value={data.serialNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange("serialNumber", e.target.value)
            }
            className="bg-card border-border"
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="problemIssue">
            Problem/Issue Encountered *
          </FieldLabel>
          <Textarea
            id="problemIssue"
            placeholder="Describe the specific problem or issue found during inspection..."
            value={data.problemIssue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onInputChange("problemIssue", e.target.value)
            }
            rows={4}
            className="bg-card border-border resize-none"
          />
        </Field>
      </FieldGroup>

      {/* Status/Recommendation Section */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Status/Recommendation *</FieldLegend>
          <RadioGroup
            value={data.status}
            onValueChange={(value: string) => onInputChange("status", value)}
          >
            <div className="space-y-3 mt-4">
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-3">
                  <RadioGroupItem
                    value={option.value}
                    id={`status-${option.value}`}
                  />
                  <Label
                    htmlFor={`status-${option.value}`}
                    className="font-normal cursor-pointer text-foreground"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="actionTaken">Action Taken</FieldLabel>
          <Textarea
            id="actionTaken"
            placeholder="Describe any actions taken or recommendations..."
            value={data.actionTaken}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onInputChange("actionTaken", e.target.value)
            }
            rows={3}
            className="bg-card border-border resize-none"
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
