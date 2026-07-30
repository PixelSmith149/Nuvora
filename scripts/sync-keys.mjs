import fs from "fs";
import path from "path";

const dir = "./messages";
const enPath = path.join(dir, "en.json");

if (!fs.existsSync(enPath)) {
  console.error("❌ en.json not found in ./messages");
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "en.json");

files.forEach((file) => {
  const filePath = path.join(dir, file);
  const lang = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Merge missing namespaces & keys from en.json into target language
  Object.keys(en).forEach((ns) => {
    lang[ns] = {
      ...en[ns],
      ...(lang[ns] || {}),
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(lang, null, 2), "utf-8");
  console.log(`✅ Synced missing keys to ${file}`);
});