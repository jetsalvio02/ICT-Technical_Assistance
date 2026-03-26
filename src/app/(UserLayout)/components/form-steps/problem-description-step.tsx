import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";

interface ProblemDescriptionStepProps {
  data: any;
  onInputChange: (field: any, value: string) => void;
}

export function ProblemDescriptionStep({
  data,
  onInputChange,
}: ProblemDescriptionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Problem Description
        </h2>
        <p className="text-muted-foreground">
          Describe the issue you are encountering
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="problemDescription">
            Short Description of Problem/Request Encountered *
          </FieldLabel>
          <Textarea
            id="problemDescription"
            placeholder="Please provide a detailed description of the issue, including when it started and what you've observed..."
            value={data.problemDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onInputChange("problemDescription", e.target.value)
            }
            rows={6}
            className="bg-card border-border resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Include details such as error messages, affected devices, or any
            recent changes
          </p>
        </Field>
      </FieldGroup>

      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <p className="text-sm text-foreground font-medium">
          💡 Tips for better support:
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
          <li>Be specific about when the problem occurs</li>
          <li>Mention any error messages you see</li>
          <li>List the devices or software affected</li>
          <li>Describe what you've already tried</li>
        </ul>
      </div>
    </div>
  );
}
