/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone untuk image Docker: server.js mandiri + dependency hasil
  // tracing, tanpa perlu node_modules penuh di stage runner.
  output: "standalone",
  webpack: (config) => {
    // Typechain menghasilkan impor ESM bergaya "./file.js" untuk file .ts.
    // extensionAlias membuat webpack me-resolve ".js" ke ".ts" saat diperlukan.
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts"],
      ".mjs": [".mjs", ".mts"],
    };
    return config;
  },
};

export default nextConfig;
