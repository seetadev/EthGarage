module.exports = {
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  parserOptions: {
    sourceType: "module",
  },
  extends: ['eslint:recommended'],
  plugins: ['prettier'],
  parser: '@typescript-eslint/parser',
  rules: {
    'no-unused-vars': 'off'
  }
};
