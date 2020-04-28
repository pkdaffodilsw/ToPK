const fs = require("fs")
const path = require("path")
const cheerio = require("cheerio")

const manifestPath = path.join(
  process.cwd(),
  "android/app/src/main/AndroidManifest.xml",
)

const stringsPath = path.join(
  process.cwd(),
  "android/app/src/main/res/values/strings.xml",
)

const manifest = cheerio.load(
  fs.readFileSync(manifestPath, {
    encoding: "utf8",
  }),
  {
    xmlMode: true,
  },
)

const strings = cheerio.load(
  fs.readFileSync(stringsPath, {
    encoding: "utf8",
  }),
  {
    xmlMode: true,
  },
)

manifest(
  'meta-data[android\\:name="com.facebook.sdk.AutoLogAppEventsEnabled"]',
).attr("android:value", process.argv[2] ? "true" : "false")

strings('string[name="facebook_app_id"]').text(
  process.argv[2] ? `fb${process.argv[2]}` : "Facebook App ID",
)

fs.writeFileSync(manifestPath, manifest.xml(), { encoding: "utf8" })
fs.writeFileSync(stringsPath, strings.xml(), { encoding: "utf8" })
