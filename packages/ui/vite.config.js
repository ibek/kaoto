// @ts-check
import { codecovVitePlugin } from '@codecov/vite-plugin';
import react from '@vitejs/plugin-react';
import { dirname, relative } from 'node:path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import packageJson from './package.json';
import { getCamelCatalogFiles } from './scripts/get-camel-catalog-files';
import { getLastCommitInfo } from './scripts/get-last-commit-info';

// https://vitejs.dev/config/

export default defineConfig(async () => {
  const outDir = './dist';
  const lastCommitInfo = await getLastCommitInfo();
  const { basePath, files: camelCatalogFiles } = getCamelCatalogFiles();

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: camelCatalogFiles.map((file) => {
          const relativePath = relative(basePath, file);
          const dest = './camel-catalog/' + dirname(relativePath);

          return {
            src: file,
            dest,
            transform: (content, filename) => {
              return JSON.stringify(JSON.parse(content));
            },
          };
        }),
      }),
      codecovVitePlugin({
        enableBundleAnalysis: true,
        bundleName: '@kaoto/kaoto',
        // eslint-disable-next-line no-undef
        uploadToken: process.env.CODECOV_TOKEN,
        gitService: 'github',
      }),
    ],
    define: {
      __GIT_HASH: JSON.stringify(lastCommitInfo.hash),
      __GIT_DATE: JSON.stringify(lastCommitInfo.date),
      __KAOTO_VERSION: JSON.stringify(packageJson.version),
    },
    build: {
      outDir,
      sourcemap: true,
      emptyOutDir: true,
    },
    base: './',
  };
});
