import chroma from "chroma-js"

const primary = "#FFA400"
const primaryComplementary = "#FDF0D9"
const secondary = "#EF7BAE"
const secondaryComplementary = "#FBECF9"

const gray900 = "#201E1E"
const gray700 = "#666666"
const gray200 = "#F3F2F0"
const gray50 = "#FAFAFA"

export const colors = {
  primary,
  primaryComplementary,
  secondary,
  secondaryComplementary,
  gray900,

  gray700,

  gray600: chroma.mix(gray200, gray700, 0.8).hex(),
  // (600-200) / (700-200) = 0.8
  // gray600 is 80% of the difference between gray700 and gray200

  gray400: chroma.mix(gray200, gray700, 0.4).hex(),
  // (400-200) / (700-200) = 0.4
  // gray400 is 40% of the difference between gray700 and gray200

  gray200,

  gray50,
  red: chroma.mix("rgb(255,0,0)", primary, 0.4).hex(),
  green: chroma.mix("rgb(0,255,0)", primary, 0.4).hex(),
  yellow: chroma.mix("rgb(255,255,0)", primary, 0.4).hex(),
  disabled: chroma(secondary)
    .desaturate(2)
    .luminance(0.5)
    .hex(),
}
