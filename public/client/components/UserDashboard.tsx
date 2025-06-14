import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, Clock } from "lucide-react";
import type { User } from "@shared/schema";

interface UserDashboardProps {
  user: User;
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const creditProgress = ((5 - user.credits) / 5) * 100;
  
  return (
    <Card className="bg-gradient-to-br from-slate-700 to-slate-600 border border-slate-600 sticky top-6">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <Avatar className="w-16 h-16 mx-auto mb-4">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-white">{user.name}</h3>
          <p className="text-slate-300 text-sm">{user.email}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Remaining credits</span>
            <span className="text-2xl font-bold text-green-400">{user.credits}</span>
          </div>
          <Progress value={100 - creditProgress} className="h-2 mb-2" />
          <p className="text-xs text-slate-400">{5 - user.credits} of 5 credits used this month</p>
        </div>

        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white mb-4 hover:from-amber-600 hover:to-orange-600">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </Button>

        <div className="space-y-2">
          <h4 className="font-medium text-white text-sm">Recent history</h4>
          <div className="flex items-center space-x-3 p-2 hover:bg-slate-600 rounded-lg transition-colors">
            <div className="w-10 h-6 bg-slate-500 rounded"></div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-200">No recent videos</p>
              <p className="text-xs text-slate-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Create your first video
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
