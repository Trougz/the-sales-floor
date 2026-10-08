/** Option lists for the forms. Values on the candidate side match the live intake form so the backend mapping stays 1:1. */

export const TARGET_ROLES = ['SDR', 'BDR', 'Account Executive', 'Sales Manager', 'Not sure yet'];

export const OTE_RANGES = ['$50k-$80k', '$80k-$110k', '$110k-$140k', '$140k-$250k', '$250k+'].map((value) => ({
  value,
  label: value.replace(/-/g, ' – '),
}));

export const WORK_STYLES = ['Remote', 'Hybrid', 'In-office'];

export const INDUSTRIES = ['SaaS', 'Fintech', 'Martech', 'Healthtech', 'Cybersecurity', 'HR Tech', 'Open to All'];

export const CRM_TOOLS = ['Salesforce', 'HubSpot', 'Apollo', 'Outreach', 'Gong', 'ZoomInfo'];

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

export const CA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories',
  'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
];

export const STATE_GROUPS = [
  { label: 'United States', options: US_STATES },
  { label: 'Canada', options: CA_PROVINCES },
];

// --- Company form ---
export const HIRING_ROLES = ['SDR', 'BDR', 'Account Executive', 'Sales Leadership', 'More than one / other'];

export const HIRE_COUNTS = ['1', '2–3', '4–6', '7+'];

export const HIRING_TIMELINES = ['As soon as possible', 'Within 30 days', '1–3 months', '3+ months', 'Just exploring'];

export const COMP_RANGES = [...OTE_RANGES.map((o) => o.label), 'Not sure yet'];

// --- Contact form ---
export const CONTACT_AUDIENCES = [
  { value: 'talent', label: "I'm sales talent" },
  { value: 'hiring', label: "I'm hiring" },
  { value: 'other', label: 'Something else' },
];
