import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full gap-1 sm:gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 min-w-0">
          {/* Step Circle */}
          <div
            className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full font-bold text-xs sm:text-base transition-all flex-shrink-0 ${
              currentStep > step.id
                ? "bg-primary text-primary-foreground"
                : currentStep === step.id
                  ? "bg-primary text-primary-foreground ring-4 ring-accent"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {currentStep > step.id ? (
              <Check className="w-4 h-4 sm:w-6 sm:h-6" />
            ) : (
              step.id
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-1 sm:mx-2 transition-all ${
                currentStep > step.id ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
