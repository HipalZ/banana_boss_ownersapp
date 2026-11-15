export const queryKeys = {
  outlets: {
    list: () => ['outlets', 'list'] as const,
  },
  bills: {
    dashboard: (outletId: string | null, from: number, to: number) =>
      ['bills', 'dashboard', outletId, from, to] as const,
    list: (outletId: string | null, from: number, to: number, page: number, limit: number, filters: object) =>
      ['bills', 'list', outletId, from, to, page, limit, filters] as const,
    byId: (billId: string | null) =>
      ['bills', 'detail', billId] as const,
    runningTables: (outletId: string | null) =>
      ['bills', 'running-tables', outletId] as const,
    tableKots: (outletId: string | null, tableId: string | null) =>
      ['bills', 'table-kots', outletId, tableId] as const,
    kotItems: (kotId: string | null) =>
      ['bills', 'kot-items', kotId] as const,
  },
  paymentModes: {
    list: (outletId: string | null) => ['payment-modes', outletId] as const,
  },
  duesUsers: {
    list: (outletId: string | null) => ['dues-users', outletId] as const,
  },
  npcUsers: {
    list: (outletId: string | null) => ['npc-users', outletId] as const,
  },
  areas: {
    dineIn: (outletId: string | null) => ['areas', 'dine-in', outletId] as const,
  },
  reports: {
    all: ['reports'] as const,
    netSales: (outletId: string | null, from: number, to: number) =>
      ['reports', 'net-sales', outletId, from, to] as const,
    billWise: (outletId: string | null, from: number, to: number, page: number) =>
      ['reports', 'bill-wise', outletId, from, to, page] as const,
    item: (outletId: string | null, from: number, to: number, page: number) =>
      ['reports', 'item', outletId, from, to, page] as const,
      category: (outletId: string | null, from: number, to: number, page: number) =>
        ['reports', 'category', outletId, from, to, page] as const,
      parentCategory: (outletId: string | null, from: number, to: number, page: number) =>
        ['reports', 'parent-category', outletId, from, to, page] as const,
      addon: (outletId: string | null, from: number, to: number, page: number) =>
        ['reports', 'addon', outletId, from, to, page] as const,
      itemType: (outletId: string | null, from: number, to: number, page: number) =>
        ['reports', 'item-type', outletId, from, to, page] as const,
      itemVariant: (outletId: string | null, from: number, to: number, page: number) =>
        ['reports', 'item-variant', outletId, from, to, page] as const,
      area: (outletId: string | null, from: number, to: number, page: number) =>
        ['reports', 'area', outletId, from, to, page] as const,
      areaItem: (outletId: string | null, from: number, to: number, page: number) =>
        ['reports', 'area-item', outletId, from, to, page] as const,
      discount: (outletId: string | null, from: number, to: number, page: number) =>
        ['reports', 'discount', outletId, from, to, page] as const,
    serviceCharge: (outletId: string | null, from: number, to: number, page: number) =>
      ['reports', 'service-charge', outletId, from, to, page] as const,
      table: (outletId: string | null, from: number, to: number, page: number) =>
        ['reports', 'table', outletId, from, to, page] as const,
    deletedKot: (outletId: string | null, from: number, to: number, page: number) =>
      ['reports', 'deleted-kot', outletId, from, to, page] as const,
    transferKot: (outletId: string | null, from: number, to: number, page: number) =>
      ['reports', 'transfer-kot', outletId, from, to, page] as const,
    transferTable: (outletId: string | null, from: number, to: number, page: number) =>
      ['reports', 'transfer-table', outletId, from, to, page] as const,
    outstandingDues: (outletId: string | null) =>
      ['reports', 'outstanding-dues', outletId] as const,
    openItem: (outletId: string | null, from: number, to: number, page: number) =>
      ['reports', 'open-item', outletId, from, to, page] as const,
    charge: (outletId: string | null, from: number, to: number) =>
      ['reports', 'charge', outletId, from, to] as const,
  },
};
