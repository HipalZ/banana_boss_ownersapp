import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DateRangePreset = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export interface DateRangeValue {
  from: number;
  to: number;
  preset: DateRangePreset;
  /** Exact local clock times were selected for a custom range. */
  customTime?: boolean;
}

export interface BillingFilters {
  billNo: string;
  tableNo: string;
  customerName: string;
  mobile: string;
  totalMin: string;
  totalMax: string;
  status: string;
  paymentMethod: string;
  areaId: string;
}

export const EMPTY_BILLING_FILTERS: BillingFilters = {
  billNo: '',
  tableNo: '',
  customerName: '',
  mobile: '',
  totalMin: '',
  totalMax: '',
  status: 'ALL',
  paymentMethod: 'ALL',
  areaId: 'ALL',
};

interface AppState {
  selectedBusiness: string | null;
  setSelectedBusiness: (id: string | null) => void;

  /**
   * For the email/admin session only: whether the admin has drilled into a
   * single outlet (→ full tabbed app) vs. sitting on the all-outlets universal
   * view. Not persisted, so a fresh launch always lands on All Outlets.
   */
  adminInOutlet: boolean;
  setAdminInOutlet: (value: boolean) => void;

  reportsDateRange: DateRangeValue;
  setReportsDateRange: (range: DateRangeValue) => void;

  feedbackDateRange: DateRangeValue;
  setFeedbackDateRange: (range: DateRangeValue) => void;

  whatsappDateRange: DateRangeValue;
  setWhatsappDateRange: (range: DateRangeValue) => void;

  billingDateRange: DateRangeValue;
  setBillingDateRange: (range: DateRangeValue) => void;

  billingFilters: BillingFilters;
  setBillingFilters: (filters: BillingFilters) => void;
  resetBillingFilters: () => void;

  activeReportItem: string | null;
  setActiveReportItem: (item: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedBusiness: null,
      setSelectedBusiness: (id) => set({ selectedBusiness: id }),

      adminInOutlet: false,
      setAdminInOutlet: (value) => set({ adminInOutlet: value }),

      reportsDateRange: {
        from: (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); })(),
        to: (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); })(),
        preset: 'today',
      },
      setReportsDateRange: (range) => set({ reportsDateRange: range }),

      feedbackDateRange: {
        from: (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); })(),
        to: (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); })(),
        preset: 'today',
      },
      setFeedbackDateRange: (range) => set({ feedbackDateRange: range }),

      whatsappDateRange: {
        from: (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); })(),
        to: (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); })(),
        preset: 'today',
      },
      setWhatsappDateRange: (range) => set({ whatsappDateRange: range }),

      billingDateRange: {
        from: (() => { const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1); return d.getTime(); })(),
        to: (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); })(),
        preset: 'this_month',
      },
      setBillingDateRange: (range) => set({ billingDateRange: range }),

      billingFilters: EMPTY_BILLING_FILTERS,
      setBillingFilters: (filters) => set({ billingFilters: filters }),
      resetBillingFilters: () => set({ billingFilters: EMPTY_BILLING_FILTERS }),

      activeReportItem: null,
      setActiveReportItem: (item) => set({ activeReportItem: item }),
    }),
    {
      name: 'banana-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedBusiness: state.selectedBusiness,
        billingFilters: state.billingFilters,
      }),
    },
  ),
);
