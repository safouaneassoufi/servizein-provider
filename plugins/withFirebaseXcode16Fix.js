const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Fix for Firebase + Xcode 16: TARGET_OS_SIMULATOR not found in scope
// GCC_PREPROCESSOR_DEFINITIONS ensures COCOAPODS=1 is set so Firebase headers
// can properly resolve conditional compilation macros.
module.exports = function withFirebaseXcode16Fix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf-8');

      const fixLines = `
  # Fix: TARGET_OS_SIMULATOR scope error with Firebase + Xcode 16
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)', 'COCOAPODS=1']
      config.build_settings['CLANG_MODULES_AUTOLINK'] = 'YES'
    end
  end
`;

      if (!contents.includes('GCC_PREPROCESSOR_DEFINITIONS')) {
        if (contents.includes('post_install do |installer|')) {
          // Inject into existing post_install so Expo's block is preserved
          contents = contents.replace(
            'post_install do |installer|',
            'post_install do |installer|' + fixLines
          );
        } else {
          contents += `\npost_install do |installer|\n${fixLines}\nend\n`;
        }
        fs.writeFileSync(podfilePath, contents);
      }
      return config;
    },
  ]);
};
