import { Role } from "./roles";

// Define what each role can do
const permissions = {
  admin: ["*"], // All access
  editor: [
    "publish_news",
    "edit_news",
    "delete_news",
    "view_reports",
    "manage_media",
    "schedule_news",
  ],
  revisor: [
    "edit_news",
    "approve_news",
  ],
  autor: [
    "create_news",
    "edit_own_news", // limited to draft or in_review
  ],
};

export function hasPermission(role: Role | null | undefined, action: string): boolean {
  if (!role) return false;
  if (role === "admin") return true;

  const rolePerms = permissions[role as keyof typeof permissions];
  if (!rolePerms) return false;

  return rolePerms.includes("*") || rolePerms.includes(action);
}

// Can publish directly? Admin and Editor can.
export function canPublishDirectly(role: Role | null | undefined): boolean {
  return hasPermission(role, "publish_news");
}

export function canApprove(role: Role | null | undefined): boolean {
  return hasPermission(role, "approve_news") || role === "admin" || role === "editor";
}
