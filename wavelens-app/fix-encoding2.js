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

const replacements = [
  [/\u00e2\u2020\u2019/g, "\u2192"], // right arrow mojibake
  [/\u00e2\u20ac\u201d/g, "\u2014"], // em dash mojibake
  [/\u00e2\u20ac\u201c/g, "\u2013"], // en dash mojibake  
  [/\u00e2\u20ac\u2122/g, "\u2019"], // apostrophe mojibake
  [/\u00e2\u20ac\u0153/g, "\u201c"], // left double quote mojibake
  [/\u00e2\u20ac\u009d/g, "\u201d"], // right double quote mojibake
  [/\u00c3\u2014/g, "\u00d7"], // multiplication sign
  [/\u00c3\u00a1/g, "\u00e1"],
  [/\u00c3\u00a0/g, "\u00e0"],
  [/\u00c3\u00a3/g, "\u00e3"],
  [/\u00c3\u00a2/g, "\u00e2"],
  [/\u00e1\u00ba\u00a1/g, "\u1ea1"],
  [/\u00e1\u00ba\u00a3/g, "\u1ea3"],
  [/\u00e1\u00ba\u00a5/g, "\u1ea5"],
  [/\u00e1\u00ba\u00a7/g, "\u1ea7"],
  [/\u00e1\u00bb\u0087/g, "\u1ec7"],
  [/\u00e1\u00bb\u0083/g, "\u1ec3"],
  [/\u00e1\u00bb\u0089/g, "\u1ec9"],
  [/\u00e1\u00bb\u008b/g, "\u1ecb"],
  [/\u00e1\u00bb\u0091/g, "\u1ed1"],
  [/\u00e1\u00bb\u0093/g, "\u1ed3"],
  [/\u00e1\u00bb\u0099/g, "\u1ed9"],
  [/\u00e1\u00bb\u009b/g, "\u1edb"],
  [/\u00e1\u00bb\u009d/g, "\u1edd"],
  [/\u00e1\u00bb\u00a3/g, "\u1ee3"],
  [/\u00e1\u00bb\u00a7/g, "\u1ee7"],
  [/\u00e1\u00bb\u00ab/g, "\u1eef"],
  [/\u00c4\u0083/g, "\u0103"],
  [/\u00c4\u0091/g, "\u0111"],
  [/\u00c4\u00ae/g, "\u01af"],
  [/\u00c6\u00b0/g, "\u01b0"],
];

let changed = [];
files.forEach((f) => {
  try {
    let content = fs.readFileSync(f, "utf8");
    const orig = content;
    replacements.forEach(([re, r]) => {
      content = content.replace(re, r);
    });
    if (content !== orig) {
      fs.writeFileSync(f, content, "utf8");
      changed.push(path.relative(dir, f));
    }
  } catch (e) {
    console.error("Error processing " + f + ": " + e.message);
  }
});

console.log("Files changed:");
changed.forEach((f) => console.log("  " + f));
console.log("Total: " + changed.length + " files");
