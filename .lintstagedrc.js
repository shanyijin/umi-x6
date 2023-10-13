module.exports = {
  // '**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
  'src/**/.(css|less)': (filenames) =>
    `stylelint --fix --syntax less ${filenames.map((each) => `"${each}"`).join(' ')}`,
  'src/**/*.(ts|js)?(x)': (filenames) =>
    `eslint --fix ${filenames.map((each) => `"${each}"`).join(' ')}`,
  'src/**/*.*': (filenames) =>
    `prettier --ignore-unknown --write ${filenames.map((each) => `"${each}"`).join(' ')}`
};
