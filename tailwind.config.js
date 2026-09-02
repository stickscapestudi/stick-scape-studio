/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#08070B',            // Deep obsidian black background
          card: '#13111C',          // Dark purple-tinted card box
          dark: '#FFFFFF',          // Crisp white text for primary headings
          charcoal: '#E9E5F2',      // Silver-lilac text
          muted: '#9E96AC',         // Lavender-gray muted text
          border: '#2B253C',        // Subtle purple border
          sand: '#1C182A',          // Dark purple surface for tags and pills
          terracotta: '#9333EA',    // Vibrant electric purple for buttons
          terracottaHover: '#7E22CE',// Deep royal purple for button hover
          sage: '#C084FC',          // Light lilac for secondary badges
          amber: '#FBBF24',         // Star rating amber
          cream: '#181525',         // Container box surface
          paper: '#0E0C15',         // Deep midnight section background
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Syne"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'polaroid': '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 10px rgba(147, 51, 234, 0.1)',
        'polaroid-hover': '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(168, 85, 247, 0.35)',
        'art': '0 12px 35px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(147, 51, 234, 0.15)',
        'art-hover': '0 24px 50px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(168, 85, 247, 0.35)',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.5), 0 0 8px rgba(147, 51, 234, 0.1)',
        'float': '0 15px 35px rgba(0,0,0,0.7)',
        'purple-glow': '0 0 25px rgba(147, 51, 234, 0.45)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        tiltIn: {
          '0%': { transform: 'rotate(-2deg) scale(0.98)', opacity: '0' },
          '100%': { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        tiltIn: 'tiltIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
