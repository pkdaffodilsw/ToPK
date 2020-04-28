import { SKU } from "../constants"

export const getSku = ({ clinicianType, treatment, price }) => {
  const sku =
    SKU[
      `${clinicianType}${treatment}${
        price === null || price === 0 ? `Free` : ``
      }`
    ] ||
    `${clinicianType}${treatment}${price === null || price === 0 ? `Free` : ``}`

  console.log(sku)

  return sku
}
