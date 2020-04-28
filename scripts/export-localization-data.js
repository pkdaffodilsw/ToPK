const path = require("path")
const fs = require("fs")

process.argv.slice(2).map(localeName =>
  fs.writeFileSync(
    path.join(process.cwd(), localeName + "-" + Date.now() + ".json"),
    JSON.stringify({
      json: JSON.stringify(
        require(path.join(
          process.cwd(),
          "/source/localization",
          localeName + ".json",
        )),
      ),
    }),
  ),
)
