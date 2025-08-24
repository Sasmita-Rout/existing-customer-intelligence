
export interface Source {
  uri: string;
  title: string;
}

export interface TechDistributionItem {
  tech: string;
  percentage: number;
}

export interface RevenueDataPoint {
  period: string;
  revenue: number;
}

export interface FinancialMetric {
    metric: string;
    value: string;
}

export interface OpenPosition {
  title: string;
  link: string;
  source: string;
  datePosted: string;
  region: string;
}

export interface DigestData {
  id: string;
  companyName: string;
  overview: string;
  keyHighlights: string[];
  keyFinancials: FinancialMetric[];
  revenueGrowth: RevenueDataPoint[];
  quarterlyReleases: string[];
  newsAndPressReleases: string[];
  newJoiners: string[];
  techFocus: string;
  techDistribution: TechDistributionItem[];
  strategicAndHiringInsights: string;
  openPositions: OpenPosition[];
  attentionPointsForAccionlabs: string[];
  sources: Source[];
}