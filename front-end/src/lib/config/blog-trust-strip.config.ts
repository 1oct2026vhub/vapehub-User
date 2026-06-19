export interface SitewideTrustBadge {
  category: string;
  value: string;
}

export const SITEWIDE_TRUST_STRIP = {
  heading: "Accredited where it counts",
  subtext:
    "Independently regulated, age-verified and reviewed — not self-awarded badges.",
} as const;

export const SITEWIDE_TRUST_BADGES: SitewideTrustBadge[] = [
  { category: "REGULATOR", value: "MHRA Notified" },
  { category: "INDUSTRY BODY", value: "UKVIA Member" },
  { category: "REVIEWS", value: "Trustpilot" },
  { category: "COMPLIANCE", value: "TPD & TRPR" },
  { category: "AGE", value: "Challenge 25" },
];
