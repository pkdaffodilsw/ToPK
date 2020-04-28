import { colors } from "./color"

export const fonts = {
  koHo: {
    regular: "KoHo-Regular",
  },
  openSans: {
    regular: "OpenSans-Regular",
    semiBold: "OpenSans-SemiBold",
    bold: "OpenSans-Bold",
  },
}

export const textStyles = {
  title: {
    fontSize: 36,
    lineHeight: 43,
    fontFamily: fonts.koHo.regular,
    color: colors.gray900,
  },
  headline: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: fonts.openSans.regular,
    color: colors.gray900,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.openSans.regular,
    color: colors.gray900,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.openSans.regular,
    color: colors.gray900,
  },
}
