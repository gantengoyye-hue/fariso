import * as esbuild from 'esbuild';

async function build() {
  await esbuild.build({
    entryPoints: ['server.ts'],
    bundle: true,
    platform: 'node',
    outfile: 'dist/server.js', // Changed to .js for ESM
    format: 'esm', // Use ESM
    external: ['vite'], // vite is only used in dev
  });
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
