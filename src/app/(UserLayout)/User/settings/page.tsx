'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Lock, Palette, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your application preferences and notifications.
        </p>
      </div>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Manage how you receive updates about your requests
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Email notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Request updates</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">
                Keep your account safe and secure
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start">
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Palette className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                Customize how the application looks
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="radio" id="light" name="theme" defaultChecked />
            <label htmlFor="light" className="text-sm text-foreground cursor-pointer">
              Light Mode
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="radio" id="dark" name="theme" />
            <label htmlFor="dark" className="text-sm text-foreground cursor-pointer">
              Dark Mode
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
