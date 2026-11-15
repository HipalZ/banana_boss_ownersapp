export interface ReportPagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface PagedReport<T> {
  data: T[];
  pagination: ReportPagination;
  totals?: Record<string, number | string>;
}

export type DateRangePreset = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export interface DateRangeValue {
  from: number;
  to: number;
  preset: DateRangePreset;
}
