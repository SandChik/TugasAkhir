/** @type {import('next').NextConfig} */
const nextConfig = {
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
