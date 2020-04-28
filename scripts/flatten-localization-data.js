const fs = require("fs")
const path = require("path")

const locale = process.argv[2]

const localeData = require(path.join(
  process.cwd(),
  "source/localization",
  locale + ".json",
))

const writePath = path.join(
  process.cwd(),
  `${locale}-flat.${Date.now().toString()}.json`,
)

const parse = (obj, base = "") =>
  Object.entries(obj).reduce((lines, [key, value]) => {
    const valuePath = path
      .join(base, key)
      .split("/")
      .join(".")

    if (typeof value === "string") {
      lines.push(`"${valuePath}": ${JSON.stringify(value)},`)

      return lines
    } else {
      return lines.concat(parse(value, valuePath))
    }
  }, [])

fs.writeFileSync(
  writePath,
  "{" +
    parse(localeData)
      .join("\n")
      .slice(0, -1) +
    "}",
)
