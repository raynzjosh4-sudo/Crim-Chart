import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useTranslation } from '@/core/localization/i18n';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { SettingsItem } from '@/features/settings/components/SettingsItem';
import { useRouter } from 'expo-router';
import {
  Ban, Camera,
  DownloadCloud,
  EyeOff,
  Globe,
  Info,
  LifeBuoy,
  Lock,
  Maximize,
  MessageCircle,
  MinusCircle,
  Palette,
  RefreshCw,
  Send,
  Type, UserCheck, UserPlus
} from 'lucide-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsPage({ isSplitPane = false }: { isSplitPane?: boolean }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { startLoading, stopLoading } = useGlobalProgress();

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderDivider = () => <View style={styles.divider} />;

  return (
    <SafeAreaView style={styles.container}>
      <ChartAppBar title={t('settings')} showBack={!isSplitPane} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderSectionHeader(t('who_can_see_content'))}
        <SettingsItem
          icon={UserCheck}
          title={t('connection_privacy' as any, { defaultValue: 'Connection Privacy' })}
          onTap={() => router.push('/settings/connection-privacy' as any)}
        />
        <SettingsItem
          icon={Lock}
          title={t('account_privacy' as any, { defaultValue: 'Account Privacy' })}
          trailingText={t('public')}
          onTap={() => router.push('/settings/privacy' as any)}
        />
        <SettingsItem
          icon={EyeOff}
          title={t('box_visibility' as any, { defaultValue: 'Box Visibility' })}
          onTap={() => router.push('/settings/box-visibility' as any)}
        />
        <SettingsItem
          icon={Ban}
          title={t('blocked' as any)}
          onTap={() => router.push('/settings/blocked' as any)}
        />
        <SettingsItem
          icon={Camera}
          title={t('hide_story')}
          onTap={() => { }}
        />
        <SettingsItem
          icon={EyeOff}
          title={t('visibility_off_Chart')}
          onTap={() => { }}
        />

        {renderDivider()}

        {renderSectionHeader(t('how_others_interact'))}
        {/* <SettingsItem
          icon={Send}
          title={t('messages_story_reuse')}
          onTap={() => { }}
        />
        <SettingsItem
          icon={MessageCircle}
          title={t('comments')}
          onTap={() => { }}
        />
        <SettingsItem
          icon={RefreshCw}
          title={t('sharing_reuse')}
          onTap={() => { }}
        />
        <SettingsItem
          icon={MinusCircle}
          title={t('restricted_channels')}
          onTap={() => { }}
        />
        <SettingsItem
          icon={Type}
          title={t('hidden_words')}
          onTap={() => { }}
        />
        <SettingsItem
          icon={UserCheck}
          title={t('contacts_syncing')}
          onTap={() => { }}
        />
        <SettingsItem
          icon={UserPlus}
          title={t('join_invite')}
          onTap={() => { }}
        /> */}

        {renderDivider()}

        {renderSectionHeader(t('app_and_media'))}
        <SettingsItem
          icon={Palette}
          title={t('theme')}
          onTap={() => router.push('/settings/theme' as any)}
        />
        <SettingsItem
          icon={Maximize}
          title={t('display_text_size' as any, { defaultValue: 'Text Size' })}
          onTap={() => router.push('/settings/display' as any)}
        />
        {/* <SettingsItem
          icon={Globe}
          title={t('language')}
          onTap={() => router.push('/settings/localization' as any)}
        />
        <SettingsItem
          icon={RefreshCw}
          title={t('data_saver')}
          onTap={() => router.push('/settings/data-saver' as any)}
        /> */}
        <SettingsItem
          icon={DownloadCloud}
          title={t('download_data')}
          onTap={() => { }}
        />

        {renderDivider()}

        {renderSectionHeader(t('more_info_support'))}
        <SettingsItem
          icon={LifeBuoy}
          title={t('help')}
          onTap={() => router.push('/settings/help' as any)}
        />
        <SettingsItem
          icon={Info}
          title={t('about')}
          onTap={() => router.push('/settings/about' as any)}
        />

        {renderDivider()}

        {renderSectionHeader(t('login'))}
        <TouchableOpacity activeOpacity={1} style={styles.textButton}>
          <Text style={[styles.textButtonLabel, { color: colors.primary }]}>{t('add_account')}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} style={styles.textButton}>
          <Text style={[styles.textButtonLabel, { color: colors.primary }]}>{t('switch_account')}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1}
          style={styles.textButton}
          onPress={async () => {
            try {
              startLoading();
              await useAuthStore.getState().signOut();
              router.replace('/landing');
            } catch (e) {
              console.error(e);
            } finally {
              stopLoading();
            }
          }}
        >
          <Text style={[styles.textButtonLabel, { color: '#FF453A' }]}>{t('log_out')}</Text>
        </TouchableOpacity>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 16,
  },
  textButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerSpacer: {
    height: 60,
  },
});
