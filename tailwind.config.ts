import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Brand Colors - Using CSS Variables (Teal)
        teal: {
          50: "hsl(var(--teal-50))",
          100: "hsl(var(--teal-100))",
          200: "hsl(var(--teal-200))",
          300: "hsl(var(--teal-300))",
          400: "hsl(var(--teal-400))",
          500: "hsl(var(--teal-500))",
          600: "hsl(var(--teal-600))",
          700: "hsl(var(--teal-700))",
          800: "hsl(var(--teal-800))",
          900: "hsl(var(--teal-900))",
        },
        "teal-light": {
          50: "hsl(var(--teal-light-50))",
          100: "hsl(var(--teal-light-100))",
          200: "hsl(var(--teal-light-200))",
          300: "hsl(var(--teal-light-300))",
          400: "hsl(var(--teal-light-400))",
          500: "hsl(var(--teal-light-500))",
          600: "hsl(var(--teal-light-600))",
          700: "hsl(var(--teal-light-700))",
          800: "hsl(var(--teal-light-800))",
          900: "hsl(var(--teal-light-900))",
        },
        // Legacy aliases for backward compatibility (map to teal)
        copper: {
          50: "hsl(var(--copper-50))",
          100: "hsl(var(--copper-100))",
          200: "hsl(var(--copper-200))",
          300: "hsl(var(--copper-300))",
          400: "hsl(var(--copper-400))",
          500: "hsl(var(--copper-500))",
          600: "hsl(var(--copper-600))",
          700: "hsl(var(--copper-700))",
          800: "hsl(var(--copper-800))",
          900: "hsl(var(--copper-900))",
        },
        lime: {
          50: "hsl(var(--lime-50))",
          100: "hsl(var(--lime-100))",
          200: "hsl(var(--lime-200))",
          300: "hsl(var(--lime-300))",
          400: "hsl(var(--lime-400))",
          500: "hsl(var(--lime-500))",
          600: "hsl(var(--lime-600))",
          700: "hsl(var(--lime-700))",
          800: "hsl(var(--lime-800))",
          900: "hsl(var(--lime-900))",
        },
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
