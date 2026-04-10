import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import { InsurancePlan } from "../types";
import { Plus, X, ArrowRightLeft, Info } from "lucide-react";

const Compare: React.FC = () => {
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>(() => {
    const saved = sessionStorage.getItem("comparePlans");
    return saved ? JSON.parse(saved) : [];
  });
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const suggestedPlans = [
    ...plans.filter((p) => p.MetalLevel === "Gold").slice(0, 2),
    ...plans.filter((p) => p.MetalLevel === "Silver").slice(0, 1),
    ...plans.filter((p) => p.MetalLevel === "Platinum").slice(0, 1),
  ];

  const selectedPlans = plans.filter((p) => selectedPlanIds.includes(p.PlanId));

  const filteredPlans = plans
    .filter((plan) =>
      plan.PlanVariantMarketingName?.toLowerCase().includes(
        searchTerm.toLowerCase(),
      ),
    )
    .slice(0, 5); // 👈 only 5 suggestions

  useEffect(() => {
    sessionStorage.setItem("comparePlans", JSON.stringify(selectedPlanIds));
  }, [selectedPlanIds]);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("health_insurance_plan")
        .select("*");

      if (error) {
        console.error("Error fetching plans:", error);
      } else {
        setPlans(data);
      }
    };

    fetchPlans();
  }, []);

  const togglePlan = (id: string) => {
    if (selectedPlanIds.includes(id)) {
      setSelectedPlanIds(selectedPlanIds.filter((pid) => pid !== id));
    } else if (selectedPlanIds.length < 4) {
      setSelectedPlanIds((prev) => [...new Set([...prev, id])]);
    }
  };

  const getMetalBadgeClasses = (level: string) => {
    const normalized = level.trim();
    switch (normalized) {
      case "Gold":
        return "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm";
      case "Silver":
        return "bg-slate-200 text-slate-700 border border-slate-300 shadow-sm";
      case "Bronze":
        return "bg-orange-100 text-orange-800 border border-orange-200 shadow-sm";
      case "Platinum":
        return "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm";
      case "Expanded Bronze":
        return "bg-orange-50 text-orange-700 border border-orange-100 shadow-sm";
      case "High":
        return "bg-purple-100 text-purple-700 border border-purple-200 shadow-sm";
      case "Low":
        return "bg-slate-50 text-slate-500 border border-slate-200 shadow-sm";
      case "Catastrophic":
        return "bg-red-100 text-red-700 border border-red-200 shadow-sm";
      default:
        return "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm";
    }
  };

  const comparisonRows = [
    { label: "Metal Level", key: "MetalLevel" },
    { label: "Plan Type", key: "PlanType" },
    { label: "Individual Deductible", key: "TEHBDedInnTier1Individual" },
    {
      label: "Family (Per Person) Ded.",
      key: "TEHBDedInnTier1FamilyPerPerson",
    },
    { label: "Individual MOOP", key: "TEHBInnTier1IndividualMOOP" },
    { label: "Coinsurance", key: "TEHBDedInnTier1Coinsurance" },
    { label: "HSA Eligible", key: "IsHSAEligible" },
    { label: "Covered Benefits", key: "CoveredBenefitCount" },
    { label: "National Network", key: "NationalNetwork" },
    { label: "Service Area ID", key: "ServiceAreaId" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-blue-600" />
          <span>Compare Plans</span>
        </h1>
        <p className="text-slate-500">
          Select up to 4 plans to analyze technical specifications side-by-side.
        </p>
      </header>

      {/* Plan Selection Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Quick Add:
        </span>

        <input
          type="text"
          placeholder="Search plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-3 w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* ✅ Suggestions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(searchTerm ? filteredPlans : suggestedPlans).map((plan) => (
            <button
              key={plan.PlanId}
              onClick={() => togglePlan(plan.PlanId)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPlanIds.includes(plan.PlanId)
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {selectedPlanIds.includes(plan.PlanId) ? "✕ " : "+ "}
              {plan.PlanVariantMarketingName}
            </button>
          ))}
        </div>

        {/* ✅ Empty state */}
        {searchTerm && filteredPlans.length === 0 && (
          <p className="text-slate-400 text-sm mt-3">No plans found</p>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20">Loading plans...</div>
      ) : selectedPlans.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-24 text-center">
          <Info className="w-12 h-12 text-slate-300 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-slate-400">
            No comparison selected
          </h2>
          <p className="text-slate-400 mt-2">
            Click plans above to build your comparison table.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-6 text-left w-64 sticky left-0 bg-slate-50 z-10">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Plan Details
                  </span>
                </th>
                {selectedPlans.map((plan) => (
                  <th
                    key={plan.PlanId}
                    className="px-8 py-6 text-left min-w-[200px]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${getMetalBadgeClasses(plan.MetalLevel)}`}
                      >
                        {plan.MetalLevel}
                      </span>
                      <button
                        onClick={() => togglePlan(plan.PlanId)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      {plan.PlanVariantMarketingName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      {plan.PlanId}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row) => (
                <tr
                  key={row.key}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="px-8 py-5 text-left font-bold text-slate-500 text-sm w-64 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-50">
                    {row.label}
                  </td>
                  {selectedPlans.map((plan) => {
                    const value = plan[row.key as keyof InsurancePlan];
                    return (
                      <td
                        key={`${plan.PlanId}-${row.key}`}
                        className="px-8 py-5 text-sm text-slate-800 font-medium"
                      >
                        {value === "Yes" ? (
                          <span className="text-emerald-600 font-bold">
                            Yes
                          </span>
                        ) : value === "No" ? (
                          <span className="text-red-400">No</span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Compare;
