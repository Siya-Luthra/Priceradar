/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#020617',
        },
        pastel: {
          sidebar: '#dedbfa',
          bg: '#F4EBF3',
          'text-pink': '#de6c7d',
          'badge-bg': '#f9dadd',
          'price-blue': '#599ac9',
          'table-header': '#d5ebfb',
          'link-blue': '#6da3c4',
          'chart-main': '#579dc3',
          'chart-dashed': '#add1e6',
          'input-bg': '#f6f0ef',
        }
      }
    },
  },
  plugins: [],
}
