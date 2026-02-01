#!/usr/bin/env node

/**
 * md-to-json.js
 * 
 * ONGOING SYNC TOOL: Converts Markdown files to JSON format
 * 
 * Usage: npm run sync (or node scripts/md-to-json.js)
 * 
 * This script:
 * 1. Reads all .md files from content/drugs/ and content/principles/
 * 2. Parses YAML frontmatter and Markdown content
 * 3. Generates public/drugs.json and public/principles.json
 * 4. Preserves template and instructions in JSON files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple YAML parser for frontmatter (handles basic types)
function parseYAML(yamlString) {
  const lines = yamlString.split('\n');
  const result = {};
  let currentKey = null;
  let currentArray = null;
  let currentObject = null;
  let arrayOfObjects = false;
  let objectDepth = 0;
  
  for (let line of lines) {
    line = line.trimEnd();
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Detect array of objects
    if (line.trim() === '-' && currentArray !== null) {
      currentObject = {};
      arrayOfObjects = true;
      continue;
    }
    
    // Key: value pairs
    const match = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*): (.*)$/);
    if (match) {
      const indent = match[1].length;
      const key = match[2];
      let value = match[3];
      
      // Parse value type
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value === 'null') value = null;
      else if (value === '[]') value = [];
      else if (value === '{}') value = {};
      else if (value.match(/^-?\d+$/)) value = parseInt(value);
      else if (value.match(/^-?\d+\.\d+$/)) value = parseFloat(value);
      else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      
      if (indent === 0) {
        // Top-level key
        if (value === '' || value === undefined) {
          // Start of array or object
          currentKey = key;
          currentArray = [];
          result[key] = currentArray;
        } else {
          result[key] = value;
          currentKey = null;
          currentArray = null;
        }
      } else if (indent === 2 && currentArray !== null && !arrayOfObjects) {
        // Nested object in top-level key
        if (!result[currentKey] || Array.isArray(result[currentKey])) {
          result[currentKey] = {};
        }
        result[currentKey][key] = value;
      } else if (indent >= 2 && currentObject !== null) {
        // Inside array of objects
        const relativeIndent = indent - 4;
        if (relativeIndent === 0) {
          currentObject[key] = value;
        } else if (relativeIndent === 2) {
          // Nested property
          const parentKeys = Object.keys(currentObject);
          const lastKey = parentKeys[parentKeys.length - 1];
          if (typeof currentObject[lastKey] !== 'object' || Array.isArray(currentObject[lastKey])) {
            currentObject[lastKey] = {};
          }
          currentObject[lastKey][key] = value;
        }
      }
      continue;
    }
    
    // Array items
    const arrayMatch = line.match(/^(\s*)- (.*)$/);
    if (arrayMatch && currentArray !== null) {
      const indent = arrayMatch[1].length;
      let value = arrayMatch[2];
      
      // Handle array item
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\"/g, '"');
      } else if (value.match(/^-?\d+$/)) {
        value = parseInt(value);
      } else if (value.match(/^-?\d+\.\d+$/)) {
        value = parseFloat(value);
      }
      
      if (indent === 2 && !arrayOfObjects) {
        currentArray.push(value);
      } else if (indent === 2 && arrayOfObjects && currentObject) {
        currentArray.push(currentObject);
        currentObject = null;
        arrayOfObjects = false;
      }
    }
  }
  
  // Push last object if exists
  if (currentObject && currentArray) {
    currentArray.push(currentObject);
  }
  
  return result;
}

// Parse Markdown file with frontmatter
function parseMarkdown(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    console.error('❌ No frontmatter found in file');
    return null;
  }
  
  const yamlString = match[1];
  const bodyContent = match[2].trim();
  
  try {
    const frontmatter = parseYAML(yamlString);
    return {
      ...frontmatter,
      wiki_content: bodyContent || undefined
    };
  } catch (error) {
    console.error('❌ Failed to parse frontmatter:', error.message);
    return null;
  }
}

// Read and parse all Markdown files in a directory
function readMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return [];
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const entries = [];
  
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const parsed = parseMarkdown(content);
    
    if (parsed) {
      entries.push(parsed);
      console.log(`  ✓ ${parsed.name_cn || parsed.title || file}`);
    } else {
      console.error(`  ✗ Failed to parse: ${file}`);
    }
  });
  
  return entries;
}

// Main sync function
async function sync() {
  console.log('🔄 Starting Markdown to JSON sync...\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const contentDir = path.join(projectRoot, 'content');
  const publicDir = path.join(projectRoot, 'public');
  
  const drugsMdDir = path.join(contentDir, 'drugs');
  const principlesMdDir = path.join(contentDir, 'principles');
  
  const drugsJsonPath = path.join(publicDir, 'drugs.json');
  const principlesJsonPath = path.join(publicDir, 'principles.json');
  
  // Check if content directory exists
  if (!fs.existsSync(contentDir)) {
    console.error(`❌ Error: content/ directory not found`);
    console.error(`   Run "node scripts/json-to-md.js" first to create it.`);
    process.exit(1);
  }
  
  // Read existing JSON to preserve template and comments
  let drugsTemplate = {};
  let drugsInstructions = '';
  if (fs.existsSync(drugsJsonPath)) {
    const existingDrugs = JSON.parse(fs.readFileSync(drugsJsonPath, 'utf-8'));
    drugsTemplate = existingDrugs._template || {};
    drugsInstructions = existingDrugs._instructions || '';
  }
  
  let principlesTemplate = {};
  let principlesInstructions = '';
  if (fs.existsSync(principlesJsonPath)) {
    const existingPrinciples = JSON.parse(fs.readFileSync(principlesJsonPath, 'utf-8'));
    principlesTemplate = existingPrinciples._template || {};
    principlesInstructions = existingPrinciples._instructions || '';
  }
  
  // Read and parse drugs
  console.log('📦 Processing drugs...');
  const drugs = readMarkdownFiles(drugsMdDir);
  
  // Read and parse principles
  console.log('\n📚 Processing principles...');
  const principles = readMarkdownFiles(principlesMdDir);
  
  // Build drugs.json
  const drugsJson = {
    "_comment": "==================== Psych-Pedia 药物数据库 ====================",
    "_instructions": drugsInstructions || "如何添加新的药物条目：1. 编辑 content/drugs/ 中的 .md 文件，2. 运行 npm run sync 同步到 JSON，3. 刷新浏览器查看更改。所有字段请参考模板。",
    "_template": drugsTemplate,
    "drugs": drugs.sort((a, b) => a.id.localeCompare(b.id))
  };
  
  // Build principles.json  
  const principlesJson = {
    "_comment": "==================== Psych-Pedia 原理数据库 ====================",
    "_instructions": principlesInstructions || "如何添加新的原理条目：1. 编辑 content/principles/ 中的 .md 文件，2. 运行 npm run sync 同步到 JSON，3. 刷新浏览器查看更改。",
    "_template": principlesTemplate,
    "principles": principles.sort((a, b) => a.id.localeCompare(b.id))
  };
  
  // Write JSON files
  fs.writeFileSync(drugsJsonPath, JSON.stringify(drugsJson, null, 2), 'utf-8');
  fs.writeFileSync(principlesJsonPath, JSON.stringify(principlesJson, null, 2), 'utf-8');
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Sync completed successfully!');
  console.log('='.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   - Drugs synced: ${drugs.length}`);
  console.log(`   - Principles synced: ${principles.length}`);
  console.log(`\n📝 Output files:`);
  console.log(`   - ${drugsJsonPath}`);
  console.log(`   - ${principlesJsonPath}`);
  console.log(`\n🎉 You can now refresh your browser to see the changes!\n`);
}

// Run sync
sync().catch(error => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
