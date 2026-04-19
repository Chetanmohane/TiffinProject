import { useEffect, useState } from "react";

export type Role = "admin" | "editor" | "viewer" | "customer";

export function useRBAC() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setRole(user.role);
      } catch (e) {
        setRole(null);
      }
    }
  }, []);

  const can = (action: "view" | "edit" | "delete" | "create") => {
    if (!role) return false;
    
    // Admin can do everything
    if (role === "admin") return true;

    // Editor can view, edit, and create, but NOT delete
    if (role === "editor") {
      return action !== "delete";
    }

    // Viewer can ONLY view
    if (role === "viewer") {
      return action === "view";
    }

    return false;
  };

  return { role, can, isAdmin: role === "admin", isEditor: role === "editor", isViewer: role === "viewer" };
}
