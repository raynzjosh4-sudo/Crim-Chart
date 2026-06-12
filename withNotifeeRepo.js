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
    return config;
  });
};
