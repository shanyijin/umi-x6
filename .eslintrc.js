module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    eqeqeq: 2,
    'no-param-reassign': 1,
    '@typescript-eslint/no-shadow': 1,
    'no-console': [
      1,
      {
        allow: ['error', 'warn']
      }
    ]
  }
};
