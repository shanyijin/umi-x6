const prettier = require('@umijs/fabric/dist/prettier');
module.exports = {
  ...prettier,
  organizeImportsSkipDestructiveCodeActions: true,
  trailingComma: 'none',
  semi: true
};
