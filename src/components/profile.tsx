import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "~/lib/auth-client";
import type { User } from "better-auth/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function ProfileSheet({ user }: { user: User }) {
  const router = useRouter();

  console.log("user image", user.image);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild className="cursor-pointer">
        {user.image ? (
          <Avatar className="shadow-sm shadow-gray-300">
            <AvatarImage src={user.image} alt="profile image" />
            <AvatarFallback>
              {user.name.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar>
            <AvatarFallback>
              <UserRoundCog />
            </AvatarFallback>
          </Avatar>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Profile</SheetTitle>
          <SheetDescription>
            View details about your profile here.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-8 px-4">
          <div className="grid gap-2">
            <Label htmlFor="profile-sheet-name">Username</Label>
            <h1>{user.name}</h1>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-sheet-name">Email</Label>
            <h1>{user.email}</h1>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-sheet-name">Member Since</Label>
            <h1>{user.createdAt.toLocaleDateString()}</h1>
          </div>
        </div>
        <SheetFooter>
          <Button variant="destructive" onClick={handleSignOut}>
            Logout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
