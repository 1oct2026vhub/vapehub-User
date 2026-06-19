/** Toggle off when every article has CMS callout markers or inline warehouse blocks. */
export const BLOG_WAREHOUSE_CALLOUT_TEST_MODE = true;

export const DEFAULT_WAREHOUSE_CALLOUT = {
  label: "FROM OUR WAREHOUSE",
  title: "We rotate stock by batch code — here's what ages fastest.",
  bodyHtml: `<p>VapeHub turns over thousands of bottles a week, so we see exactly which liquids age first in the real world. <a href="/e-liquids">Pre-nicotined 10mg and 20mg nic salts</a> tend to flatten in flavour first; shortfills you nic-shot at home hold up longest because the nicotine isn't introduced until the day you open the bottle.</p>`,
} as const;
