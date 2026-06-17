const fs = require("fs");
const path = require("path");

const dir = "D:\\git\\CONVO\\wavelens-app\\src";
const files = [];

function walk(d) {
  fs.readdirSync(d).forEach((f) => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) files.push(p);
  });
}
walk(dir);

let fixed = 0;
files.forEach((f) => {
  let content = fs.readFileSync(f, "utf8");
  const original = content;

  content = content
    .replace(/â€"/g, "\u2014")   // em-dash
    .replace(/â€“/g, "\u2013")   // en-dash
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, "\u201c")   // left double quote
    .replace(/â€[^\x9d]/g, "\u201d") // right double quote
    .replace(/â€\x9d/g, "\u201d")
    .replace(/â†'/g, "\u2192")   // arrow
    .replace(/â€¦/g, "\u2026")   // ellipsis
    .replace(/Ã¡/g, "á")
    .replace(/Ã /g, "à")
    .replace(/Ã£/g, "ã")
    .replace(/Ã¢/g, "â")
    .replace(/Äƒ/g, "ă")
    .replace(/Ä‘/g, "đ")
    .replace(/Ä�/g, "Đ")
    .replace(/áº¡/g, "ạ")
    .replace(/áº£/g, "ả")
    .replace(/áº¥/g, "ấ")
    .replace(/áº§/g, "ầ")
    .replace(/á»‡/g, "ệ")
    .replace(/á»ƒ/g, "ể")
    .replace(/á»‰/g, "ỉ")
    .replace(/á»‹/g, "ị")
    .replace(/á»‘/g, "ố")
    .replace(/á»“/g, "ồ")
    .replace(/á»™/g, "ộ")
    .replace(/á»›/g, "ớ")
    .replace(/á»�/g, "ờ")
    .replace(/á»£/g, "ợ")
    .replace(/á»§/g, "ủ")
    .replace(/á»«/g, "ữ")
    .replace(/á»±/g, "ự")
    .replace(/á»¥/g, "ụ")
    .replace(/Ä©/g, "Ư")
    .replace(/Æ°/g, "ư")
  ;

  if (content !== original) {
    fs.writeFileSync(f, content, "utf8");
    fixed++;
    console.log("Fixed: " + path.relative(dir, f));
  }
});
console.log("Done. Fixed " + fixed + " files.");
