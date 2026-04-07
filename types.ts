export interface InsurancePlan {
  // Core Identifiers
  BusinessYear: number;
  StateCode: string;
  IssuerId: number;
  IssuerMarketPlaceMarketingName: string;
  SourceName: string;
  ImportDate: string;
  StandardComponentId: string;
  PlanMarketingName: string;
  HIOSProductId: string;
  NetworkId: string;
  ServiceAreaId: string;
  FormularyId: string;
  IsNewPlan: 'Existing' | 'New';
  PlanId: string;
  PlanVariantMarketingName: string;

  // Plan Classification
  PlanType: string; // e.g., HMO
  MetalLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Expanded Bronze' | 'High' | 'Low' | 'Catastrophic';
  DesignType: string;
  UniquePlanDesign: 'Yes' | 'No';
  QHPNonQHPTypeld: string;

  // Beneficiary Rules
  MaximumUnderageDependent: number;
  DependentMaximumAgeRule: number;
  AgeDeterminationRule: string;
  MedicalDentalIndicator: string;
  DentalOnlyPlan: 'Yes' | 'No';
  MarketCoverage: string;

  // Coverage Limits & MOOP
  TEHBDedInnTier1Individual: string;
  TEHBDedInnTier1FamilyPerPerson: string;
  TEHBDedInnTier1FamilyPerGroup: string;
  TEHBDedInnTier1Coinsurance: string;
  TEHBInnTier1IndividualMOOP: string;
  TEHBInnTier1FamilyPerPersonMOOP: string;
  TEHBInnTier1FamilyPerGroupMOOP: string;
  
  // Specific Benefit Counts
  CoveredBenefitCount: number;
  BenefitCount: number;

  // Network & Eligibility
  NationalNetwork: 'Yes' | 'No';
  IsHSAEligible: 'Yes' | 'No';
  IsNoticeRequiredForPregnancy: 'Yes' | 'No';
  IsReferralRequiredForSpecialist: 'Yes' | 'No';
  SpecialistRequiringReferral: string;

  // External Resources
  FormularyURL: string;
  URLForEnrollmentPayment: string;
  PlanBrochure: string;
  URLForSummaryofBenefitsCoverage: string;
  
  // Service Area
  OutOfServiceAreaCoverageDescription: string;
  OutOfCountryCoverage: 'Yes' | 'No';
  OutOfCountryCoverageDescription: string;
  
  // Comparison Details (derived from screenshots)
  // Scenario: Having a Baby
  SBCHavingBabyDeductible: string;
  SBCHavingBabyCopayment: string;
  SBCHavingBabyCoinsurance: string;
  SBCHavingBabyLimit: string;
  
  // Scenario: Diabetes
  SBCHavingDiabetesDeductible: string;
  SBCHavingDiabetesCopayment: string;
  SBCHavingDiabetesCoinsurance: string;
  SBCHavingDiabetesLimit: string;
  
  // Scenario: Simple Fracture
  SBCHavingSimplefractureDeductible: string;
  SBCHavingSimplefractureCopayment: string;
  SBCHavingSimplefractureCoinsurance: string;
  SBCHavingSimplefractureLimit: string;
}

export type CategoryStat = {
  label: string;
  count: number;
};