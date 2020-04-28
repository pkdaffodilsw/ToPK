const fs = require("fs")
const path = require("path")
const cheerio = require("cheerio")

const scheme = (process.argv[2] || "").split(" ")[0]

if (!scheme.length) {
  console.error("Expected argument scheme.")
  process.exit(1)
}

const manifestPath = path.join(
  process.cwd(),
  "android/app/src/main/AndroidManifest.xml",
)

const manifest = cheerio.load(
  fs.readFileSync(manifestPath, {
    encoding: "utf8",
  }),
  {
    xmlMode: true,
  },
)

manifest("data[android\\:scheme]").attr(
  "android:scheme",
  process.argv[2].split(" ")[0],
)

fs.writeFileSync(manifestPath, manifest.xml(), { encoding: "utf8" })
