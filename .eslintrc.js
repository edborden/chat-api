module.exports = {
  env: {
    node: true,
    es2021: true,
    mocha: true
  },
  extends: ['standard', 'plugin:prettier/recommended'],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    // AdonisJS specific rules
    'no-undef': 'off', // For use() global function
    camelcase: 'off', // For snake_case database columns
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    // Test specific rules
    'handle-callback-err': 'off'
  },
  globals: {
    use: true,
    make: true
  }
}
