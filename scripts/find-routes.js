import fs from "fs";

const content = fs.readFileSync("app/api/[[...route]]/route.js", "utf8");
const lines = content.split("\n");
lines.forEach((line, idx) => {
  if (line.trim().startsWith("app.get(") || line.trim().startsWith("app.post(")) {
    console.log(`${idx + 1}: ${line.trim().slice(0, 50)}`);
  }
});
