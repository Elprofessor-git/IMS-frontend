export interface IStatCard {
  value: number | string;
  label: string;
  icon: string;
  color: string;
  percentage?: number;
  change?: 'increase' | 'decrease';
}

export interface IRecentActivity {
  id: string;
  type: 'vente' | 'achat' | 'ajustement';
  description: string;
  timestamp: Date;
  user: string;
  details: any;
}

export interface IStockAlert {
  id: string;
  productName: string;
  currentStock: number;
  alertThreshold: number;
  severity: 'low' | 'critical';
}

export interface ISalesChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
  }[];
}

export interface IDashboardData {
  stats: StatCard[];
  salesChart: SalesChartData;
  stockAlerts: StockAlert[];
  recentActivities: RecentActivity[];
}




// Auto-generated aliases for backward compatibility
export type StatCard = IStatCard;
export type RecentActivity = IRecentActivity;
export type StockAlert = IStockAlert;
export type SalesChartData = ISalesChartData;
export type DashboardData = IDashboardData;
