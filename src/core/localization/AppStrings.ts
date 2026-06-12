// Preserving original file imports without changing module file names
import { AppBaseTranslations } from './app_base_translations';
import { InfoSheetTranslations } from '../../settings/localization/chartdialog/info_sheet_translations';
import {
    LandingPageTranslations,
    MobileNumberTranslations,
    CountrySelectorTranslations,
    GoogleSignInTranslations,
    NamePageTranslations,
    BirthdayPageTranslations,
    ChartTitleTranslations,
    ProfilePictureTranslations,
    PasswordPageTranslations,
    SettingsTranslations,
    AccountPrivacyTranslations,
    BlockedTranslations,
    HideStoryTranslations,
    VisibilityOffChartTranslations,
    MessagesRepliesTranslations,
    ActivityStatusTranslations,
    DeliverRequestsTranslations,
    CommentControlsTranslations,
    PrivacySettingsMoreTranslations,
    DeepSettingsTranslations,
    InfoHelpTranslations,
    ProfileTranslations,
    EditProfileTranslations,
    PersonalInfoTranslations,
    PhotoEditTranslations,
    ChannelsTranslations,
    SearchTranslations,
    ChannelDetailsTranslations,
    ChannelPageTranslations,
    ChannelSettingsTranslations,
    PostTranslations,
    VideoTranslations,
    ChartOptionsTranslations,
    OnboardingTranslations,
    LoginTranslations,
    AccountSelectorTranslations,
} from '../../settings/localization/localization';

export class AppStrings {
    // Private getter mirroring Dart's _baseTranslations
    private static get _baseTranslations(): Record<string, Record<string, string>> {
        return AppBaseTranslations.translations;
    }

