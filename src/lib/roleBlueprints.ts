import {
  Bell,
  Briefcase,
  Calendar,
  Camera,
  CreditCard,
  Image,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Scissors,
  Shield,
  Star,
  Store,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface BlueprintItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const superAdminBlueprint: BlueprintItem[] = [
  { title: 'Platform Control', description: 'Approve, suspend, and monitor every shop on the marketplace.', icon: Shield },
  { title: 'Subscription Management', description: 'Create Bronze, Silver, Gold, and Platinum plans with booking caps and pricing.', icon: CreditCard },
  { title: 'User Management', description: 'Manage shop owners, staff, and customers from one control layer.', icon: Users },
  { title: 'Payments & Disputes', description: 'Review transactions, subscriptions, payment proofs, and escalation cases.', icon: Briefcase },
  { title: 'Reports', description: 'Track total bookings, platform revenue, and active shops or users.', icon: LayoutGrid },
];

export const shopOwnerBlueprint: BlueprintItem[] = [
  { title: 'Shop Profile', description: 'Manage name, location, cover photo, description, and working hours.', icon: Store },
  { title: 'Services', description: 'Add, edit, price, and group services for men or women.', icon: Scissors },
  { title: 'Staff Management', description: 'Create real staff accounts, assign services, schedules, and permissions.', icon: Users },
  { title: 'Portfolio', description: 'Upload before and after work to build trust on the storefront.', icon: Camera },
  { title: 'Bookings', description: 'Review bookings, assign staff, accept or reject, and track status.', icon: Calendar },
  { title: 'Subscription Usage', description: 'See plan usage, warnings, and booking limit protection.', icon: CreditCard },
  { title: 'Notifications', description: 'Follow new bookings, payment updates, and system alerts.', icon: Bell },
];

export const staffBlueprint: BlueprintItem[] = [
  { title: 'Visible Profile', description: 'Show name, role, photo, bio, services, rating, and work to customers.', icon: Star },
  { title: 'Personal Portfolio', description: 'Upload your own finished work for customers to review.', icon: Image },
  { title: 'Reviews', description: 'Build an individual reputation with staff-level reviews and ratings.', icon: MessageSquare },
  { title: 'Schedule', description: 'Control availability and view daily or weekly assignments.', icon: Calendar },
  { title: 'Assigned Bookings', description: 'See only your appointments and update them to completed.', icon: Briefcase },
  { title: 'Alerts', description: 'Receive new booking, 30-minute, and upcoming appointment notifications.', icon: Bell },
];

export const customerJourneyBlueprint: BlueprintItem[] = [
  { title: 'Shop List', description: 'Browse shops by name, image, rating, and location.', icon: Store },
  { title: 'Inside Shop', description: 'Move through Home, Services, Book, Team, Reviews, Portfolio, and About.', icon: LayoutGrid },
  { title: 'Booking Flow', description: 'Choose service, select a time, pick staff or auto-assign, and confirm.', icon: Calendar },
  { title: 'Staff Transparency', description: 'Compare staff bios, services, portfolios, and reviews before booking.', icon: Users },
  { title: 'Payments', description: 'Pay by cash or transfer with screenshot proof where needed.', icon: CreditCard },
  { title: 'Smart Notifications', description: 'Receive confirmation, day reminder, 30-minute, and go-now alerts.', icon: Bell },
  { title: 'History', description: 'Track upcoming and past bookings in one place.', icon: MapPin },
];

export const roleDisplayNames: Record<string, string> = {
  super_admin: 'Super Admin',
  shop_owner: 'Shop Owner',
  staff: 'Staff',
  customer: 'Customer',
};
