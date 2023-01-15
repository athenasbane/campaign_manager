const fs = require("fs");

const imageAsBase64 = fs.readFileSync(process.argv[2], "base64");

fs.writeFileSync(
  "image.txt",
  `data:image/${process.argv[3] || "jpg"};base64,` + imageAsBase64
);
