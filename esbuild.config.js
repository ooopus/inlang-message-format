import { context } from 'esbuild';
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';

// eslint-disable-next-line no-undef
const isProduction = process.env.NODE_ENV === 'production';

const ctx = await context({
  entryPoints: ['./src/index.ts'],
  outdir: './dist',
  minify: isProduction,
  // ----------------------------------
  // allow top level await
  // https://caniuse.com/mdn-javascript_operators_await_top_level
  target: 'es2022',
  // inlang does not support import maps
  bundle: true,
  // esm to work in the browser
  format: 'esm',
  //! extremly important to be platform neutral
  //! to ensure that modules run in browser
  //! and server contexts.
  platform: 'neutral',
  // sourcemaps are unused at the moment
  sourcemap: false,
  
  // 添加 mainFields 配置
  mainFields: ['module', 'main'],
  

  plugins: [
    nodeModulesPolyfillPlugin({
      // exclude: ['fs', 'path', 'os', 'crypto', 'child_process'],
    }),
  ],
});

if (isProduction === false) {
  await ctx.watch();
  // eslint-disable-next-line no-undef
  console.info('Watching for changes...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
