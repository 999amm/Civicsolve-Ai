import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.join(here, "..");
const dist = path.join(frontend, "dist");

fs.copyFileSync(
  path.join(frontend, "index.html"),
  path.join(dist, "index.html")
);

const indexPath = path.join(dist, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

html = html.replace('/src/styles.css', '/styles.css');

fs.writeFileSync(indexPath, html);

fs.copyFileSync(
  path.join(frontend, "src", "styles.css"),
  path.join(dist, "styles.css")
);

console.log("CIVICSOLVE dist prepared.");