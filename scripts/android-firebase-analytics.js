const fs = require("fs")
const path = require("path")
const cheerio = require("cheerio")

if (!process.argv[2]) {
  console.error('Missing required argument "true"/"false"')
  process.exit(1)
}

const set = value => {
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

  manifest(
    'meta-data[android\\:name="firebase_analytics_collection_enabled"]',
  ).attr("android:value", value)

  fs.writeFileSync(manifestPath, manifest.xml(), { encoding: "utf8" })
}

switch (process.argv[2]) {
  case "true":
    set("true")
    break

  case "false":
    set("false")
    break

  default:
    console.error(
      `Unexpected argument supplied ("${
        process.argv[2]
      }"), expected either "true" or "false"`,
    )

    process.exit(1)
}
