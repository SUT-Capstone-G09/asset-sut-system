import { useAuthContext } from "@/lib/context/auth-context";

export function usePermission(permission: string): boolean {
  const { user } = useAuthContext();
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.permissions?.includes(permission) ?? false;
}
