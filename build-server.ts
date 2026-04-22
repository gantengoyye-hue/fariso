import * as esbuild from 'esbuild';

async function build() {
  await esbuild.build({
    entryPoints: ['server.ts'],
    bundle: true,
    platform: 'node',
    outfile: 'dist/server.cjs',
    format: 'cjs',
    external: ['vite'], // vite is only used in dev
  });
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
