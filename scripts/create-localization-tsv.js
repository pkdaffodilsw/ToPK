const fs = require("fs")
const path = require("path")
const get = require("lodash.get")
const en = require("../source/localization/en.json")
const sv = require("../source/localization/sv.json")

const parse = (obj, base = "") =>
  Object.entries(obj).reduce((lines, [key, value]) => {
    const valuePath = path
      .join(base, key)
      .split("/")
      .join(".")

    if (typeof value === "string") {
      lines.push(`${valuePath}\t${value}\t${get(en, valuePath)}`)

      return lines
    } else {
      return lines.concat(parse(value, valuePath))
    }
  }, [])

fs.writeFileSync(
  path.join(__dirname, `translations.${Date.now().toString()}.tsv`),
  parse(sv).join("\n"),
)
