// eslint.config.mjs

import nextPlugin from "@next/eslint-plugin-next";
import tsEslint from 'typescript-eslint';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  {
    // Aplica esta configuración a todos los archivos TypeScript
    files: ["**/*.ts", "**/*.tsx"],

    // Combina los plugins en un solo objeto
    plugins: {
      "@next/next": nextPlugin,
      '@typescript-eslint': tsEslint.plugin,
    },

    // Define el parser para que ESLint entienda la sintaxis de TypeScript
    languageOptions: {
      parser: tsEslint.parser,
    },

    // Combina todas las reglas en un solo objeto
    rules: {
      // Reglas base de Next.js (importante mantenerlas)
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // --- NUESTRAS REGLAS PERSONALIZADAS ---
      // (Excepto para el archivo que ya deshabilitamos con un comentario)
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;