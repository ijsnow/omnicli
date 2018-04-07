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

fs.watchFile('./dist/omnitest.js', function() {
  fs.copyFile('./dist/omnitest.js', './dist/omnitest/omnitest.js', function() {
    console.log('\nUpdated omnitest\n');
  });
});
