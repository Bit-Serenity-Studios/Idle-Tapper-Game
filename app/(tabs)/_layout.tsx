import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/ui/theme';

/**
 * Bottom tab navigation. Icons are alchemical-style unicode glyphs rendered
 * as tinted text — no external icon assets, no PNGs, keeps the aesthetic.
 */
export default function TabsLayout(): JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: colors.parchment,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.parchmentFaint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => <Glyph char="🜍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="grimoire"
        options={{
          title: 'Grimoire',
          tabBarIcon: ({ color }) => <Glyph char="🜛" color={color} />,
        }}
      />
      <Tabs.Screen
        name="great-work"
        options={{
          title: 'The Work',
          tabBarIcon: ({ color }) => <Glyph char="☿" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ledger"
        options={{
          title: 'Ledger',
          tabBarIcon: ({ color }) => <Glyph char="🜎" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Glyph char="🜚" color={color} />,
        }}
      />
    </Tabs>
  );
}

function Glyph({ char, color }: { char: string; color: string }): JSX.Element {
  return (
    <View style={styles.glyphWrap}>
      <Text style={[styles.glyph, { color }]}>{char}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.ink,
    borderBottomColor: colors.goldFaint,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0,
    elevation: 0,
  },
  headerTitle: {
    fontFamily: typography.serif,
    fontSize: 18,
    letterSpacing: 2,
    color: colors.parchment,
    textTransform: 'uppercase',
  },
  tabBar: {
    backgroundColor: colors.inkDeep,
    borderTopColor: colors.goldFaint,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 68,
    paddingTop: 6,
    paddingBottom: 10,
  },
  tabLabel: {
    fontFamily: typography.serif,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  glyphWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 20,
  },
});
