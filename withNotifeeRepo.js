const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withNotifeeRepo(config) {
  return withProjectBuildGradle(config, async (config) => {
    const buildGradle = config.modResults.contents;

    if (!buildGradle.includes("notifee")) {
      const mavenUrl = `
        maven {
            url "$rootDir/../node_modules/@notifee/react-native/android/libs"
        }`;

      config.modResults.contents = buildGradle.replace(
        /allprojects\s*\{\s*repositories\s*\{/,
        `allprojects {\n    repositories {${mavenUrl}`
      );
    }

    // Removed JitPack hack
    return config;
  });
};
// eas build -p android --profile preview
// eas secret:push --scope project --env-file .env
// eas env:push --force
