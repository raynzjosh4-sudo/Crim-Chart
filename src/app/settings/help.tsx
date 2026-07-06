import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { AlertTriangle, ChevronRight, HelpCircle, MessageSquare, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export default function HelpPage() {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      flex: 1
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)'
    },
    leftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16
    },
    itemTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500'
    }
  }));
  const {
    t
  } = useTranslation();
  const HELP_ITEMS = [{
    id: 'report',
    title: t('report_problem'),
    icon: AlertTriangle
  }, {
    id: 'center',
    title: t('help_center'),
    icon: HelpCircle
  }, {
    id: 'privacy',
    title: t('privacy_security_help'),
    icon: ShieldCheck
  }, {
    id: 'support',
    title: t('support_requests'),
    icon: MessageSquare
  }];
  return <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('help')} showBack />

      <View style={styles.content}>
        <FlatList data={HELP_ITEMS} keyExtractor={item => item.id} renderItem={({
        item
      }) => {
        const Icon = item.icon;
        return <TouchableOpacity activeOpacity={1} style={styles.item} onPress={() => {}}>
                <View style={styles.leftRow}>
                  <Icon size={22} color={colors.text} />
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                <ChevronRight size={18} color="rgba(255, 255, 255, 0.3)" />
              </TouchableOpacity>;
      }} />
      </View>
    </SafeAreaView>;
}