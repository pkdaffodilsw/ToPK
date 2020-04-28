const fs = require("fs")
const path = require("path")
const cheerio = require("cheerio")
const prettier = require("prettier")
const { getProjectName } = require("react-native-rename")

const infoPath = path.join(process.cwd(), "ios", getProjectName(), "Info.plist")

if (!fs.existsSync(infoPath)) {
  console.error(`Could not locate Info.plist (${infoPath})`)
  process.exit(1)
}

const info = cheerio.load(fs.readFileSync(infoPath, { encoding: "utf8" }), {
  xmlMode: true,
})

const cfBundleUrlSchemesArray = info(
  "key:contains('CFBundleURLSchemes')",
).next()

// const cfBundleUrlSchemes = [
//   ...new Set(
//     info("string", cfBundleUrlSchemesArray)
//       .map((_, element) => info(element).text())
//       .get()
//       .concat(process.argv.slice(2)),
//   ),
// ]

const cfBundleUrlSchemes = [
  ...new Set(
    process.argv
      .slice(2)
      .reduce((urls, arg) => urls.concat(arg.split(" ")), []),
  ),
]

cfBundleUrlSchemesArray.html(
  cfBundleUrlSchemes.reduce(
    (content, url) => content.concat(`<string>${url}</string>`),
    "",
  ),
)

const output = prettier.format(info.xml(), { parser: "xml" }).split("\n")

output.splice(
  1,
  0,
  '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
)

fs.writeFileSync(infoPath, output.join("\n"), { encoding: "utf8" })
