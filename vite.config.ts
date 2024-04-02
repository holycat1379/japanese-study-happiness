import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.vtt', '**/*.mp3', '**/*.mp4', '**/*.json', '**/*.gz'],
  plugins: [nodePolyfills(),vue(),{
    name: 'json-to-js',
    transform(src, id) {
      if (id.endsWith('.json')) {
        return {
          code: `export default ${src}`,
          map: null
        };
      }
    }
  }],
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  base: '/japanese-study-happiness/'
})
