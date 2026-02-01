import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fe5557',
          dark: '#e54446',
          light: 'rgba(254, 85, 87, 0.1)',
        },
        // Extend the default gray scale with daflash-specific values
        'df-gray': {
          DEFAULT: '#8f8a8a',
          light: '#f5f5f5',
          dark: '#333333',
        },
      },
      fontFamily: {
        heading: ['var(--font-outfit)', 'sans-serif'],
        body: ['var(--font-jakarta)', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
        md: '0 4px 20px rgba(0, 0, 0, 0.1)',
        lg: '0 8px 40px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
