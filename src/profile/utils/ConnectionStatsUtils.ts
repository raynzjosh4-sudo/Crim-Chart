import { UserConnectionStatsModel } from '../models/CrimChartUserModel';

export const getStatusColor = (count: number) => {
  if (count <= 5) return '#10B981'; // Green
  if (count <= 15) return '#3B82F6'; // Blue
  if (count <= 30) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
};

export const getStatusText = (count: number) => {
  if (count <= 5) return 'Highly Selective';
  if (count <= 15) return 'Active';
  if (count <= 30) return 'Exploring';
  return 'Casting a Wide Net';
};
