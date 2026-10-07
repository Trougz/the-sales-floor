import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Two build targets:
//  - default:      normal multi-file build with clean URLs (BrowserRouter). Needs an
//                  SPA fallback on the host (every path -> index.html).
//  - `--mode preview`: one self-contained HTML file using hash URLs (#/talent), so it
//                  opens from a file / any static viewer with no server config.
export default defineConfig(({ mode }) => {
  const isPreview = mode === 'preview';
  return {
    base: isPreview ? './' : '/',
    plugins: [react(), ...(isPreview ? [viteSingleFile()] : [])],
    define: { __HASH_ROUTER__: JSON.stringify(isPreview) },
    server: { host: true, port: 5173 },
    preview: { host: true, port: 4173 },
    build: { outDir: isPreview ? 'dist-preview' : 'dist' },
  };
});
