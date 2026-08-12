export type TrustBadgeIcon =
  | "regulator"
  | "industry"
  | "reviews"
  | "compliance"
  | "age";

export interface SitewideTrustBadge {
  category: string;
  value: string;
  icon: TrustBadgeIcon;
}

export const SITEWIDE_TRUST_STRIP = {
  heading: "Accredited where it counts",
  subtext:
    "Independently regulated, age-verified and reviewed — not self-awarded badges.",
} as const;

export const SITEWIDE_TRUST_BADGES: SitewideTrustBadge[] = [
  { category: "REGULATOR", value: "MHRA Notified", icon: "regulator" },
  { category: "INDUSTRY BODY", value: "UKVIA", icon: "industry" },
  { category: "REVIEWS", value: "Trustpilot", icon: "reviews" },
  { category: "COMPLIANCE", value: "TPD & TRPR", icon: "compliance" },
  { category: "AGE", value: "Challenge 25", icon: "age" },
];
