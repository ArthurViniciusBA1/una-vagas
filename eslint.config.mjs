import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'eslint.config.mjs',
      '.prettierrc.js',
      '**/*.data.json', // Adicionado para ignorar arquivos de dados
      'postcss.config.mjs',
      'tailwind.config.ts',
      'next.config.ts',
      'components.json',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser, // ADICIONADO: Para entender variáveis como 'window', 'document'
        ...globals.es2021,
        ...globals.node, // Mantido para arquivos do lado do servidor
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      // Regras base
      ...tseslint.configs.eslintRecommended.rules,
      ...tseslint.configs.recommended.rules,
      // Regras do React
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      // Suas regras customizadas
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // Desativa a necessidade de importar React em escopo para JSX (padrão no Next.js)
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect', // Detecta automaticamente a versão do React
      },
    },
  },
  eslintPluginPrettierRecommended,
];
