import { ownerArtwork } from '@/theme/ownerArtwork';
import React from 'react';
import { Image, View } from 'react-native';

type Atlas = 'financial' | 'operations';
type Cell = { atlas: Atlas; row: number; col: number };

const artwork: Record<string, Cell> = {
  'shopping-bag': { atlas: 'financial', row: 0, col: 0 },
  'file-text': { atlas: 'financial', row: 0, col: 1 },
  hash: { atlas: 'financial', row: 0, col: 1 },
  percent: { atlas: 'financial', row: 0, col: 2 },
  'trending-down': { atlas: 'financial', row: 0, col: 2 },
  gift: { atlas: 'financial', row: 1, col: 0 },
  briefcase: { atlas: 'financial', row: 1, col: 1 },
  bell: { atlas: 'financial', row: 1, col: 2 },
  smile: { atlas: 'financial', row: 2, col: 0 },
  'dollar-sign': { atlas: 'financial', row: 2, col: 1 },
  'trending-up': { atlas: 'financial', row: 2, col: 2 },
  layers: { atlas: 'operations', row: 0, col: 0 },
  grid: { atlas: 'operations', row: 0, col: 0 },
  list: { atlas: 'operations', row: 0, col: 0 },
  tag: { atlas: 'operations', row: 0, col: 0 },
  unlock: { atlas: 'operations', row: 0, col: 0 },
  package: { atlas: 'operations', row: 0, col: 1 },
  box: { atlas: 'operations', row: 0, col: 1 },
  users: { atlas: 'operations', row: 0, col: 2 },
  layout: { atlas: 'operations', row: 1, col: 0 },
  'trash-2': { atlas: 'operations', row: 1, col: 1 },
  truck: { atlas: 'operations', row: 1, col: 2 },
  'plus-circle': { atlas: 'operations', row: 2, col: 0 },
  shuffle: { atlas: 'operations', row: 2, col: 1 },
  'arrow-right-circle': { atlas: 'operations', row: 2, col: 1 },
  'alert-circle': { atlas: 'operations', row: 2, col: 2 },
};

const sources = {
  financial: ownerArtwork.reportMetricsAtlas,
  operations: ownerArtwork.reportOperationsAtlas,
};

export function MetricIllustration({ icon }: { icon: string }) {
  const cell = artwork[icon] ?? artwork['file-text'];
  const size = cell.atlas === 'financial' ? { width: 32, height: 32 } : { width: 36, height: 26 };

  return (
    <View style={{ width: 36, height: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ width: size.width, height: size.height, overflow: 'hidden' }}>
        <Image
          source={sources[cell.atlas]}
          resizeMode="stretch"
          style={{
            position: 'absolute',
            width: size.width * 3,
            height: size.height * 3,
            left: -cell.col * size.width,
            top: -cell.row * size.height,
          }}
        />
      </View>
    </View>
  );
}
