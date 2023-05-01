/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // colors: {
      //   border: "hsl(var(--border))",
      //   input: "hsl(var(--input))",
      //   ring: "hsl(var(--ring))",
      // background: "hsl(var(--background))",
      // foreground: "hsl(var(--foreground))",
      // primary: {
      //   DEFAULT: "hsl(var(--primary))",
      //   foreground: "hsl(var(--primary-foreground))",
      // },
      //   secondary: {
      //     DEFAULT: "hsl(var(--secondary))",
      //     foreground: "hsl(var(--secondary-foreground))",
      //   },
      //   destructive: {
      //     DEFAULT: "hsl(var(--destructive))",
      //     foreground: "hsl(var(--destructive-foreground))",
      //   },
      //   muted: {
      //     DEFAULT: "hsl(var(--muted))",
      //     foreground: "hsl(var(--muted-foreground))",
      //   },
      //   accent: {
      //     DEFAULT: "hsl(var(--accent))",
      //     foreground: "hsl(var(--accent-foreground))",
      //   },
      //   popover: {
      //     DEFAULT: "hsl(var(--popover))",
      //     foreground: "hsl(var(--popover-foreground))",
      //   },
      //   card: {
      //     DEFAULT: "hsl(var(--card))",
      //     foreground: "hsl(var(--card-foreground))",
      //   },
      // },

      colors: {
        background: "#040004",
        foreground: "#D8D8D8",
        muted: "#2D2D2D",
        border: "#292929",
        input: "#262626",
        ring: "#1F1F1F",
        primary: {
          DEFAULT: "#6c00d0",
          foreground: "#F2F2F2",
        },
        secondary: {
          DEFAULT: "#202020",
          foreground: "#F2F2F2",
        },
        destructive: {
          DEFAULT: "#E74C3C",
          foreground: "#F2F2F2",
        },
        accent: {
          DEFAULT: "#6b3891",
          foreground: "#F2F2F2",
        },
        popover: {
          DEFAULT: "#1b1b1b",
          foreground: "#A6A6A6",
        },
        card: {
          DEFAULT: "#1b1b1b",
          foreground: "#D8D8D8",
        },
      },

      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
