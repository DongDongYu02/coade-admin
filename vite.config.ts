import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false
        })
      ]
    }),
    lazyImport({
      resolvers: [
        VxeResolver({
          libraryName: 'vxe-pc-ui'
        }),
        VxeResolver({
          libraryName: 'vxe-table'
        })
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:9981",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/file": {
        target: "http://localhost:8380",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/file/, ""),
      },
    },
  },
})
