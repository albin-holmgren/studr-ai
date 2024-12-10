export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  notificationSettings: {
    emailNotifications: boolean;
    studyReminders: boolean;
    marketingEmails: boolean;
  } | null;
  subscription: {
    plan: string;
    status: string;
  } | null;
}

export interface LoaderData {
  user: User | null;
  error?: string;
}
