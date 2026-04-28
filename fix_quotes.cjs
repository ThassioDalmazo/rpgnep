const fs = require('fs');

['./constants.ts', './src/constants.ts'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"sim\/não"/g, '\\"sim/não\\"');
  content = content.replace(/"caem"/g, '\\"caem\\"');
  fs.writeFileSync(file, content, 'utf8');
});
