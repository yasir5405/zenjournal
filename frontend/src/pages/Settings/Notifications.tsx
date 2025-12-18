import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api/api";
import { Loader2, Bell, Mail, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function NotificationSettings() {
  const userData = useSelector(
    (state: { auth: { userData: any } }) => state.auth.userData
  );
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    journalReminders: true,
    weeklyDigest: false,
    moodReminders: true,
    achievementAlerts: true,
    securityAlerts: true,
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get("/auth/notification-settings");
      if (response.data.status && response.data.settings) {
        setNotifications(response.data.settings);
      }
    } catch (error) {
      // If settings don't exist yet, use defaults
      console.log("Using default notification settings");
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const response = await api.put("/auth/notification-settings", notifications);

      if (response.data.status) {
        toast({
          title: "Success",
          description: "Notification preferences saved successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage how and when you want to be notified
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure email notifications for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications" className="text-base">
                Enable Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyDigest" className="text-base">
                Weekly Digest
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your journal activity
              </p>
            </div>
            <Switch
              id="weeklyDigest"
              checked={notifications.weeklyDigest}
              onCheckedChange={() => handleToggle("weeklyDigest")}
              disabled={!notifications.emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Journal Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Journal Reminders</CardTitle>
          </div>
          <CardDescription>
            Get reminders to maintain your journaling habit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="journalReminders" className="text-base">
                Daily Journal Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Remind me to write in my journal daily
              </p>
            </div>
            <Switch
              id="journalReminders"
              checked={notifications.journalReminders}
              onCheckedChange={() => handleToggle("journalReminders")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="moodReminders" className="text-base">
                Mood Tracking Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Remind me to log my mood regularly
              </p>
            </div>
            <Switch
              id="moodReminders"
              checked={notifications.moodReminders}
              onCheckedChange={() => handleToggle("moodReminders")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Activity Alerts</CardTitle>
          </div>
          <CardDescription>
            Notifications about your account activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="achievementAlerts" className="text-base">
                Achievement Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you reach milestones
              </p>
            </div>
            <Switch
              id="achievementAlerts"
              checked={notifications.achievementAlerts}
              onCheckedChange={() => handleToggle("achievementAlerts")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="securityAlerts" className="text-base">
                Security Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Important notifications about account security
              </p>
            </div>
            <Switch
              id="securityAlerts"
              checked={notifications.securityAlerts}
              onCheckedChange={() => handleToggle("securityAlerts")}
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground">
            * Security alerts cannot be disabled for your protection
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
