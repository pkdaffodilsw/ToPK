const fs = require("fs")
const path = require("path")

if (!process.argv[2]) {
  console.log("Missing GoogleService-Info.plist")
  process.exit(1)
} else {
  const fileContents = fs.readFileSync(
    path.resolve(__dirname, process.argv[2]),
    "utf8",
  )

  process.stdout.write(fileContents.replace(/\r?\n|\r|\t/g, ""))
}
