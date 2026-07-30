import fs from 'fs';
import path from 'path';

// Your DeepL API Key
const DEEPL_API_KEY = process.env.DEEPL_API_KEY || "c698a577-a213-4861-8599-7414a27a786a:fx";

const MESSAGES_DIR = './messages';
const BASE_LOCALE = 'en';

// Target languages mapping
const TARGET_LOCALES = [
  { code: 'ar', deeplCode: 'AR' },
  { code: 'fr', deeplCode: 'FR' },
  { code: 'es', deeplCode: 'ES' },
  { code: 'de', deeplCode: 'DE' },
  { code: 'pt', deeplCode: 'PT-PT' },
  { code: 'zh', deeplCode: 'ZH' },
  { code: 'ja', deeplCode: 'JA' },
  { code: 'ru', deeplCode: 'RU' }
];

const API_URL = DEEPL_API_KEY.endsWith(':fx') 
  ? 'https://api-free.deepl.com/v2/translate'
  : 'https://api.deepl.com/v2/translate';

const baseContent = JSON.parse(
  fs.readFileSync(path.join(MESSAGES_DIR, `${BASE_LOCALE}.json`), 'utf-8')
);

// Flatten object into key-value paths
function flattenObject(obj, prefix = '') {
  let flattened = {};
  for (const [key, value] of Object.entries(obj)) {
    const propName = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenObject(value, propName));
    } else {
      flattened[propName] = value;
    }
  }
  return flattened;
}

// Unflatten back into nested object
function unflattenObject(flattened) {
  const result = {};
  for (const [key, value] of Object.entries(flattened)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = current[parts[i]] || {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

async function run() {
  const flatBase = flattenObject(baseContent);

  for (const { code: fileLang, deeplCode } of TARGET_LOCALES) {
    const targetPath = path.join(MESSAGES_DIR, `${fileLang}.json`);
    
    let flatExisting = {};
    if (fs.existsSync(targetPath)) {
      try {
        const existingObj = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
        flatExisting = flattenObject(existingObj);
      } catch (e) {
        flatExisting = {};
      }
    }

    // Identify missing keys only
    const missingEntries = Object.entries(flatBase).filter(
      ([key]) => !flatExisting[key]
    );

    if (missingEntries.length === 0) {
      console.log(`✨ [${fileLang}] is up to date.`);
      continue;
    }

    console.log(`Translating ${missingEntries.length} missing keys for [${fileLang}] via DeepL...`);

    const missingKeys = missingEntries.map(([k]) => k);
    const missingValues = missingEntries.map(([, v]) => v);
    const translatedMap = { ...flatExisting };

    // DeepL API accepts chunks of up to 50 texts per POST request
    const chunkSize = 50;
    for (let i = 0; i < missingValues.length; i += chunkSize) {
      const chunkValues = missingValues.slice(i, i + chunkSize);
      const chunkKeys = missingKeys.slice(i, i + chunkSize);

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: chunkValues,
            target_lang: deeplCode,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();

        data.translations.forEach((item, idx) => {
          const key = chunkKeys[idx];
          translatedMap[key] = item.text;
        });

      } catch (err) {
        console.error(`❌ Batch failed for [${fileLang}]:`, err.message);
        // Fallback to raw text for failed keys
        chunkKeys.forEach((key, idx) => {
          if (!translatedMap[key]) translatedMap[key] = chunkValues[idx];
        });
      }
    }

    const updatedObject = unflattenObject(translatedMap);
    fs.writeFileSync(targetPath, JSON.stringify(updatedObject, null, 2), 'utf-8');
    console.log(`✅ [${fileLang}] updated successfully!`);
  }

  console.log("🚀 All locale files successfully translated!");
}

run();