    // Primary dictionary compilation matrix
    public static get translations(): Record<string, Record<string, string>> {
        const merged: Record<string, Record<string, string>> = {};

        // Gathers unique locale keys across all feature manifests (Replaces Dart's Spread Set)
        const locales = new Set([
            ...Object.keys(AppStrings._baseTranslations),
            ...Object.keys(LandingPageTranslations.translations),
            ...Object.keys(MobileNumberTranslations.translations),
            ...Object.keys(CountrySelectorTranslations.translations),
            ...Object.keys(GoogleSignInTranslations.translations),
            ...Object.keys(NamePageTranslations.translations),
            ...Object.keys(BirthdayPageTranslations.translations),
            ...Object.keys(NamePageTranslations.translations),
            ...Object.keys(ChartTitleTranslations.translations),
            ...Object.keys(ProfilePictureTranslations.translations),
            ...Object.keys(PasswordPageTranslations.translations),
            ...Object.keys(SettingsTranslations.translations),
            ...Object.keys(AccountPrivacyTranslations.translations),
            ...Object.keys(BlockedTranslations.translations),
            ...Object.keys(HideStoryTranslations.translations),
            ...Object.keys(VisibilityOffChartTranslations.translations),
            ...Object.keys(MessagesRepliesTranslations.translations),
            ...Object.keys(ActivityStatusTranslations.translations),
            ...Object.keys(DeliverRequestsTranslations.translations),
            ...Object.keys(CommentControlsTranslations.translations),
            ...Object.keys(PrivacySettingsMoreTranslations.translations),
            ...Object.keys(DeepSettingsTranslations.translations),
            ...Object.keys(InfoHelpTranslations.translations),
            ...Object.keys(ProfileTranslations.translations),
            ...Object.keys(EditProfileTranslations.translations),
            ...Object.keys(PersonalInfoTranslations.translations),
            ...Object.keys(PhotoEditTranslations.translations),
            ...Object.keys(ChannelsTranslations.translations),
            ...Object.keys(SearchTranslations.translations),
            ...Object.keys(ChannelDetailsTranslations.translations),
            ...Object.keys(ChannelPageTranslations.translations),
            ...Object.keys(ChannelSettingsTranslations.translations),
            ...Object.keys(PostTranslations.translations),
            ...Object.keys(VideoTranslations.translations),
            ...Object.keys(ChartOptionsTranslations.translations),
            ...Object.keys(OnboardingTranslations.translations),
            ...Object.keys(LoginTranslations.translations),
            ...Object.keys(AccountSelectorTranslations.translations),
            ...Object.keys(InfoSheetTranslations.translations),
        ]);

        // Runs a deep cascade object combination for every unique local code detected
        locales.forEach((locale) => {
            merged[locale] = {
                ...(AppStrings._baseTranslations[locale] || {}),
                ...(LandingPageTranslations.translations[locale] || {}),
                ...(MobileNumberTranslations.translations[locale] || {}),
                ...(CountrySelectorTranslations.translations[locale] || {}),
                ...(GoogleSignInTranslations.translations[locale] || {}),
                ...(NamePageTranslations.translations[locale] || {}),
                ...(BirthdayPageTranslations.translations[locale] || {}),
                ...(NamePageTranslations.translations[locale] || {}),
                ...(ChartTitleTranslations.translations[locale] || {}),
                ...(ProfilePictureTranslations.translations[locale] || {}),
                ...(PasswordPageTranslations.translations[locale] || {}),
                ...(SettingsTranslations.translations[locale] || {}),
                ...(AccountPrivacyTranslations.translations[locale] || {}),
                ...(BlockedTranslations.translations[locale] || {}),
                ...(HideStoryTranslations.translations[locale] || {}),
                ...(VisibilityOffChartTranslations.translations[locale] || {}),
                ...(MessagesRepliesTranslations.translations[locale] || {}),
                ...(ActivityStatusTranslations.translations[locale] || {}),
                ...(DeliverRequestsTranslations.translations[locale] || {}),
                ...(CommentControlsTranslations.translations[locale] || {}),
                ...(PrivacySettingsMoreTranslations.translations[locale] || {}),
                ...(DeepSettingsTranslations.translations[locale] || {}),
                ...(InfoHelpTranslations.translations[locale] || {}),
                ...(ProfileTranslations.translations[locale] || {}),
                ...(EditProfileTranslations.translations[locale] || {}),
                ...(PersonalInfoTranslations.translations[locale] || {}),
                ...(PhotoEditTranslations.translations[locale] || {}),
                ...(ChannelsTranslations.translations[locale] || {}),
                ...(SearchTranslations.translations[locale] || {}),
                ...(ChannelDetailsTranslations.translations[locale] || {}),
                ...(ChannelPageTranslations.translations[locale] || {}),
                ...(ChannelSettingsTranslations.translations[locale] || {}),
                ...(PostTranslations.translations[locale] || {}),
                ...(VideoTranslations.translations[locale] || {}),
                ...(ChartOptionsTranslations.translations[locale] || {}),
                ...(OnboardingTranslations.translations[locale] || {}),
                ...(LoginTranslations.translations[locale] || {}),
                ...(AccountSelectorTranslations.translations[locale] || {}),
                ...(InfoSheetTranslations.translations[locale] || {}),
            };
        });

        return merged;
    }

    // Strongly typed structural metadata object list array
    public static readonly languages: ReadonlyArray<Record<string, string>> = [
        { native: 'English', english: 'English (en) - Baseline', code: 'en' },
        { native: 'Español', english: 'Spanish (es) - Latin America & US', code: 'es' },
        { native: '中文', english: 'Mandarin Chinese (zh) - Asia', code: 'zh' },
        { native: 'हिन्दी', english: 'Hindi (hi) - India', code: 'hi' },
        { native: 'Français', english: 'French (fr) - Europe & Africa', code: 'fr' },
        { native: 'العربية', english: 'Arabic (ar) - Middle East & North Africa', code: 'ar' },
        { native: 'Kiswahili', english: 'Swahili (sw) - East Africa', code: 'sw' },
        { native: 'Hausa', english: 'Hausa (ha) - West Africa', code: 'ha' },
        { native: 'Português', english: 'Portuguese (pt) - Brazil & Southern Africa', code: 'pt' },
        { native: 'Luganda', english: 'Luganda', code: 'lg' },
    ];
}