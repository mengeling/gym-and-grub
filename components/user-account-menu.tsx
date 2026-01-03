"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ProfileDialog } from "@/components/profile-dialog";

function getInitials(
  fullName: string | null | undefined,
  email: string
): string {
  if (fullName) {
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    }
    if (nameParts.length === 1 && nameParts[0].length >= 2) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }
  }
  // Fallback to email initials for existing users without full name
  const parts = email.split("@");
  const username = parts[0];
  if (username.length >= 2) {
    return username.substring(0, 2).toUpperCase();
  }
  return username.charAt(0).toUpperCase();
}

export function UserAccountMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const fullName = user.user_metadata?.full_name as string | undefined;
  const initials = getInitials(fullName, user.email || "");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {fullName || "Account"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </>
  );
}
