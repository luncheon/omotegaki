import windiCssPlugin from '@luncheon/esbuild-plugin-windicss';
import esbuild from 'esbuild';
import babel from 'esbuild-plugin-babel';
import pipe from 'esbuild-plugin-pipe';
import fs from 'fs';

const windiCss = windiCssPlugin({
  filter: /^$/,
  windiCssConfig: {
    prefixer: false,
    plugins: [
      ({ addDynamic }) => {
        addDynamic('font-size', ({ Utility, Style }) => Style.generate(Utility.class, { 'font-size': Utility.amount }), {
          completions: 'font-size-{size}',
        });
      },
    ],
  },
});

const srcdir = 'src/';
const outdir = 'public/';

fs.rmSync(outdir, { recursive: true, force: true });
fs.mkdirSync(outdir, { recursive: true });
fs.cpSync('pdfjs-2.12.313-dist', `${outdir}/pdfjs`, { recursive: true });

const options = {
  entryPoints: [`${srcdir}index.tsx`, `${srcdir}toPdf.ts`],
  external: ['*/toPdf.js'],
  outdir,
  bundle: true,
  minify: true,
  format: 'esm',
  logLevel: 'info',
  resolveExtensions: ['.mjs', '.js', '.ts', '.tsx'],
  loader: { '.woff2': 'file' },
  assetNames: '[name]',
  plugins: [
    {
      name: 'copy-assets',
      setup: (build) =>
        build.onStart(() => {
          fs.copyFileSync(`${srcdir}index.html`, `${outdir}index.html`);
          fs.copyFileSync(`${srcdir}viewer.html`, `${outdir}viewer.html`);
          fs.copyFileSync(`${srcdir}viewer.js`, `${outdir}viewer.js`);
          fs.copyFileSync(`${srcdir}404.html`, `${outdir}404.html`);
          fs.copyFileSync(`${srcdir}favicon.svg`, `${outdir}favicon.svg`);
        }),
    },
    {
      name: 'jspreadsheet-ce',
      setup: (build) =>
        build.onLoad({ filter: /\/jspreadsheet-ce\/dist\/index.js$/ }, (args) => ({
          contents: fs.readFileSync(args.path, 'utf8').replace('//bossanova.uk/jspreadsheet/logo.png', ''),
        })),
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
