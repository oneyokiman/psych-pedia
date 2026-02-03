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
function readMarkdownFiles(dir, isPrinciples = false) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return [];
  }
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const entries = [];
  
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    let parsed = parseMarkdown(content);
    
    if (parsed) {
      // For principles, extract content from wiki_content if needed
      if (isPrinciples && parsed.wiki_content && !parsed.content) {
        const introMatch = parsed.wiki_content.match(/## 简介\n\n([\s\S]*?)(?:\n## |\n# |$)/);
        if (introMatch) {
          parsed.content = introMatch[1].trim();
          // Remove the intro section from wiki_content
          parsed.wiki_content = parsed.wiki_content.replace(/## 简介\n\n[\s\S]*?(?=\n## |\n# |$)/, '').trim();
          if (!parsed.wiki_content) {
            delete parsed.wiki_content; // Remove empty wiki_content
          }
        }
      }
      
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
  console.log('🔄 Starting Markdown to JSON sync (Lazy Loading Mode)...\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const contentDir = path.join(projectRoot, 'content');
  const publicDir = path.join(projectRoot, 'public');
  
  const drugsMdDir = path.join(contentDir, 'drugs');
  const principlesMdDir = path.join(contentDir, 'principles');
  
  const drugsIndexPath = path.join(publicDir, 'drugs-index.json');
  const principlesIndexPath = path.join(publicDir, 'principles-index.json');
  const drugsDetailDir = path.join(publicDir, 'drugs');
  const principlesDetailDir = path.join(publicDir, 'principles');
  
  // Create detail directories if they don't exist
  if (!fs.existsSync(drugsDetailDir)) {
    fs.mkdirSync(drugsDetailDir, { recursive: true });
  }
  if (!fs.existsSync(principlesDetailDir)) {
    fs.mkdirSync(principlesDetailDir, { recursive: true });
  }
  
  // Check if content directory exists
  if (!fs.existsSync(contentDir)) {
    console.error(`❌ Error: content/ directory not found`);
    console.error(`   Run "node scripts/json-to-md.js" first to create it.`);
    process.exit(1);
  }
  
  // Read and parse drugs
  console.log('📦 Processing drugs...');
  const drugs = readMarkdownFiles(drugsMdDir, false);
  
  // Build drugs index (lightweight - only basic info for sidebar)
  const drugsIndex = drugs.map(drug => ({
    id: drug.id,
    name_cn: drug.name_cn,
    name_en: drug.name_en,
    category: drug.category,
    tags: drug.tags || []
  })).sort((a, b) => a.id.localeCompare(b.id));
  
  // Write individual drug detail files
  drugs.forEach(drug => {
    const detailPath = path.join(drugsDetailDir, `${drug.id}.json`);
    fs.writeFileSync(detailPath, JSON.stringify(drug, null, 2), 'utf-8');
  });
  
  // Read and parse principles
  console.log('\n📚 Processing principles...');
  const principles = readMarkdownFiles(principlesMdDir, true);
  
  // Separate receptors and hypotheses
  const receptors = principles
    .filter(p => p.type === 'receptor' || p.type === 'transporter' || p.type === 'ion_channel')
    .sort((a, b) => a.id.localeCompare(b.id));
  
  const hypotheses = principles
    .filter(p => p.type === 'hypothesis')
    .sort((a, b) => a.id.localeCompare(b.id));
  
  // Build principles index (lightweight)
  const principlesIndex = {
    receptors: receptors.map(p => ({
      id: p.id,
      title: p.title,
      type: p.type,
      description: p.description || ''
    })),
    hypotheses: hypotheses.map(p => ({
      id: p.id,
      title: p.title,
      type: p.type,
      description: p.description || ''
    }))
  };
  
  // Write individual principle detail files
  principles.forEach(principle => {
    const detailPath = path.join(principlesDetailDir, `${principle.id}.json`);
    fs.writeFileSync(detailPath, JSON.stringify(principle, null, 2), 'utf-8');
  });
  
  // Write index files
  fs.writeFileSync(drugsIndexPath, JSON.stringify({
    "_comment": "Drugs Index - Lightweight list for sidebar navigation",
    "drugs": drugsIndex
  }, null, 2), 'utf-8');
  
  fs.writeFileSync(principlesIndexPath, JSON.stringify({
    "_comment": "Principles Index - Lightweight list for sidebar navigation",
    ...principlesIndex
  }, null, 2), 'utf-8');
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Sync completed successfully!');
  console.log('='.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   - Drugs indexed: ${drugsIndex.length}`);
  console.log(`   - Drug detail files: ${drugs.length}`);
  console.log(`   - Principles indexed: ${principles.length}`);
  console.log(`   - Principle detail files: ${principles.length}`);
  console.log(`\n📝 Output files:`);
  console.log(`   - Index: ${drugsIndexPath}`);
  console.log(`   - Index: ${principlesIndexPath}`);
  console.log(`   - Details: ${drugsDetailDir}/*.json`);
  console.log(`   - Details: ${principlesDetailDir}/*.json`);
  console.log(`\n🎉 You can now refresh your browser to see the changes!\n`);
}

// Run sync
sync().catch(error => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
