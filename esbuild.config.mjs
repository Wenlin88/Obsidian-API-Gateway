import esbuild from 'esbuild';
const isProd = process.argv[2] === 'production';
esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: isProd,
  outfile: 'main.js',
  platform: 'node',
  format: 'cjs',
  sourcemap: true,
  external: ['obsidian']
}).catch(() => process.exit(1));
