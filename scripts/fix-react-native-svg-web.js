const fs = require('fs');
const path = require('path');

const packageRoot = path.dirname(
  require.resolve('react-native-svg/package.json'),
);

const files = [
  'lib/commonjs/web/utils/prepare.js',
  'lib/module/web/utils/prepare.js',
  'src/web/utils/prepare.ts',
];

for (const relativePath of files) {
  const filePath = path.join(packageRoot, relativePath);
  if (!fs.existsSync(filePath)) continue;

  const source = fs.readFileSync(filePath, 'utf8');
  const patched = source.replaceAll(
    "clean['transform-origin']",
    'clean.transformOrigin',
  );

  if (patched !== source) {
    fs.writeFileSync(filePath, patched);
    console.log(`Patched react-native-svg web props: ${relativePath}`);
  }
}
