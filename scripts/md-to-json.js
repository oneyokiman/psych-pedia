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
 * 2. Parses YAML frontmatter and Markdown content using gray-matter
 * 3. Generates public/drugs.json and public/principles.json
 * 4. Preserves template and instructions in JSON files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse Markdown file with frontmatter using gray-matter
function parseMarkdown(content) {
  try {
    const { data, content: bodyContent } = matter(content);
    
    // Return parsed frontmatter with wiki_content
    return {
      ...data,
      wiki_content: bodyContent.trim() || undefined
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
  
  // Build principles.json - separate by type for backward compatibility
  // Separate receptors (includes receptor, transporter, ion_channel) from hypotheses
  const receptors = principles
    .filter(p => p.type === 'receptor' || p.type === 'transporter' || p.type === 'ion_channel')
    .sort((a, b) => a.id.localeCompare(b.id));
  
  const hypotheses = principles
    .filter(p => p.type === 'hypothesis')
    .sort((a, b) => a.id.localeCompare(b.id));
  
  const principlesJson = {
    "_comment": "==================== Psych-Pedia 原理数据库 ====================",
    "_instructions": principlesInstructions || "本文件定义了药物雷达图(stahl_radar)中各维度的详细生物学含义及精神科核心假说。",
    "_template": principlesTemplate,
    "receptors": receptors,
    "hypotheses": hypotheses
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
