export const dashboardMetrics = [
  {
    id: 'active-passports',
    label: 'Active Passports',
    value: '1,284',
    unit: '',
    subtext: 'across all brands',
    trend: 'up',
    trendValue: '',
    color: 'green'
  },
  {
    id: 'resales-completed',
    label: 'Resales Completed',
    value: '312',
    unit: '',
    subtext: '+28% vs last quarter',
    trend: 'up',
    trendValue: '',
    color: 'green'
  },
  {
    id: 'co2-saved',
    label: 'CO2 Saved (kg)',
    value: '2,847',
    unit: '',
    subtext: 'vs buying new',
    trend: 'up',
    trendValue: '',
    color: 'green'
  },
  {
    id: 'avg-product-score',
    label: 'Avg Product Score',
    value: '78/100',
    unit: '',
    subtext: 'sustainability score',
    trend: 'up',
    trendValue: '',
    color: 'green'
  },
  {
    id: 'new-customers',
    label: 'New Customers',
    value: '186',
    unit: '',
    subtext: 'via resale, zero cost',
    trend: 'up',
    trendValue: '',
    color: 'green'
  },
  {
    id: 'store-credit',
    label: 'Store Credit Issued',
    value: '$14,200',
    unit: '',
    subtext: 'redeemed this quarter',
    trend: 'down',
    trendValue: '',
    color: 'red'
  }
];

export const resaleActivityData = [
  { name: 'Jan', value: 18 },
  { name: 'Feb', value: 24 },
  { name: 'Mar', value: 19 },
  { name: 'Apr', value: 32 },
  { name: 'May', value: 28 },
  { name: 'Jun', value: 41 },
  { name: 'Jul', value: 38 },
  { name: 'Aug', value: 52 },
  { name: 'Sep', value: 48 },
];

export const scoreDistribution = [
  { label: '90 – 100 Excellent', percentage: 22, count: 283, color: '#2DB46D' },
  { label: '75 – 89 Good', percentage: 38, count: 488, color: '#82CA9D' },
  { label: '60 – 74 Fair', percentage: 28, count: 360, color: '#F59E0B' },
  { label: 'Below 60 Needs care', percentage: 12, count: 154, color: '#E63946' },
];

export const passportActivity = [
  { product: 'Cast Iron Skillet', brand: 'WS', event: 'Resold', owner: '2nd owner', score: 91, date: 'Apr 3' },
  { product: 'Linen Sofa 2-Seat', brand: 'PB', event: 'Claimed', owner: '1st owner', score: 84, date: 'Apr 3' },
  { product: 'Dining Chair Set', brand: 'WE', event: 'Recycled', owner: '-', score: 68, date: 'Apr 2' },
  { product: 'Table Lamp', brand: 'WE', event: 'Resold', owner: '2nd owner', score: 77, date: 'Apr 2' },
  { product: 'Casserole 5Qt', brand: 'WS', event: 'Claimed', owner: '1st owner', score: 95, date: 'Apr 1' },
  { product: 'Throw Blanket', brand: 'PB', event: 'Resold', owner: '3rd owner', score: 72, date: 'Apr 1' },
];

export const complianceChecklist = [
  { label: 'Material origin logged', checked: true },
  { label: 'Carbon footprint per SKU', checked: true },
  { label: 'Repairability score', checked: true },
  { label: 'End-of-life guidance', checked: true },
  { label: 'Ownership transfer records', checked: true },
  { label: 'Recycler audit trail', checked: false },
];

export const brandDistribution = [
  { brand: 'Williams Sonoma', count: 421, percentage: 33 },
  { brand: 'Pottery Barn', count: 318, percentage: 25 },
  { brand: 'West Elm', count: 284, percentage: 22 },
  { brand: 'PB Kids', count: 156, percentage: 12 },
  { brand: 'Other brands', count: 105, percentage: 8 },
];

export const lifecycleData = [
  { stage: 'Active (1st owner)', count: 782, color: '#2DB46D' },
  { stage: '2nd life (resold)', count: 312, color: '#888888' },
  { stage: '3rd+ life', count: 89, color: '#AAAAAA' },
  { stage: 'Recycled', count: 101, color: '#CCCCCC' },
];

export const rewardActivity = [
  { label: 'Total points issued', value: '284,000 pts' },
  { label: 'Store credit redeemed', value: '$14,200' },
  { label: 'Charity donations', value: '$2,840' },
  { label: 'Green badges awarded', value: '101' },
  { label: 'Avg pts per customer', value: '221 pts' },
];
