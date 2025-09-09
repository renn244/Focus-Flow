import { Crown, Shield, User } from "lucide-react";

export const permissionIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
//   viewer: User,
} as const;

export const permissionColors = {
  owner: "bg-purple-100 text-purple-800 border-purple-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  member: "bg-green-100 text-green-800 border-green-200",
  // viewer: "bg-gray-100 text-gray-800 border-gray-200",
} as const;
