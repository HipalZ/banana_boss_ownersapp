export type ReportsStackParamList = {
  ReportsOverview: undefined;
  NetSalesSummary: undefined;
  BillWiseReport: undefined;
  ItemSalesReport: undefined;
  CategorySalesReport: undefined;
  ParentCategoryReport: undefined;
  AddonSalesReport: undefined;
  ItemTypeReport: undefined;
  ItemVariantReport: undefined;
  AreaReport: undefined;
  AreaItemReport: undefined;
  DiscountReport: undefined;
  ServiceChargeReport: undefined;
  TableReport: undefined;
  DeletedKotReport: undefined;
  TransferKotReport: undefined;
  TransferTableReport: undefined;
  OutstandingDues: undefined;
  OpenItemSales: undefined;
};

export type BillingStackParamList = {
  BillingOverview: undefined;
  SalesDashboard: undefined;
  BillsList: undefined;
  BillDetail: { billId: string };
  PaymentModes: undefined;
  Dues: undefined;
  Npc: undefined;
};

export type SettingsStackParamList = {
  SettingsOverview: undefined;
  OutletSelector: undefined;
};

export type WhatsappStackParamList = {
  WhatsappCustomers: undefined;
};

export type OutletAdminStackParamList = {
  AllOutlets: undefined;
};

export type AppTabsParamList = {
  ReportsTab: undefined;
  BillingTab: undefined;
  WhatsappTab: undefined;
  SettingsTab: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
