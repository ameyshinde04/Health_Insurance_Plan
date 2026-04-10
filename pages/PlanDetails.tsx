import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

import {
  ArrowLeft,
  ExternalLink,
  Shield,
  Clipboard,
  FileCheck,
  Layers,
  FileText,
  Globe,
  CreditCard,
  Link as LinkIcon,
} from "lucide-react";

const PlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      const { data, error } = await supabase
        .from("health_insurance_plan")
        .select("*")
        .eq("PlanId", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setPlan(data);
      }
    };

    if (id) fetchPlan();
  }, [id]);

  if (!plan) {
    return <div className="text-center py-20">Loading...</div>;
  }

  const Section = ({ title, children, icon: Icon }: any) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center space-x-2.5">
        <Icon className="w-4 h-4 text-blue-600" />
        <h3 className="font-bold text-[#1E293B] uppercase text-[11px] tracking-[0.1em]">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <div className="py-2.5 border-b border-slate-50 last:border-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-sm text-[#0F172A] font-bold">
        {value || "Not Specified"}
      </p>
    </div>
  );

  const SBCField = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center py-1.5 first:pt-0 last:pb-0">
      <span className="text-sm text-slate-500 font-medium">{label}:</span>
      <span className="text-sm font-black text-[#0F172A]">{value || "--"}</span>
    </div>
  );

  const ExternalLinkItem = ({
    label,
    url,
    icon: Icon,
  }: {
    label: string;
    url: string;
    icon: any;
  }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group mb-2 last:mb-0"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-50 group-hover:text-blue-600">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {label}
          </span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400" />
      </a>
    );
  };

  const getMetalLevelStyles = (level: string) => {
    switch (level) {
      case "Gold":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "Silver":
        return "bg-slate-200 text-slate-700 border border-slate-300";
      case "Bronze":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "High":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      case "Low":
        return "bg-slate-50 text-slate-500 border border-slate-200";
      case "Catastrophic":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-blue-50 text-blue-700 border border-blue-100";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Explorer
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getMetalLevelStyles(plan.MetalLevel)}`}
            >
              {plan.MetalLevel} Level
            </span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {plan.PlanType} REGISTRY
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0F172A] leading-tight mb-2">
            {plan.PlanVariantMarketingName}
          </h1>
          <p className="text-base text-slate-500 font-medium">
            {plan.IssuerMarketPlaceMarketingName}
          </p>
        </div>
        <div className="flex items-center">
          <a
            href={plan.URLForSummaryofBenefitsCoverage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2.5 px-6 py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <span className="text-sm">
              Summary of Benefits and Coverage (SBC)
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col">
          <Section title="Coverage & Cost Mapping" icon={Layers}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <DetailItem
                label="TEHB Individual Deductible"
                value={plan.TEHBDedInnTier1Individual}
              />
              <DetailItem
                label="TEHB Family (Per Person)"
                value={plan.TEHBDedInnTier1FamilyPerPerson}
              />
              <DetailItem
                label="TEHB Family (Per Group)"
                value={plan.TEHBDedInnTier1FamilyPerGroup}
              />
              <DetailItem
                label="TEHB Tier 1 Coinsurance"
                value={plan.TEHBDedInnTier1Coinsurance}
              />
              <DetailItem
                label="Individual MOOP Limit"
                value={plan.TEHBInnTier1IndividualMOOP}
              />
              <DetailItem
                label="Family MOOP (Per Person)"
                value={plan.TEHBInnTier1FamilyPerPersonMOOP}
              />
              <DetailItem
                label="Total Covered Benefits"
                value={plan.CoveredBenefitCount}
              />
              <DetailItem
                label="Base Benefit Mapping"
                value={plan.BenefitCount}
              />
            </div>
          </Section>

          <Section title="Dataset Specifications" icon={Shield}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <DetailItem
                label="StandardComponentId"
                value={plan.StandardComponentId}
              />
              <DetailItem
                label="Registry Business Year"
                value={plan.BusinessYear}
              />
              <DetailItem
                label="Market Coverage Tier"
                value={plan.MarketCoverage}
              />
              <DetailItem label="IsNewPlan Record" value={plan.IsNewPlan} />
              <DetailItem label="System Import Date" value={plan.ImportDate} />
              <DetailItem
                label="Technical Source Name"
                value={plan.SourceName}
              />
              <DetailItem label="Network Identifier" value={plan.NetworkId} />
              <DetailItem
                label="Service Area Identifier"
                value={plan.ServiceAreaId}
              />
            </div>
          </Section>

          <Section title="External References & Documents" icon={LinkIcon}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <ExternalLinkItem
                label="Tech POC Email"
                url={`https://mail.google.com/mail/?view=cm&to=${plan.Tech_POC_Email}`}
                icon={Mail}
              />
              <ExternalLinkItem
                label="Enrollment Payment"
                url={plan.URLForEnrollmentPayment}
                icon={CreditCard}
              />
              <ExternalLinkItem
                label="Formulary (Drug List)"
                url={plan.FormularyURL}
                icon={Globe}
              />
              <ExternalLinkItem
                label="Plan Brochure"
                url={plan.PlanBrochure}
                icon={FileText}
              />
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <Section title="Benefit Summary (SBC)" icon={FileCheck}>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl shadow-sm">
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.1em] mb-3">
                  Managing diabetes
                </p>
                <div className="space-y-1">
                  <SBCField
                    label="Deductible"
                    value={plan.SBCHavingDiabetesDeductible}
                  />
                  <SBCField
                    label="Copayment"
                    value={plan.SBCHavingDiabetesCopayment}
                  />
                  <SBCField
                    label="Coinsurance"
                    value={plan.SBCHavingDiabetesCoinsurance}
                  />
                  <SBCField label="Limit" value={plan.SBCHavingDiabetesLimit} />
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl shadow-sm">
                <p className="text-[11px] font-bold text-amber-600 uppercase tracking-[0.1em] mb-3">
                  Simple fracture
                </p>
                <div className="space-y-1">
                  <SBCField
                    label="Deductible"
                    value={plan.SBCHavingSimplefractureDeductible}
                  />
                  <SBCField
                    label="Copayment"
                    value={plan.SBCHavingSimplefractureCopayment}
                  />
                  <SBCField
                    label="Coinsurance"
                    value={plan.SBCHavingSimplefractureCoinsurance}
                  />
                  <SBCField
                    label="Limit"
                    value={plan.SBCHavingSimplefractureLimit}
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Network Rules" icon={Clipboard}>
            <div className="space-y-1">
              <DetailItem
                label="NATIONAL NETWORK"
                value={plan.NationalNetwork}
              />
              <DetailItem label="HSA ELIGIBLE" value={plan.IsHSAEligible} />
              <DetailItem
                label="REFERRAL REQUIRED"
                value={plan.IsReferralRequiredForSpecialist}
              />
              <DetailItem
                label="SPECIALIST REFERRAL RULE"
                value={plan.SpecialistRequiringReferral}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;
