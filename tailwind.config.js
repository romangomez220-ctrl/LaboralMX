/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identidad oficial ROMANUS
        primary: {
          DEFAULT: '#0F2744', // Azul Marino
          light: '#1C3A5E',
          dark: '#081623',
        },
        gold: {
          DEFAULT: '#D4AF37', // Dorado
          light: '#E3C869',
          dark: '#A8862C',
        },
        ivory: '#F8F8F6', // Blanco Marfil
        stone: '#6B7280', // Gris Piedra
        // Colores semánticos de los resultados de cálculo (no son de marca,
        // son señalización funcional: verde = total, ámbar = advertencia).
        success: {
          DEFAULT: '#15803d',
          light: '#ecfdf5',
        },
        warning: {
          DEFAULT: '#92400e',
          light: '#fffbeb',
        },
      },
      fontFamily: {
        // Wordmark "ROMANUS" exclusivamente (uso restringido, ver SKILL).
        display: ['Cinzel', 'serif'],
        // h1/h2 institucionales en todo el sitio (aplicado vía CSS base).
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
