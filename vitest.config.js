import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,jsx,ts,tsx}',
      'lambda/**/*.{test,spec}.{js,mjs,cjs,jsx,ts,tsx}',
      'scripts/**/*.{test,spec}.{js,mjs,cjs,jsx,ts,tsx}',
    ],
    // `sam build` copies the whole lambda/ folder — tests included — into
    // .aws-sam/build/. Those copies are snapshots of whatever the source
    // looked like at build time, so they go stale and fail against the
    // current code. They are build output, never a thing to test.
    exclude: [...configDefaults.exclude, '**/.aws-sam/**'],
    globals: true,
  },
})
