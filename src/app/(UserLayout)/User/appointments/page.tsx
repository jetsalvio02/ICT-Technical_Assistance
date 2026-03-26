"use client";

import { useState } from "react";
import { useAuth } from "@/app/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { ClientInfoStep } from "@/components/form-steps/client-info-step";
import { ProblemDescriptionStep } from "@/components/form-steps/problem-description-step";
import { NatureOfRequestStep } from "@/components/form-steps/nature-of-request-step";
import { FindingsStep } from "@/components/form-steps/findings-step";
import { ReviewStep } from "@/components/form-steps/review-step";
import { StepIndicator } from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface FormData {
  // Client Information
  firstName: string;
  lastName: string;
  office: string;
  dateOfRequest: string;
  timeOfRequest: string;
  district: string;
  schoolHead: string;
  schoolHeadContact: string;
  ictCoordinator: string;
  ictCoordinatorContact: string;
  depEdEmail?: string;
  middleName?: string;
  recoveryPersonalEmail?: string;
  recoveryMobileNumber?: string;

  // Problem Description
  problemDescription: string;

  // Nature of Request
  hardwareType?: string;
  softwareType?: string;
  networkType?: string;
  otherType?: string;
  otherCustom?: string;

  // Findings
  itemDescription: string;
  serialNumber: string;
  problemIssue: string;

  // Status
  status: "good" | "authorized" | "replacement" | "unserviceable" | "";
  actionTaken: string;
}

const STEPS = [
  { id: 1, title: "Client Information", description: "Your details" },
  { id: 2, title: "Problem Description", description: "What is the issue?" },
  { id: 3, title: "Nature of Request", description: "Request category" },
  // { id: 4, title: "Findings", description: "Item details" },
  { id: 4, title: "Review", description: "Confirm submission" },
];

export default function AppointmentForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    office: "",
    dateOfRequest: new Date().toISOString().split("T")[0],
    timeOfRequest: "",
    district: "",
    schoolHead: "",
    schoolHeadContact: "",
    ictCoordinator: "",
    ictCoordinatorContact: "",
    problemDescription: "",
    itemDescription: "",
    serialNumber: "",
    problemIssue: "",
    status: "",
    actionTaken: "",
    otherCustom: "",
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build categories array from selected types
      const categories: { categoryType: string; subCategory: string }[] = [];
      if (formData.hardwareType)
        categories.push({
          categoryType: "hardware",
          subCategory: formData.hardwareType,
        });
      if (formData.softwareType)
        categories.push({
          categoryType: "software",
          subCategory: formData.softwareType,
        });
      if (formData.networkType)
        categories.push({
          categoryType: "network",
          subCategory: formData.networkType,
        });
      if (formData.otherType) {
        categories.push({
          categoryType: "other",
          subCategory:
            formData.otherType === "other"
              ? formData.otherCustom || "other"
              : formData.otherType,
        });
      }

      const payload = {
        requesterId: user.id,
        officeId: formData.office || null,
        districtId: formData.district || null,
        schoolHead: formData.schoolHead,
        schoolHeadContact: formData.schoolHeadContact,
        ictCoordinator: formData.ictCoordinator,
        ictCoordinatorContact: formData.ictCoordinatorContact,
        depEdEmail: formData.depEdEmail,
        recoveryPersonalEmail: formData.recoveryPersonalEmail,
        recoveryMobileNumber: formData.recoveryMobileNumber,
        problemDescription: formData.problemDescription,
        dateOfRequest: formData.dateOfRequest,
        timeOfRequest: formData.timeOfRequest,
        categories,
        findingsData:
          formData.itemDescription || formData.problemIssue
            ? {
                itemDescription: formData.itemDescription,
                serialNumber: formData.serialNumber,
                problemIssue: formData.problemIssue,
                status: formData.status || null,
                actionTaken: formData.actionTaken,
              }
            : undefined,
      };

      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit request");
      }

      router.push("/User/history");
    } catch (error: any) {
      setSubmitError(error.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ClientInfoStep data={formData} onInputChange={handleInputChange} />
        );
      case 2:
        return (
          <ProblemDescriptionStep
            data={formData}
            onInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <NatureOfRequestStep
            data={formData}
            onInputChange={handleInputChange}
          />
        );
      // case 4:
      //   return (
      //     <FindingsStep data={formData} onInputChange={handleInputChange} />
      //   );
      case 4:
        return <ReviewStep data={formData} />;
      default:
        return null;
    }
  };

  return (
    <main className="p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Create New Appointment
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Fill in the details below to schedule your ICT technical assistance
            appointment.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Form Card */}
        <Card className="mt-6 sm:mt-8 shadow-lg border-2 border-border">
          <div className="p-4 sm:p-6 md:p-8">{renderStep()}</div>

          {/* Error Message */}
          {submitError && (
            <div className="mx-4 sm:mx-6 md:mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t border-border flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between bg-muted/20">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="w-full sm:w-auto sm:min-w-32"
            >
              Previous
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-32 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full sm:w-auto sm:min-w-32 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next
              </Button>
            )}
          </div>
        </Card>

        {/* Progress Text */}
        <p className="text-center text-muted-foreground mt-4 sm:mt-6 text-xs sm:text-sm">
          Step {currentStep} of {STEPS.length}
        </p>
      </div>
    </main>
  );
}
