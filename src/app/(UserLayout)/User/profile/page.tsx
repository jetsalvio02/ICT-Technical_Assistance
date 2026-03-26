"use client";

import { useAuth } from "@/app/lib/auth/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CalendarIcon,
  Clock,
  Edit2,
  Eye,
  EyeOff,
  Lock,
  Save,
  X,
} from "lucide-react";

interface Office {
  id: string;
  name: string;
  districtId: string;
  schoolHead: string | null;
  schoolHeadContact: string | null;
  ictCoordinator: string | null;
  ictCoordinatorContact: string | null;
}

interface District {
  id: string;
  name: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [office, setOffice] = useState<Office | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    officeName: "",
    districtName: "",
    schoolHead: "",
    schoolHeadContact: "",
    ictCoordinator: "",
    ictCoordinatorContact: "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [districtsRes, userRes] = await Promise.all([
          fetch("/api/districts"),
          fetch("/api/auth/me"),
        ]);

        const districtsData = await districtsRes.json();
        setDistricts(districtsData);

        if (userRes.ok) {
          const userData = await userRes.json();
          setFormData((prev) => ({
            ...prev,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
          }));

          if (userData.officeId) {
            const officeRes = await fetch(`/api/offices/${userData.officeId}`);
            if (officeRes.ok) {
              const officeData = await officeRes.json();
              setOffice(officeData);
              setFormData((prev) => ({
                ...prev,
                officeName: officeData.name || "",
                districtName: officeData.district?.name || "",
                schoolHead: officeData.schoolHead || "",
                schoolHeadContact: officeData.schoolHeadContact || "",
                ictCoordinator: officeData.ictCoordinator || "",
                ictCoordinatorContact: officeData.ictCoordinatorContact || "",
              }));
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    // Validation
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: passwordData.newPassword,
          isSelfUpdate: true,
        }),
      });

      if (res.ok) {
        toast.success("Password updated successfully");
        setPasswordData({
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("An error occurred while changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Resolve District ID from Name
      let districtId = districts.find(
        (d) => d.name.toLowerCase() === formData.districtName.toLowerCase(),
      )?.id;

      if (!districtId && formData.districtName) {
        const newDistrictRes = await fetch("/api/districts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.districtName }),
        });
        if (newDistrictRes.ok) {
          const newDistrict = await newDistrictRes.json();
          districtId = newDistrict.id;
        } else {
          toast.error("Failed to create new district");
          setIsSaving(false);
          return;
        }
      }

      // Update User Info
      const userUpdatePromise = fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      // Update Office Info
      let officeUpdatePromise: Promise<Response | null> = Promise.resolve(null);
      if (user.officeId) {
        officeUpdatePromise = fetch(`/api/offices/${user.officeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.officeName,
            districtId: districtId,
            schoolHead: formData.schoolHead,
            schoolHeadContact: formData.schoolHeadContact,
            ictCoordinator: formData.ictCoordinator,
            ictCoordinatorContact: formData.ictCoordinatorContact,
          }),
        });
      }

      const [userRes, officeRes] = await Promise.all([
        userUpdatePromise,
        officeUpdatePromise,
      ]);

      if (userRes.ok && (!officeRes || officeRes.ok)) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        // Refresh the page or update local state if needed
        window.location.reload();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString();
  const currentTime = "--:-- --"; // Placeholder as requested for non-editable fields

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account and office information.
          </p>
        </div>
      </div>

      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* First Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">First Name *</Label>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              // className={!isEditing ? "bg-muted" : ""}
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Last Name *</Label>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              // className={!isEditing ? "bg-muted" : ""}
            />
          </div>

          {/* Office/School */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-sm font-semibold">Office/School *</Label>
            <Input
              name="officeName"
              value={formData.officeName}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter office or school name"
              // className={!isEditing ? "bg-muted" : ""}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label className="text-sm font-semibold">District/Cluster *</Label>
            <Input
              name="districtName"
              list="districts-list"
              value={formData.districtName}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter district or cluster"
              // className={!isEditing ? "bg-muted" : ""}
            />
            <datalist id="districts-list">
              {districts.map((d) => (
                <option key={d.id} value={d.name} />
              ))}
            </datalist>
          </div>

          {/* School Head */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">School Head *</Label>
            <Input
              name="schoolHead"
              value={formData.schoolHead}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Name"
              // className={!isEditing ? "bg-muted" : ""}
            />
          </div>

          {/* School Head Contact */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              School Head Contact *
            </Label>
            <Input
              name="schoolHeadContact"
              value={formData.schoolHeadContact}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Phone number"
              // className={!isEditing ? "bg-muted" : ""}
            />
          </div>

          {/* ICT Coordinator */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">ICT Coordinator *</Label>
            <Input
              name="ictCoordinator"
              value={formData.ictCoordinator}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Name"
              // className={!isEditing ? "bg-muted" : ""}
            />
          </div>

          {/* ICT Coordinator Contact */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              ICT Coordinator Contact *
            </Label>
            <Input
              name="ictCoordinatorContact"
              value={formData.ictCoordinatorContact}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Phone number"
              // className={!isEditing ? "bg-muted" : ""}
            />
          </div>
        </div>

        <div className="flex justify-end">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="gap-2 flex"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="ghost"
                className="gap-2"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="gap-2"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              New Password
            </Label>
            <Input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              placeholder="••••••••"
              className="bg-background h-11"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              Confirm New Password
            </Label>
            <Input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
              placeholder="••••••••"
              className="bg-background h-11"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="w-fit flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            {showPassword ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Passwords
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Passwords
              </>
            )}
          </Button>
        </div>

        <div className="mt-5 flex justify-end pt-6 border-t border-border">
          <Button
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
            className="min-w-[160px] h-11 shadow-sm hover:shadow-md transition-all"
          >
            {isChangingPassword ? "Updating Path..." : "Update Password"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
