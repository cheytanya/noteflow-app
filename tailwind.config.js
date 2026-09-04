/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Custom note pastel colors for Light & Dark mode
        note: {
          default: { light: '#ffffff', dark: '#1e293b' },
          red: { light: '#fee2e2', dark: '#7f1d1d' },
          orange: { light: '#ffedd5', dark: '#7c2d12' },
          yellow: { light: '#fef9c3', dark: '#713f12' },
          green: { light: '#dcfce7', dark: '#14532d' },
          teal: { light: '#ccfbf1', dark: '#134e4a' },
          blue: { light: '#e0f2fe', dark: '#1e3a8a' },
          purple: { light: '#f3e8ff', dark: '#581c87' },
          pink: { light: '#fce7f3', dark: '#831843' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
