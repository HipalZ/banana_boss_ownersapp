import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ReportsStackParamList } from '@/types/navigation';
import { ReportsOverviewScreen } from '@/screens/Reports/ReportsOverviewScreen';
import { NetSalesSummaryScreen } from '@/screens/Reports/NetSalesSummaryScreen';
import { BillWiseReportScreen } from '@/screens/Reports/BillWiseReportScreen';
import { ItemSalesReportScreen } from '@/screens/Reports/ItemSalesReportScreen';
import { CategorySalesReportScreen } from '@/screens/Reports/CategorySalesReportScreen';
import { ParentCategorySalesScreen } from '@/screens/Reports/ParentCategorySalesScreen';
import { AddonSalesReportScreen } from '@/screens/Reports/AddonSalesReportScreen';
import { ItemTypeReportScreen } from '@/screens/Reports/ItemTypeReportScreen';
import { ItemVariantReportScreen } from '@/screens/Reports/ItemVariantReportScreen';
import { AreaReportScreen } from '@/screens/Reports/AreaReportScreen';
import { AreaItemReportScreen } from '@/screens/Reports/AreaItemReportScreen';
import { DiscountReportScreen } from '@/screens/Reports/DiscountReportScreen';
import { ServiceChargeReportScreen } from '@/screens/Reports/ServiceChargeReportScreen';
import { TableReportScreen } from '@/screens/Reports/TableReportScreen';
import { DeletedKotReportScreen } from '@/screens/Reports/DeletedKotReportScreen';
import { TransferKotReportScreen } from '@/screens/Reports/TransferKotReportScreen';
import { TransferTableReportScreen } from '@/screens/Reports/TransferTableReportScreen';
import { OutstandingDuesScreen } from '@/screens/Reports/OutstandingDuesScreen';
import { OpenItemSalesScreen } from '@/screens/Reports/OpenItemSalesScreen';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<ReportsStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.surface.canvas },
  animation: 'slide_from_right' as const,
};

export function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ReportsOverview" component={ReportsOverviewScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="NetSalesSummary" component={NetSalesSummaryScreen} options={{ title: 'Net Sales Summary' }} />
      <Stack.Screen name="BillWiseReport" component={BillWiseReportScreen} options={{ title: 'Bill-wise Report' }} />
      <Stack.Screen name="ItemSalesReport" component={ItemSalesReportScreen} options={{ title: 'Item Sales' }} />
      <Stack.Screen name="CategorySalesReport" component={CategorySalesReportScreen} options={{ title: 'Category Sales' }} />
      <Stack.Screen name="ParentCategoryReport" component={ParentCategorySalesScreen} options={{ title: 'Parent Category' }} />
      <Stack.Screen name="AddonSalesReport" component={AddonSalesReportScreen} options={{ title: 'Addon Sales' }} />
      <Stack.Screen name="ItemTypeReport" component={ItemTypeReportScreen} options={{ title: 'Item Type' }} />
      <Stack.Screen name="ItemVariantReport" component={ItemVariantReportScreen} options={{ title: 'Item Variant' }} />
      <Stack.Screen name="AreaReport" component={AreaReportScreen} options={{ title: 'Area Report' }} />
      <Stack.Screen name="AreaItemReport" component={AreaItemReportScreen} options={{ title: 'Area-Item Sales' }} />
      <Stack.Screen name="DiscountReport" component={DiscountReportScreen} options={{ title: 'Discount Report' }} />
      <Stack.Screen name="ServiceChargeReport" component={ServiceChargeReportScreen} options={{ title: 'Service Charge' }} />
      <Stack.Screen name="TableReport" component={TableReportScreen} options={{ title: 'Table Report' }} />
      <Stack.Screen name="DeletedKotReport" component={DeletedKotReportScreen} options={{ title: 'Deleted KOT' }} />
      <Stack.Screen name="TransferKotReport" component={TransferKotReportScreen} options={{ title: 'Transfer KOT' }} />
      <Stack.Screen name="TransferTableReport" component={TransferTableReportScreen} options={{ title: 'Transfer Table' }} />
      <Stack.Screen name="OutstandingDues" component={OutstandingDuesScreen} options={{ title: 'Outstanding Dues' }} />
      <Stack.Screen name="OpenItemSales" component={OpenItemSalesScreen} options={{ title: 'Open Item Sales' }} />
    </Stack.Navigator>
  );
}
