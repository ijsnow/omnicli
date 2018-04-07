const fs = require('fs');

console.log('\nWatching Omnitest\n');

fs.watchFile('./omnitest/manifest.json', function() {
  fs.copyFile(
    './omnitest/manifest.json',
    './dist/omnitest/manifest.json',
    function() {
      console.log('\nUpdated omnitest/manifest.json\n');
    },
  );
});

fs.watchFile('./dist/omnitest.bundle.js', function() {
  fs.copyFile(
    './dist/omnitest.bundle.js',
    './dist/omnitest/omnitest.bundle.js',
    function() {
      console.log('\nUpdated omnitest\n');
    },
  );
});
