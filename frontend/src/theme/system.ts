import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Tokens mirror design.md §4–§5. The app is dark-first, so semantic tokens use single values.
const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "bg",
      color: "fg",
      fontFamily: "body",
    },
    "::selection": { bg: "brand.500/40" },
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: `"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` },
        heading: { value: `"Space Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif` },
        mono: { value: `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` },
      },
      colors: {
        brand: {
          50: { value: "#FFF7ED" },
          100: { value: "#FFEDD5" },
          200: { value: "#FED7AA" },
          300: { value: "#FDBA74" },
          400: { value: "#FB923C" },
          500: { value: "#F97316" },
          600: { value: "#EA580C" },
          700: { value: "#C2410C" },
          800: { value: "#9A3412" },
          900: { value: "#7C2D12" },
          950: { value: "#431407" },
        },
        accent: { value: "#FFC107" },
      },
    },
    semanticTokens: {
      colors: {
        // colorPalette="brand" support
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "#101114" },
          fg: { value: "{colors.brand.400}" },
          muted: { value: "{colors.brand.500/20}" },
          subtle: { value: "{colors.brand.500/10}" },
          emphasized: { value: "{colors.brand.500/30}" },
          focusRing: { value: "{colors.brand.500}" },
        },
        bg: {
          DEFAULT: { value: "#101114" },
          panel: { value: "#17191F" },
          subtle: { value: "#17191F" },
          muted: { value: "#20232B" },
          emphasized: { value: "#2A2E38" },
          error: { value: "{colors.red.500/12}" },
        },
        fg: {
          DEFAULT: { value: "#F5F5F7" },
          muted: { value: "#A1A1AA" },
          subtle: { value: "#686B75" },
          error: { value: "#F87171" },
        },
        border: {
          DEFAULT: { value: "#30343D" },
          muted: { value: "#262930" },
          subtle: { value: "#262930" },
          emphasized: { value: "#3D424D" },
          error: { value: "#EF4444" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
