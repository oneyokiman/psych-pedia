# Fix White Screen Bug - Execution Plan

## Problem Summary
The website shows a white screen with "加载中..." that never loads due to:
1. **Root Cause**: Buggy custom YAML parser in `scripts/md-to-json.js` fails to parse complex nested structures
2. **Symptom**: `drug.tags` and `drug.pearls` are undefined when DrugDetail.tsx tries to render
3. **Error**: `TypeError: Cannot read properties of undefined (reading 'map')`

## Tasks

### Task 1: Fix md-to-json.js to use gray-matter
**Priority**: HIGH
**File**: `scripts/md-to-json.js`

Replace the entire file content with:

```javascript
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
```

### Task 2: Add null guards to DrugDetail.tsx
**Priority**: HIGH
**File**: `components/DrugDetail.tsx`

**Edit 1** - Line 59: Add optional chaining to `drug.tags`:
```typescript
// OLD (line 58-64):
<div className="flex flex-wrap gap-2 md:ml-auto">
    {drug.tags.map(tag => (
        <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800">
            {tag}
        </span>
    ))}
</div>

// NEW:
<div className="flex flex-wrap gap-2 md:ml-auto">
    {drug.tags?.map(tag => (
        <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800">
            {tag}
        </span>
    ))}
</div>
```

**Edit 2** - Line 111: Add optional chaining to `drug.pearls`:
```typescript
// OLD (line 111):
{drug.pearls.map((pearl, idx) => (

// NEW:
{drug.pearls?.map((pearl, idx) => (
```

### Task 3: Run sync and verify
**Priority**: HIGH

After completing Task 1 and Task 2:

1. Run the sync command:
   ```bash
   npm run sync
   ```

2. Verify `public/drugs.json` has valid structure:
   - Check a drug entry has `tags` as an array
   - Check a drug entry has `pearls` as an array of objects

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open browser at http://localhost:3004 and verify:
   - No white screen
   - Page loads correctly
   - No console errors
   - Click on a drug to verify detail page works

## Verification Checklist
- [ ] `gray-matter` is installed (already done)
- [ ] `md-to-json.js` uses gray-matter instead of custom parser
- [ ] `DrugDetail.tsx` has null guards on `tags` and `pearls`
- [ ] `npm run sync` completes without errors
- [ ] `public/drugs.json` has valid `tags` and `pearls` arrays
- [ ] Browser loads without white screen
- [ ] No console errors in browser
- [ ] Drug detail page renders correctly

## Files to Modify
| File | Action |
|------|--------|
| `scripts/md-to-json.js` | Replace entire content with gray-matter version |
| `components/DrugDetail.tsx` | Add `?.` to lines 59 and 111 |

## Notes
- Do NOT commit until user confirms the fix works
- The `gray-matter` package is already installed
- After fix, run `npm run sync` to regenerate JSON files
