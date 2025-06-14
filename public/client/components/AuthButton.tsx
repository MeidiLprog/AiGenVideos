import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { signInWithGoogle, handleRedirectResult, logOut, onAuthStateChange } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

interface SimpleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export default function AuthButton() {
  const [simpleUser, setSimpleUser] = useState<SimpleUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setSimpleUser(user);
      
      if (user) {
        try {
          // Sign in or get existing user from our API
          const response = await apiRequest("POST", "/api/auth/signin", {
            firebaseUid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split("@")[0] || "User"
          });
          const data = await response.json();
          setAppUser(data.user);
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
    });

    // Handle redirect result on page load
    handleRedirectResult().catch(console.error);

    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    signInWithGoogle();
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setAppUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="h-8 w-20 bg-slate-600 rounded animate-pulse"></div>
      </div>
    );
  }

  if (simpleUser && appUser) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5.5a.5.5 0 011 0V6h.5a.5.5 0 010 1H10v.5a.5.5 0 01-1 0V7h-.5a.5.5 0 010-1H9V5.5zm-1.5 7a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z" clipRule="evenodd"/>
          </svg>
          <span className="text-sm font-medium text-green-300">{appUser.credits}</span>
          <span className="text-xs text-green-400">credits</span>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src={simpleUser.photoURL || undefined} />
          <AvatarFallback className="bg-slate-700 text-white">
            {appUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSignOut}
          className="text-slate-300 hover:text-white"
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Button 
        variant="ghost" 
        className="text-slate-300 hover:text-blue-400"
      >
        Sign in
      </Button>
      <Button 
        onClick={handleSignIn}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
      >
        Get started
      </Button>
    </div>
  );
}
