/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
	  "./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
	  extend: {
	    animation: {
	      'marquee-ltr': 'marquee-ltr 30s linear infinite',
	    },
	    keyframes: {
	      'marquee-ltr': {
	        '0%': { transform: 'translateX(-100%)' },
	        '100%': { transform: 'translateX(0)' },
	      },
	    },
	    colors: {
	      border: "hsl(var(--border))",
	      input: "hsl(var(--input))",
	      ring: "hsl(var(--ring))",
	      background: "hsl(var(--background))",
	      foreground: "hsl(var(--foreground))",
	      primary: {
	        DEFAULT: "hsl(var(--primary))",
	        foreground: "hsl(var(--primary-foreground))",
	      },
	      secondary: {
	        DEFAULT: "hsl(var(--secondary))",
	        foreground: "hsl(var(--secondary-foreground))",
	      },
	      destructive: {
	        DEFAULT: "hsl(var(--destructive))",
	        foreground: "hsl(var(--destructive-foreground))",
	      },
	      muted: {
	        DEFAULT: "hsl(var(--muted))",
	        foreground: "hsl(var(--muted-foreground))",
	      },
	      accent: {
	        DEFAULT: "hsl(var(--accent))",
	        foreground: "hsl(var(--accent-foreground))",
	      },
	      popover: {
	        DEFAULT: "hsl(var(--popover))",
	        foreground: "hsl(var(--popover-foreground))",
	      },
	      card: {
	        DEFAULT: "hsl(var(--card))",
	        foreground: "hsl(var(--card-foreground))",
	      },
	    },
	    fontFamily: {
	      aleo: ['Aleo', 'HelveticaNeue', 'Helvetica Neue', 'sans-serif'],
	      poppins: ['Poppins', 'sans-serif'],
	      arbatosh: ['Arbutus Slab', 'serif'],
	      recoleta: ['Recoleta', 'serif'],
	    },
	    screens: {
	      'xs': '375px',
	      'sm': '640px',
	      'md': '768px',
	      'lg': '1024px',
	      'xl': '1280px',
	      '2xl': '1536px',
	    },
	  },
	},
	plugins: [],
}