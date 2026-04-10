import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Technical User");

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    // Clear chat history on logout
    sessionStorage.removeItem("insureplan_chat_history");
    navigate("/login");
  };

  const settingsItems = [
    {
      name: "Account Settings",
      icon: Settings,
      color: "bg-blue-50 text-blue-600",
    },
    {
      name: "Notification Preferences",
      icon: Bell,
      color: "bg-amber-50 text-amber-600",
    },
    {
      name: "Security & Privacy",
      icon: Shield,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-slate-900 to-blue-900"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col items-center md:items-start md:flex-row gap-6 -mt-12 mb-8">
            <div className="w-24 h-24 bg-white rounded-3xl p-1.5 shadow-lg border border-slate-100">
              <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center">
                <User className="w-10 h-10 text-slate-400" />
              </div>
            </div>
            <div className="mt-14 text-center md:text-left">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {userName}
              </h1>
              <p className="text-slate-500 font-medium">
                PlanId Registry Access
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">
                Access Control
              </h3>
              <div className="space-y-2">
                {settingsItems.map((item) => (
                  <button
                    key={item.name}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 rounded-2xl group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-700">
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">
                Data Activity Log
              </h3>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      PlanId Views
                    </p>
                    <p className="text-2xl font-black text-slate-800">12</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Column Queries
                    </p>
                    <p className="text-2xl font-black text-slate-800">45</p>
                  </div>
                  <div className="col-span-2 mt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      Data Access Level
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow h-1.5 bg-slate-200 rounded-full">
                        <div className="w-2/3 h-full bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-xs font-black text-blue-600">
                        Enterprise
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* ✅ LOGOUT OUTSIDE BOX */}
              <div className="flex justify-end pr-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
