import windiCssPlugin from '@luncheon/esbuild-plugin-windicss';
import esbuild from 'esbuild';
import babel from 'esbuild-plugin-babel';
import pipe from 'esbuild-plugin-pipe';
import fs from 'fs';

const windiCss = windiCssPlugin({ filter: /^$/, windiCssConfig: { prefixer: false } });

const srcdir = 'src/';
const outdir = 'public/';

fs.rmSync(outdir, { recursive: true, force: true });
fs.mkdirSync(outdir, { recursive: true });

const options = {
  entryPoints: [`${srcdir}index.tsx`, `${srcdir}downloadPdf.ts`],
  outdir,
  bundle: true,
  minify: true,
  format: 'esm',
  logLevel: 'info',
  resolveExtensions: ['.mjs', '.js', '.ts', '.tsx'],
  loader: { '.woff2': 'file' },
  external: ['*/downloadPdf.js'],
  plugins: [
    {
      name: 'index.html',
      setup: (build) => build.onStart(() => fs.copyFileSync(`${srcdir}index.html`, `${outdir}index.html`)),
    },
    pipe({
      filter: /\.tsx$/,
      plugins: [windiCss, babel({ config: { presets: ['@babel/preset-typescript', 'babel-preset-solid'] } })],
    }),
    windiCss,
  ],
};

if (process.argv.includes('--serve')) {
  esbuild.serve({ servedir: outdir }, options).then(console.log('http://localhost:8000'));
} else {
  esbuild.build(options);
}