import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  Search,
  Filter,
  Info,
  ChevronRight,
  LayoutGrid,
  List,
  MapPin,
  Activity,
  X,
  Tag,
  ChevronDown,
  Layers,
  Shield,
  Sparkles,
} from "lucide-react";

const Browse: React.FC = () => {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRestored, setIsRestored] = useState(false);
  const [search, setSearch] = useState("");
  const isRestoringRef = useRef(true);
  const [metalFilter, setMetalFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const hasLoadedRef = useRef(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availablePlanTypes, setAvailablePlanTypes] = useState<string[]>([]);

  useEffect(() => {
    const savedState = sessionStorage.getItem("browseState");

    if (savedState) {
      const parsed = JSON.parse(savedState);

      setPage(parsed.page || 1);
      setSearch(parsed.search || "");
      setMetalFilter(parsed.metalFilter || "All");
      setStateFilter(parsed.stateFilter || "All");
      setTypeFilter(parsed.typeFilter || "All");
      setStatusFilter(parsed.statusFilter || "All");
    } else {
      setPage(1);
      setSearch("");
      setMetalFilter("All");
      setStateFilter("All");
      setTypeFilter("All");
      setStatusFilter("All");
    }

    fetchPlans(); // always fetch clean data

    setTimeout(() => {
      isRestoringRef.current = false;
      setIsInitialLoad(false);
    }, 0);
  }, []);

  useEffect(() => {
    if (allPlans.length === 0) return; // 🚀 KEY FIX

    sessionStorage.setItem(
      "browseState",
      JSON.stringify({
        page,
        search,
        metalFilter,
        stateFilter,
        typeFilter,
        statusFilter,
      }),
    );
  }, [
    allPlans,
    page,
    search,
    metalFilter,
    stateFilter,
    typeFilter,
    statusFilter,
  ]);

  useEffect(() => {
    const syncFavorites = () => {
      const saved = localStorage.getItem("favorites");
      if (saved) setFavorites(JSON.parse(saved));
    };

    window.addEventListener("storage", syncFavorites);
    return () => window.removeEventListener("storage", syncFavorites);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (planId: string) => {
    setFavorites((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId],
    );
  };

  async function fetchPlans(isFresh = false) {
    const { data, error } = await supabase
      .from("health_insurance_plan")
      .select("*");

    console.log("SUPABASE DATA:", data?.length, data?.[0]);

    if (error) {
      console.error(error);
      return;
    }

    const shuffled = data || []; // ✅ NO SHUFFLE

    const balanced = shuffled; // ✅ keep original order

    setAllPlans(balanced);
  }

  useEffect(() => {
    loadFilterOptions();
  }, []);

  async function loadFilterOptions() {
    const { data: stateRows, error: stateError } = await supabase
      .from("health_insurance_plan")
      .select("StateCode");

    const { data: typeRows, error: typeError } = await supabase
      .from("health_insurance_plan")
      .select("PlanType");

    if (stateError) console.error(stateError);
    if (typeError) console.error(typeError);

    const states = Array.from(
      new Set((stateRows ?? []).map((r) => r.StateCode).filter(Boolean)),
    ).sort();

    const types = Array.from(
      new Set((typeRows ?? []).map((r) => r.PlanType).filter(Boolean)),
    ).sort();

    setAvailableStates(states);
    setAvailablePlanTypes(types);
  }

  // Custom dropdown states
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isMetalOpen, setIsMetalOpen] = useState(false);

  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const metalDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(target)
      ) {
        setIsStateOpen(false);
      }
      if (
        metalDropdownRef.current &&
        !metalDropdownRef.current.contains(target)
      ) {
        setIsMetalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const availableStates = useMemo(() => {
  //   const states = new Set(allPlans.map((p) => p.StateCode));
  //   return Array.from(states).sort();
  // }, []);

  const availableTypes = useMemo(() => {
    const raw = allPlans.map((p) => p.PlanType).filter(Boolean);

    // Everything except Indemnity and Others
    const mainTypes = Array.from(
      new Set(raw.filter((t) => t !== "Indemnity" && t !== "Others")),
    ).sort();

    return [...mainTypes, "Others"];
  }, [allPlans]);

  const availableMetals = [
    "Gold",
    "Silver",
    "Bronze",
    "Platinum",
    "Expanded Bronze",
    "High",
    "Low",
    "Catastrophic",
  ];

  const filteredPlans = useMemo(() => {
    return allPlans.filter((plan: any) => {
      // ⭐ FAVORITES FILTER
      if (showFavoritesOnly && !favorites.includes(plan.PlanId)) {
        return false;
      }

      const searchLower = search.toLowerCase();

      const matchesSearch =
        !search ||
        (plan.PlanMarketingName ?? "").toLowerCase().includes(searchLower) ||
        (plan.PlanVariantMarketingName ?? "")
          .toLowerCase()
          .includes(searchLower) ||
        String(plan.PlanId ?? "")
          .toLowerCase()
          .includes(searchLower);

      const matchesMetal =
        metalFilter === "All" || plan.MetalLevel === metalFilter;

      const matchesStatus =
        statusFilter === "All" || String(plan.IsNewPlan) === statusFilter;

      const matchesState =
        stateFilter === "All" || plan.StateCode === stateFilter;

      const matchesType =
        typeFilter === "All" ||
        (typeFilter === "Others"
          ? plan.PlanType === "Indemnity" || plan.PlanType === "Others"
          : plan.PlanType === typeFilter);

      const hasValidDeductible =
        plan.TEHBDedInnTier1Individual &&
        plan.TEHBDedInnTier1Individual !== "$0" &&
        plan.TEHBDedInnTier1Individual !== 0;

      return (
        matchesSearch &&
        matchesMetal &&
        matchesStatus &&
        matchesState &&
        matchesType
      );
    });
  }, [
    allPlans,
    search,
    metalFilter,
    statusFilter,
    stateFilter,
    typeFilter,
    showFavoritesOnly,
    favorites,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / PAGE_SIZE));

  const paginatedPlans = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    const buckets: Record<string, any[]> = {};

    filteredPlans.forEach((p: any) => {
      const key = p.MetalLevel ?? "Unknown";
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(p);
    });

    const mixOrder = [
      "Gold",
      "Silver",
      "Bronze",
      "Platinum",
      "Expanded Bronze",
      "High",
      "Low",
      "Catastrophic",
      "Others", // ✅ ADD THIS
    ];

    const allMixed: any[] = [];

    let i = 0;
    while (true) {
      let added = false;

      for (const key of mixOrder) {
        if (buckets[key] && buckets[key][i]) {
          allMixed.push(buckets[key][i]);
          added = true;
        }
      }

      if (!added) break;
      i++;
    }

    return allMixed.slice(start, start + PAGE_SIZE);
  }, [filteredPlans, page]);

  useEffect(() => {
    if (isRestoringRef.current) return; // 🚀 FINAL FIX
    if (isInitialLoad) return; // ✅ ADD THIS

    setPage(1);
  }, [search, stateFilter, metalFilter, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredPlans.forEach((p: any) => {
      const key = p.MetalLevel ?? "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts);
  }, [filteredPlans]);

  const activeFilters = useMemo(() => {
    const chips = [];
    if (stateFilter !== "All")
      chips.push({
        label: "StateCode",
        value: stateFilter,
        clear: () => setStateFilter("All"),
      });
    if (metalFilter !== "All")
      chips.push({
        label: "MetalLevel",
        value: metalFilter,
        clear: () => setMetalFilter("All"),
      });
    if (typeFilter !== "All")
      chips.push({
        label: "PlanType",
        value: typeFilter,
        clear: () => setTypeFilter("All"),
      });
    if (statusFilter !== "All")
      chips.push({
        label: "IsNewPlan",
        value: statusFilter,
        clear: () => setStatusFilter("All"),
      });
    return chips;
  }, [stateFilter, metalFilter, typeFilter, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setMetalFilter("All");
    setStatusFilter("All");
    setStateFilter("All");
    setTypeFilter("All");
  };

  const getMetalBadgeStyles = (level: string) => {
    switch (level) {
      case "Gold":
        return "bg-amber-100 text-amber-700";
      case "Silver":
        return "bg-slate-200 text-slate-700";
      case "Bronze":
        return "bg-orange-100 text-orange-700";
      case "High":
        return "bg-purple-100 text-purple-700";
      case "Low":
        return "bg-slate-100 text-slate-500";
      case "Catastrophic":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-50 text-blue-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Technical Plan Explorer
          </h1>
          <p className="text-slate-400 font-medium text-sm mt-1">
            Multi-dimensional filtering based on 2026 dataset specifications
          </p>
        </div>

        <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-sm w-fit">
          <button
            onClick={() => setViewType("grid")}
            className={`p-2 rounded-lg transition-all ${viewType === "grid" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewType("list")}
            className={`p-2 rounded-lg transition-all ${viewType === "list" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            className={`ml-2 p-2 rounded-lg transition ${
              showFavoritesOnly
                ? "bg-red-100 text-red-500"
                : "bg-slate-100 text-slate-400 hover:text-red-400"
            }`}
          >
            ❤️
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E40AF] rounded-3xl p-8 mb-6 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
          <Activity className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center border border-blue-400/30">
                <Info className="w-4 h-4 text-blue-300" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest text-blue-300">
                Technical Insights
              </h2>
            </div>
            <p className="text-blue-100 text-lg max-w-xl font-medium leading-relaxed">
              Analyzing{" "}
              <span className="text-white font-black underline decoration-blue-400 underline-offset-4">
                {filteredPlans.length} records
              </span>
              .
              {stateFilter !== "All" && (
                <span>
                  {" "}
                  Filtering by StateCode:{" "}
                  <span className="text-white font-bold">{stateFilter}</span>.
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {stats.slice(0, 3).map(([label, count]) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md"
              >
                <p className="text-[10px] uppercase font-black tracking-widest text-blue-300 mb-1">
                  {label} Frequency
                </p>
                <p className="text-3xl font-black">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-1 duration-300">
          <Tag className="w-4 h-4 text-slate-400 mr-2" />
          {activeFilters.map((filter, idx) => (
            <div
              key={idx}
              className="flex items-center bg-blue-50 border border-blue-100 pl-3 pr-1 py-1 rounded-lg"
            >
              <span className="text-[10px] font-black text-blue-400 uppercase mr-2">
                {filter.label}
              </span>
              <span className="text-xs font-bold text-blue-700 mr-2">
                {filter.value}
              </span>
              <button
                onClick={filter.clear}
                className="p-1 hover:bg-blue-100 rounded-md text-blue-400 hover:text-blue-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-transparent">
                <h3 className="font-bold text-[#1E293B] uppercase tracking-[0.1em] text-[13px] flex items-center">
                  <Filter className="w-4 h-4 mr-3 text-blue-600" />
                  FILTER
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-500 uppercase flex items-center tracking-wider transition-colors"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  CLEAR
                </button>
              </div>

              <div className="p-6 pt-2 space-y-8">
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
                    SEARCH REGISTRY
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Plan Name or ID..."
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-[16px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:text-[#CBD5E1]"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* StateCode Filter UI (Dropdown) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
                    STATECODE FILTER
                  </label>
                  <div className="relative" ref={stateDropdownRef}>
                    <button
                      onClick={() => setIsStateOpen(!isStateOpen)}
                      className={`w-full flex items-center justify-between pl-11 pr-4 py-3.5 bg-white border rounded-[16px] text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${
                        isStateOpen
                          ? "border-blue-500 ring-2 ring-blue-500/10"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <MapPin
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isStateOpen ? "text-blue-500" : "text-slate-400"}`}
                      />
                      <span
                        className={
                          stateFilter === "All"
                            ? "text-slate-500"
                            : "text-slate-900"
                        }
                      >
                        {stateFilter === "All" ? "All States" : stateFilter}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isStateOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isStateOpen && (
                      <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[50] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-2">
                          <button
                            onClick={() => {
                              setStateFilter("All");
                              setIsStateOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all mb-1 ${
                              stateFilter === "All"
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-3 ${stateFilter === "All" ? "bg-blue-600" : "bg-transparent border border-slate-200"}`}
                            ></span>
                            All States
                          </button>
                          {availableStates.map((state) => (
                            <button
                              key={state}
                              onClick={() => {
                                setStateFilter(state);
                                setIsStateOpen(false);
                              }}
                              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all mb-1 ${
                                stateFilter === state
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-3 ${stateFilter === state ? "bg-blue-600" : "bg-transparent border border-slate-200"}`}
                              ></span>
                              {state}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* MetalLevel Tier (Dropdown) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
                    METALLEVEL TIER
                  </label>
                  <div className="relative" ref={metalDropdownRef}>
                    <button
                      onClick={() => setIsMetalOpen(!isMetalOpen)}
                      className={`w-full flex items-center justify-between pl-11 pr-4 py-3.5 bg-white border rounded-[16px] text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${
                        isMetalOpen
                          ? "border-blue-500 ring-2 ring-blue-500/10"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <Shield
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isMetalOpen ? "text-blue-500" : "text-slate-400"}`}
                      />
                      <span
                        className={
                          metalFilter === "All"
                            ? "text-slate-500"
                            : "text-slate-900"
                        }
                      >
                        {metalFilter === "All" ? "All Tiers" : metalFilter}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isMetalOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMetalOpen && (
                      <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[50] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-2">
                          <button
                            onClick={() => {
                              setMetalFilter("All");
                              setIsMetalOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all mb-1 ${
                              metalFilter === "All"
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-3 ${metalFilter === "All" ? "bg-blue-600" : "bg-transparent border border-slate-200"}`}
                            ></span>
                            All Tiers
                          </button>
                          {availableMetals.map((m) => (
                            <button
                              key={m}
                              onClick={() => {
                                setMetalFilter(m);
                                setIsMetalOpen(false);
                              }}
                              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all mb-1 ${
                                metalFilter === m
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-3 ${metalFilter === m ? "bg-blue-600" : "bg-transparent border border-slate-200"}`}
                              ></span>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PlanType Specification (Selection Button Grid) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
                    PLANTYPE SPECIFICATION
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {["All", ...availableTypes].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`py-2.5 px-2 rounded-[12px] text-xs font-bold transition-all border flex items-center justify-center space-x-2 ${
                          typeFilter === t
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                            : "bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600"
                        }`}
                      >
                        <Layers
                          className={`w-3 h-3 ${typeFilter === t ? "text-blue-200" : "text-slate-300"}`}
                        />
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">
                    ISNEWPLAN STATUS
                  </label>
                  <div className="space-y-3">
                    {["All", "Existing", "New"].map((v) => (
                      <label
                        key={v}
                        className="flex items-center p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="status"
                            checked={statusFilter === v}
                            onChange={() => setStatusFilter(v)}
                            className="w-4.5 h-4.5 text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                          />
                        </div>
                        <span className="ml-3 text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors tracking-tight">
                          {v} Registry
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {viewType === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPlans.map((plan) => (
                <div
                  key={plan.PlanId}
                  className="bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-black text-slate-900 leading-tight min-h-[48px]">
                        {plan.PlanVariantMarketingName}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-1">
                        {plan.PlanId}
                      </p>
                    </div>

                    {/* ⭐ FAVORITE BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(plan.PlanId);
                      }}
                      className={`p-2 rounded-lg transition ${
                        favorites.includes(plan.PlanId)
                          ? "bg-red-100 text-red-500"
                          : "bg-slate-100 text-slate-400 hover:text-red-500"
                      }`}
                    >
                      ❤️
                    </button>
                  </div>
                  <div className="space-y-3 mb-4 flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        StateCode
                      </span>
                      <span className="font-black text-slate-900">
                        {plan.StateCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        MetalLevel
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getMetalBadgeStyles(plan.MetalLevel)}`}
                      >
                        {plan.MetalLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        PlanType
                      </span>
                      <span className="font-bold text-slate-600">
                        {plan.PlanType}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        TEHB Deductible
                      </p>
                      <p className="font-black text-blue-600">
                        {plan.TEHBDedInnTier1Individual || "N/A"}
                      </p>
                    </div>
                    <Link
                      to={`/plan/${plan.PlanId}`}
                      state={{ fromBrowse: true }} // ✅ ADD THIS LINE
                      className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all inline-block shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Plan Name / ID
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      StateCode
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      MetalLevel
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      PlanType
                    </th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      TEHB Deductible
                    </th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPlans.map((plan) => (
                    <tr
                      key={plan.PlanId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
                            {plan.PlanVariantMarketingName}
                          </p>
                          {plan.IsNewPlan === "New" && (
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border border-emerald-100 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                          {plan.PlanId}
                        </p>
                      </td>
                      <td className="px-6 py-7 font-black text-slate-600">
                        {plan.StateCode}
                      </td>
                      <td className="px-6 py-7">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getMetalBadgeStyles(plan.MetalLevel)}`}
                        >
                          {plan.MetalLevel}
                        </span>
                      </td>
                      <td className="px-6 py-7 font-bold text-slate-500">
                        {plan.PlanType}
                      </td>
                      <td className="px-6 py-7 text-right font-black text-blue-600">
                        {plan.TEHBDedInnTier1Individual &&
                        plan.TEHBDedInnTier1Individual !== "$0" &&
                        plan.TEHBDedInnTier1Individual !== 0
                          ? plan.TEHBDedInnTier1Individual
                          : "N/A"}
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex items-center justify-end gap-2">
                          {/* ❤️ Favorite */}
                          {favorites.includes(plan.PlanId) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(plan.PlanId);
                              }}
                              className="p-1.5 transition transform hover:scale-110 active:scale-95"
                            >
                              {favorites.includes(plan.PlanId) ? "❤️" : "🤍"}
                            </button>
                          )}

                          {/* ➡ Arrow */}
                          <Link
                            to={`/plan/${plan.PlanId}`}
                            className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredPlans.length > 0 && (
            <div className="mt-8 flex items-center justify-between gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-md border disabled:opacity-40"
                >
                  ◀◀
                </button>

                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-md border disabled:opacity-40"
                >
                  ◀
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>Page</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={page}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!v) return;
                    setPage(Math.min(totalPages, Math.max(1, v)));
                  }}
                  className="w-16 px-2 py-1 border rounded-md text-center"
                />
                <span>of {totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-md border disabled:opacity-40"
                >
                  ▶
                </button>

                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-2 rounded-md border disabled:opacity-40"
                >
                  ▶▶
                </button>

                <span className="ml-3 text-slate-400">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filteredPlans.length)} of{" "}
                  {filteredPlans.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;
