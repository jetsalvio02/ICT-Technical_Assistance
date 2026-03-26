"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminSettingsPage() {
  const [facebookLink, setFacebookLink] = useState("");

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6 rounded-2xl">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage system preferences and basic information.
            </p>
          </div>
        </div>
        <Card className="rounded-2xl border border-border/60 dark:border-white/5 bg-card/80 dark:bg-white/[0.03] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Facebook Link
              </label>
              <Input
                value={facebookLink}
                type="text"
                onChange={(e) => setFacebookLink(e.target.value)}
                placeholder="Paste your facebook link here"
              />
            </div>
            <div className="pt-2">
              <Button>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
