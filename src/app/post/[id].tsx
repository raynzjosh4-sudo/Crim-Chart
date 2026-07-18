import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { StandalonePostView } from '@/components/post/StandalonePostView';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export default function PostPage() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const router = useRouter();
  const styles = useStyles(themeStyles);
  const { t } = useTranslation();

  if (!id) return null;

  return (
    <View style={styles.container}>
      <ChartAppBar
        title={t('post', 'Post')}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        }}
      />
      <StandalonePostView
        postId={id}
        entityType={type || 'post'}
      />
    </View>
  );
}

const themeStyles = (colors: ThemeTokens, scale: number) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
};
