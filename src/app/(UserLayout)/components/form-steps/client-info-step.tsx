import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientInfoStepProps {
  data: any;
  onInputChange: (field: any, value: string) => void;
}

export function ClientInfoStep({ data, onInputChange }: ClientInfoStepProps) {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [openDistrictDialog, setOpenDistrictDialog] = useState(false);
  const [openOfficeDialog, setOpenOfficeDialog] = useState(false);

  const [openDistrictPopover, setOpenDistrictPopover] = useState(false);
  const [openOfficePopover, setOpenOfficePopover] = useState(false);

  // Form states for new entries
  const [newDistrict, setNewDistrict] = useState({
    name: "",
    type: "District",
    code: "",
    description: "",
  });
  const [newOffice, setNewOffice] = useState({
    name: "",
    type: "Office",
    districtId: "",
    schoolHead: "",
    schoolHeadContact: "",
    ictCoordinator: "",
    ictCoordinatorContact: "",
    address: "",
  });

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

  const addDistrictMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add district");
      return res.json();
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
      onInputChange("district", newItem.id);
      setOpenDistrictDialog(false);
      setOpenDistrictPopover(false);
      setNewDistrict({ name: "", type: "District", code: "", description: "" });
      toast.success("New District/Cluster added successfully");
    },
  });

  const addOfficeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/offices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add office");
      return res.json();
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      onInputChange("district", newItem.districtId);
      onInputChange("office", newItem.id);

      // Auto-save to profile
      if (user && user.officeId !== newItem.id) {
        updateProfileMutation.mutate({
          officeId: newItem.id,
          districtId: newItem.districtId,
        });
      }

      // Auto-fill contact info
      onInputChange("schoolHead", newItem.schoolHead || "");
      onInputChange("schoolHeadContact", newItem.schoolHeadContact || "");
      onInputChange("ictCoordinator", newItem.ictCoordinator || "");
      onInputChange(
        "ictCoordinatorContact",
        newItem.ictCoordinatorContact || ""
      );

      setOpenOfficeDialog(false);
      setOpenOfficePopover(false);
      setNewOffice({
        name: "",
        type: "Office",
        districtId: "",
        schoolHead: "",
        schoolHeadContact: "",
        ictCoordinator: "",
        ictCoordinatorContact: "",
        address: "",
      });
      toast.success("New Office/School added successfully");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: {
      officeId?: string | null;
      districtId?: string;
    }) => {
      if (!user) return;
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: (_data, payload) => {
      // Update the in-memory user so auto-fill works on next appointment
      updateUser(payload);
    },
  });

  // Filter offices based on selected district if needed, or just show all
  const filteredOffices = (offices || []).filter(
    (o) => !data.district || o.districtId === data.district
  );

  const selectedDistrictName = districts?.find(
    (d) => d.id === data.district
  )?.name;
  const selectedOfficeName = offices?.find((o) => o.id === data.office)?.name;

  // Auto-fill from profile when component mounts
  useEffect(() => {
    if (
      !data.district &&
      !data.office &&
      districts &&
      offices &&
      districts.length > 0 &&
      offices.length > 0
    ) {
      if (user?.officeId) {
        const userOffice = offices.find((o) => o.id === user.officeId);
        if (userOffice) {
          onInputChange("district", userOffice.districtId);
          onInputChange("office", userOffice.id);

          // Auto-fill contact info
          onInputChange("schoolHead", userOffice.schoolHead || "");
          onInputChange(
            "schoolHeadContact",
            userOffice.schoolHeadContact || ""
          );
          onInputChange("ictCoordinator", userOffice.ictCoordinator || "");
          onInputChange(
            "ictCoordinatorContact",
            userOffice.ictCoordinatorContact || ""
          );
        }
      } else if (user?.districtId) {
        onInputChange("district", user.districtId);
      }
    }
  }, [user, districts, offices, data.district, data.office, onInputChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Client Information
        </h2>
        <p className="text-muted-foreground">
          Please provide your contact details
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
            <Input
              id="firstName"
              placeholder="John"
              value={data.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange("firstName", e.target.value)
              }
              className="bg-card border-border"
            />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
            <Input
              id="lastName"
              placeholder="Doe"
              value={data.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange("lastName", e.target.value)
              }
              className="bg-card border-border"
            />
          </Field>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="district">District/Cluster *</FieldLabel>
            <Popover
              open={openDistrictPopover}
              onOpenChange={setOpenDistrictPopover}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDistrictPopover}
                  className="w-full justify-between bg-card border-border font-normal"
                >
                  {data.district
                    ? selectedDistrictName
                    : "Select district or cluster..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Search district or cluster..." />
                  <CommandList>
                    <CommandEmpty>No district found.</CommandEmpty>
                    <CommandGroup>
                      {(districts || []).map((d) => (
                        <CommandItem
                          key={d.id}
                          value={d.name}
                          onSelect={() => {
                            const isDistrictChanged = data.district !== d.id;
                            onInputChange("district", d.id);

                            if (isDistrictChanged) {
                              onInputChange("office", "");
                              onInputChange("schoolHead", "");
                              onInputChange("schoolHeadContact", "");
                              onInputChange("ictCoordinator", "");
                              onInputChange("ictCoordinatorContact", "");
                            }

                            if (
                              user &&
                              (user.districtId !== d.id ||
                                (isDistrictChanged && user.officeId))
                            ) {
                              updateProfileMutation.mutate({
                                districtId: d.id,
                                officeId: isDistrictChanged
                                  ? null
                                  : user.officeId || undefined,
                              });
                            }

                            setOpenDistrictPopover(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              data.district === d.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {d.name}
                          {/* ({d.type}) */}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    {/* <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setOpenDistrictDialog(true);
                          setOpenDistrictPopover(false);
                        }}
                        className="text-primary font-medium"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New District/Cluster
                      </CommandItem>
                    </CommandGroup> */}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="office">Office/School *</FieldLabel>
            <Popover
              open={openOfficePopover}
              onOpenChange={setOpenOfficePopover}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openOfficePopover}
                  className="w-full justify-between bg-card border-border font-normal"
                  disabled={!data.district}
                >
                  {data.office
                    ? selectedOfficeName
                    : data.district
                    ? "Select office or school..."
                    : "Select district first"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Search office or school..." />
                  <CommandList>
                    <CommandEmpty>No office found.</CommandEmpty>
                    <CommandGroup>
                      {filteredOffices.map((o) => (
                        <CommandItem
                          key={o.id}
                          value={o.name}
                          onSelect={() => {
                            onInputChange("office", o.id);

                            // Auto-save to profile if first time or changed
                            if (
                              user &&
                              (user.officeId !== o.id ||
                                user.districtId !== o.districtId)
                            ) {
                              updateProfileMutation.mutate({
                                officeId: o.id,
                                districtId: o.districtId,
                              });
                            }

                            const selectedOffice = offices?.find(
                              (of) => of.id === o.id
                            );
                            if (selectedOffice) {
                              onInputChange(
                                "schoolHead",
                                selectedOffice.schoolHead || ""
                              );
                              onInputChange(
                                "schoolHeadContact",
                                selectedOffice.schoolHeadContact || ""
                              );
                              onInputChange(
                                "ictCoordinator",
                                selectedOffice.ictCoordinator || ""
                              );
                              onInputChange(
                                "ictCoordinatorContact",
                                selectedOffice.ictCoordinatorContact || ""
                              );
                            }
                            setOpenOfficePopover(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              data.office === o.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {o.name} ({o.type})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    {/* <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setNewOffice((prev) => ({
                            ...prev,
                            districtId: data.district,
                          }));
                          setOpenOfficeDialog(true);
                          setOpenOfficePopover(false);
                        }}
                        className="text-primary font-medium"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Office/School
                      </CommandItem>
                    </CommandGroup> */}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Field>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="dateOfRequest">Date of Request *</FieldLabel>
            <Input
              id="dateOfRequest"
              type="date"
              value={data.dateOfRequest}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange("dateOfRequest", e.target.value)
              }
              className="bg-card border-border"
            />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="timeOfRequest">Time of Request *</FieldLabel>
            <Input
              id="timeOfRequest"
              type="time"
              value={data.timeOfRequest}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange("timeOfRequest", e.target.value)
              }
              className="bg-card border-border"
            />
          </Field>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="schoolHead">School Head *</FieldLabel>
            <Input
              id="schoolHead"
              placeholder="Name"
              value={data.schoolHead}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange("schoolHead", e.target.value)
              }
              className="bg-card border-border"
            />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="schoolHeadContact">
              School Head Contact *
            </FieldLabel>
            <Input
              id="schoolHeadContact"
              placeholder="Phone number"
              value={data.schoolHeadContact}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange("schoolHeadContact", e.target.value)
              }
              className="bg-card border-border"
            />
          </Field>
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="ictCoordinator">ICT Coordinator *</FieldLabel>
            <Input
              id="ictCoordinator"
              placeholder="Name"
              value={data.ictCoordinator}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange("ictCoordinator", e.target.value)
              }
              className="bg-card border-border"
            />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="ictCoordinatorContact">
              ICT Coordinator Contact *
            </FieldLabel>
            <Input
              id="ictCoordinatorContact"
              placeholder="Phone number"
              value={data.ictCoordinatorContact}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange("ictCoordinatorContact", e.target.value)
              }
              className="bg-card border-border"
            />
          </Field>
        </FieldGroup>
      </div>

      <Dialog open={openDistrictDialog} onOpenChange={setOpenDistrictDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New District/Cluster</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dist_type">Type</Label>
              <select
                id="dist_type"
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newDistrict.type}
                onChange={(e) =>
                  setNewDistrict({ ...newDistrict, type: e.target.value })
                }
              >
                <option value="District">District</option>
                <option value="Cluster">Cluster</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dist_name">Name</Label>
              <Input
                id="dist_name"
                value={newDistrict.name}
                onChange={(e) =>
                  setNewDistrict({ ...newDistrict, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dist_code">Code</Label>
              <Input
                id="dist_code"
                value={newDistrict.code}
                onChange={(e) =>
                  setNewDistrict({ ...newDistrict, code: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDistrictDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => addDistrictMutation.mutate(newDistrict)}
              disabled={!newDistrict.name || addDistrictMutation.isPending}
            >
              {addDistrictMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openOfficeDialog} onOpenChange={setOpenOfficeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Office/School</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="off_type">Type</Label>
                <select
                  id="off_type"
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={newOffice.type}
                  onChange={(e) =>
                    setNewOffice({ ...newOffice, type: e.target.value })
                  }
                >
                  <option value="Office">Office</option>
                  <option value="School">School</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>District/Cluster</Label>
                <Input
                  disabled
                  value={
                    (districts || []).find((d) => d.id === data.district)
                      ?.name || "N/A"
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="off_name">Name</Label>
              <Input
                id="off_name"
                value={newOffice.name}
                onChange={(e) =>
                  setNewOffice({ ...newOffice, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="off_head">School Head</Label>
                <Input
                  id="off_head"
                  value={newOffice.schoolHead}
                  onChange={(e) =>
                    setNewOffice({ ...newOffice, schoolHead: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="off_contact">Contact #</Label>
                <Input
                  id="off_contact"
                  value={newOffice.schoolHeadContact}
                  onChange={(e) =>
                    setNewOffice({
                      ...newOffice,
                      schoolHeadContact: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="off_ict">ICT Coordinator</Label>
                <Input
                  id="off_ict"
                  value={newOffice.ictCoordinator}
                  onChange={(e) =>
                    setNewOffice({
                      ...newOffice,
                      ictCoordinator: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="off_ict_contact">ICT Contact #</Label>
                <Input
                  id="off_ict_contact"
                  value={newOffice.ictCoordinatorContact}
                  onChange={(e) =>
                    setNewOffice({
                      ...newOffice,
                      ictCoordinatorContact: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="off_addr">Address</Label>
              <Textarea
                id="off_addr"
                value={newOffice.address}
                onChange={(e) =>
                  setNewOffice({ ...newOffice, address: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenOfficeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => addOfficeMutation.mutate(newOffice)}
              disabled={!newOffice.name || addOfficeMutation.isPending}
            >
              {addOfficeMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
