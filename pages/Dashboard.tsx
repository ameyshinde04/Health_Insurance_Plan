import React, { useMemo, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Shield, FileText, PlusCircle, Map } from "lucide-react";

const Dashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  type Plan = {
    MetalLevel: string;
    StateCode: string;
    CoveredBenefitCount: number;
    IsNewPlan: string;
  };

  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    // Ensuring the layout is stable before rendering charts
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("health_insurance_plan") 
        .select("*");

      if (error) {
        console.error(error);
      } else {
        setPlans(data || []);
      }
    };

    fetchPlans();
  }, []);

  const totalRecords = plans.length;
  const newPlansCount = plans.filter((p) => p.IsNewPlan === "New").length;

  const metalLevelData = useMemo(() => {
    const groups: Record<string, number> = {
      Gold: 0,
      Silver: 0,
      Bronze: 0,
      Others: 0,
    };

    plans.forEach((p) => {
      if (["Gold", "Silver", "Bronze"].includes(p.MetalLevel)) {
        groups[p.MetalLevel] += 1;
      } else {
        groups["Others"] += 1;
      }
    });

    const order = ["Gold", "Silver", "Bronze", "Others"];
    return order
      .map((name) => ({ name, count: groups[name] }))
      .filter((item) => item.count > 0);
  }, [plans]);

  const stateCodeData = useMemo(() => {
    const counts: Record<string, number> = {};
    plans.forEach((p) => {
      counts[p.StateCode] = (counts[p.StateCode] || 0) + 1;
    });

    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    let data;
    if (sortedEntries.length > 5) {
      const top5 = sortedEntries.slice(0, 5);
      const othersCount = sortedEntries
        .slice(5)
        .reduce((acc, curr) => acc + curr[1], 0);
      data = [
        ...top5.map(([name, count]) => ({ name, count })),
        { name: "Others", count: othersCount },
      ];
    } else {
      data = sortedEntries.map(([name, count]) => ({ name, count }));
    }

    return data.sort((a, b) => b.count - a.count);
  }, [plans]);

  const avgCoveredBenefitCount = useMemo(() => {
    if (plans.length === 0) return 0;
    const total = plans.reduce((acc, p) => acc + p.CoveredBenefitCount, 0);
    return Math.round(total / plans.length);
  }, [plans]);

  const getMetalColor = (name: string) => {
    switch (name) {
      case "Gold":
        return "#F59E0B";
      case "Silver":
        return "#94A3B8";
      case "Bronze":
        return "#B45309";
      case "Others":
        return "#CBD5E1";
      default:
        return "#3b82f6";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight underline decoration-blue-500 decoration-4 underline-offset-8">
            Dataset Technical Analysis
          </h1>
          <p className="text-slate-500 font-medium mt-4">
            Quantitative summary derived from Plans records
          </p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-black uppercase tracking-widest">
          Technical Column Mapping: ACTIVE
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Total Plans Covered
          </p>
          <p className="text-3xl font-black text-slate-900">{totalRecords}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <PlusCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            IsNewPlan: 'New' Count
          </p>
          <p className="text-3xl font-black text-slate-900">{newPlansCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Avg CoveredBenefitCount
          </p>
          <p className="text-3xl font-black text-slate-900">
            {avgCoveredBenefitCount}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Map className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Unique StateCode Count
          </p>
          <p className="text-3xl font-black text-slate-900">
            {stateCodeData.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            <span>StateCode Distribution Analysis</span>
          </h3>
          <div className="w-full h-[320px] relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height={320} debounce={50}>
                <BarChart
                  data={stateCodeData}
                  layout="vertical"
                  margin={{ left: 20, right: 30, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={50}
                    tick={{ fontSize: 12, fontWeight: 800, fill: "#475569" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[0, 6, 6, 0]}
                    barSize={35}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
            <span>MetalLevel Frequency Mapping</span>
          </h3>
          <div className="w-full h-[320px] relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height={320} debounce={50}>
                <BarChart
                  data={metalLevelData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 800, fill: "#475569" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    className="text-xs text-slate-400 font-bold"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={55}>
                    {metalLevelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getMetalColor(entry.name)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
