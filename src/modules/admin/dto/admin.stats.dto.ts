export interface AdminDashboardStatsDto {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    activeStylists: number;
    totalCustomers: number;
    pendingEscrow: number;
  };
  revenueTrend: {
    label: string;
    revenue: number;
    bookings: number;
  }[];
  bookingStatusBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  topStylists: {
    id: string;
    name: string;
    avatar?: string | null;
    revenue: number;
    bookings: number;
    rating: number;
  }[];
  userGrowth: {
    label: string;
    customers: number;
    stylists: number;
  }[];
}

export interface AdminStatsQueryDto {
  period?: 'today' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}
