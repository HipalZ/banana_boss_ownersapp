/**
 * DetailSheet — bottom-sheet metric breakdown (mirrors banana_boss web's
 * MetricCard "Detailed Analytics" slide-over). Tap a metric → see its parts.
 */
import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { colors, fonts, radii } from '@/theme';
import { formatINR } from '@/utils/currency';
import { AdaptiveValueText } from './AdaptiveValueText';

export interface DetailRow {
  label: string;
  value: number;
  direction?: 'positive' | 'negative' | 'neutral';
}

interface DetailSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  total?: number;
  rows: DetailRow[];
}

export function DetailSheet({ visible, onClose, title, total, rows }: DetailSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: colors.surface.overlay, justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}} style={{ maxHeight: '82%' }}>
          <View
            style={{
              backgroundColor: colors.surface.card,
              borderTopLeftRadius: radii.hero,
              borderTopRightRadius: radii.hero,
              paddingTop: 8,
              paddingBottom: 32,
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.surface.border,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
                Detailed Analytics
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: colors.text.base, marginTop: 2 }}>
                {title}
              </Text>
            </View>

            {total !== undefined && (
              <View
                style={{
                  marginHorizontal: 20,
                  backgroundColor: colors.surface.raised,
                  borderRadius: radii.card,
                  paddingVertical: 20,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Total
                </Text>
                <AdaptiveValueText
                  value={formatINR(total)}
                  baseFontSize={28}
                  minimumFontSize={20}
                  style={{ maxWidth: '100%', fontFamily: fonts.extrabold, color: colors.text.base, marginTop: 4 }}
                />
              </View>
            )}

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
              {rows.length === 0 ? (
                <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text.faint, textAlign: 'center', paddingVertical: 20 }}>
                  No breakdown available
                </Text>
              ) : (
                rows.map((r, i) => (
                  <View
                    key={`${r.label}-${i}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 14,
                      borderBottomWidth: i < rows.length - 1 ? 1 : 0,
                      borderBottomColor: colors.surface.border,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: colors.text.secondary }}>
                      {r.label}
                    </Text>
                    <AdaptiveValueText
                      value={formatINR(r.value)}
                      baseFontSize={15}
                      minimumFontSize={12}
                      style={{
                        maxWidth: '55%',
                        fontFamily: fonts.bold,
                        textAlign: 'right',
                        color:
                          r.direction === 'negative'
                            ? colors.danger
                            : r.direction === 'positive'
                              ? colors.success
                              : colors.text.base,
                      }}
                    />
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
