import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { onAuthStateChange } from "@/lib/firebase";
import UserDashboard from "@/components/UserDashboard";
import VideoCreator from "@/components/VideoCreator";
import type { User } from "@shared/schema";

interface SimpleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export default function Dashboard() {
  const [simpleUser, setSimpleUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setSimpleUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const { data: userData, isLoading: userLoading, refetch } = useQuery({
    queryKey: [`/api/user/${simpleUser?.uid}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!simpleUser?.uid,
    select: (data: any) => data as { user: User },
  });

  const handleUserUpdate = (updatedUser: User) => {
    refetch();
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!simpleUser || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-slate-300 mb-6">Please sign in to access your dashboard.</p>
          <a href="/" className="text-blue-400 hover:underline">
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UserDashboard user={userData.user} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <VideoCreator 
              user={userData.user} 
              onUserUpdate={handleUserUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
