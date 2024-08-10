import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    env: {
      node: true,  // Aktifkan lingkungan Node.js
      es2021: true // Aktifkan fitur ECMAScript 2021
    },
    rules: {
      // Tambahkan aturan ESLint lainnya di sini
    },
  },
];