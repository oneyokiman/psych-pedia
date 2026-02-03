#!/usr/bin/env node

/**
 * json-to-md.js
 * 
 * ONE-TIME MIGRATION TOOL: Converts existing JSON data to Markdown format
 * 
 * Usage: node scripts/json-to-md.js
 * 
 * This script:
 * 1. Reads public/drugs.json and public/principles.json
 * 2. Converts each entry to individual Markdown files with frontmatter
 * 3. Creates content/drugs/ and content/principles/ directories
 * 4. Preserves all data including wiki_content, stahl_radar, etc.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility: Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
}

// Utility: Convert object to YAML frontmatter
function toYAML(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let yaml = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        yaml += `${spaces}${key}: []\n`;
      } else if (typeof value[0] === 'object') {
        // Array of objects
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          yaml += `${spaces}  -\n`;
          yaml += toYAML(item, indent + 2).split('\n').map(line => 
            line ? `${spaces}  ${line}` : ''
          ).join('\n');
        });
      } else {
        // Array of primitives
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          yaml += `${spaces}  - ${typeof item === 'string' ? `"${item.replace(/"/g, '\\"')}"` : item}\n`;
        });
      }
    } else if (typeof value === 'object') {
      yaml += `${spaces}${key}:\n`;
      yaml += toYAML(value, indent + 1);
    } else if (typeof value === 'string') {
      // Escape special characters in strings
      const escaped = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      yaml += `${spaces}${key}: "${escaped}"\n`;
    } else {
      yaml += `${spaces}${key}: ${value}\n`;
    }
  }
  
  return yaml;
}

// Convert a drug entry to Markdown
function drugToMarkdown(drug) {
  const { wiki_content, ...frontmatter } = drug;
  
  let content = '---\n';
  content += toYAML(frontmatter);
  content += '---\n\n';
  
  if (wiki_content) {
    content += wiki_content;
  } else {
    content += `# ${drug.name_cn} (${drug.name_en})\n\n`;
    content += `> 此药物尚无详细百科内容。请在此处添加详细信息。\n\n`;
    content += `## 作用机制\n\n`;
    content += `（待补充）\n\n`;
    content += `## 临床应用\n\n`;
    content += `（待补充）\n\n`;
    content += `## 不良反应\n\n`;
    content += `（待补充）\n`;
  }
  
  return content;
}

// Convert a principle entry to Markdown
function principleToMarkdown(principle) {
  const { wiki_content, content, ...frontmatter } = principle;
  
  let mdContent = '---\n';
  mdContent += toYAML(frontmatter);
  mdContent += '---\n\n';
  
  // Add the original short content as the introduction section (shown above)
  if (content) {
    mdContent += `${content}\n\n`;
  }
  
  // Add wiki content if available - this is for detailed content below
  if (wiki_content) {
    mdContent += wiki_content;
  } else {
    // Leave space for user to add content later
    mdContent += `## 详细内容\n\n`;
    mdContent += `（待补充详细内容）\n`;
  }
  
  return mdContent;
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting JSON to Markdown migration (Lazy Loading Mode)...\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const drugsIndexPath = path.join(projectRoot, 'public', 'drugs-index.json');
  const principlesIndexPath = path.join(projectRoot, 'public', 'principles-index.json');
  const drugsDetailDir = path.join(projectRoot, 'public', 'drugs');
  const principlesDetailDir = path.join(projectRoot, 'public', 'principles');
  const contentDir = path.join(projectRoot, 'content');
  
  // Fallback to old format for backward compatibility
  const drugsJsonPath = path.join(projectRoot, 'public', 'drugs.json');
  const principlesJsonPath = path.join(projectRoot, 'public', 'principles.json');
  
  // Check if new index files exist, otherwise fall back to old format
  let drugs = [];
  let principles = [];
  let useNewFormat = false;
  
  // Try new format first
  if (fs.existsSync(drugsIndexPath) && fs.existsSync(drugsDetailDir)) {
    useNewFormat = true;
    console.log('📋 Reading from new lazy-loading format...\n');
    
    // Read drug details from individual files
    const drugFiles = fs.readdirSync(drugsDetailDir).filter(f => f.endsWith('.json'));
    drugs = drugFiles.map(file => {
      const filePath = path.join(drugsDetailDir, file);
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    });
    
    // Read principle details from individual files
    const principleFiles = fs.readdirSync(principlesDetailDir).filter(f => f.endsWith('.json'));
    principles = principleFiles.map(file => {
      const filePath = path.join(principlesDetailDir, file);
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    });
  } else if (fs.existsSync(drugsJsonPath) && fs.existsSync(principlesJsonPath)) {
    // Fallback to old single-file format
    console.log('📋 Reading from old monolithic format...\n');
    
    const drugsData = JSON.parse(fs.readFileSync(drugsJsonPath, 'utf-8'));
    drugs = drugsData.drugs || [];
    
    const principlesData = JSON.parse(fs.readFileSync(principlesJsonPath, 'utf-8'));
    principles = principlesData.principles || principlesData.receptors || [];
  } else {
    console.error(`❌ Error: Neither new (drugs-index.json + drugs/*.json) nor old (drugs.json) format found`);
    process.exit(1);
  }
  
  // Create content directories
  const drugsMdDir = path.join(contentDir, 'drugs');
  const principlesMdDir = path.join(contentDir, 'principles');
  ensureDir(drugsMdDir);
  ensureDir(principlesMdDir);
  
  // Migrate drugs
  console.log('\n📦 Migrating drugs...');
  let drugsConverted = 0;
  drugs.forEach(drug => {
    const filename = `${drug.id}.md`;
    const filepath = path.join(drugsMdDir, filename);
    const markdown = drugToMarkdown(drug);
    fs.writeFileSync(filepath, markdown, 'utf-8');
    drugsConverted++;
    console.log(`  ✓ ${drug.name_cn} (${drug.id})`);
  });
  
  // Migrate principles
  console.log('\n📚 Migrating principles...');
  let principlesConverted = 0;
  principles.forEach(principle => {
    if (principle.id === 'unique_id') {
      console.log(`  ⊘ Skipped template entry: ${principle.id}`);
      return; // Skip template entry
    }
    
    const filename = `${principle.id}.md`;
    const filepath = path.join(principlesMdDir, filename);
    const markdown = principleToMarkdown(principle);
    fs.writeFileSync(filepath, markdown, 'utf-8');
    principlesConverted++;
    console.log(`  ✓ ${principle.title} (${principle.id})`);
  });
  
  // Create README for content directory
  const readmePath = path.join(contentDir, 'README.md');
  const readmeContent = `# Psych-Pedia 内容源文件

此目录包含所有药物和原理的 Markdown 源文件。

## 目录结构

\`\`\`
content/
├── drugs/          # 药物条目 (${drugsConverted} 个文件)
├── principles/     # 原理/受体条目 (${principlesConverted} 个文件)
└── README.md       # 本文件
\`\`\`

## 编辑工作流

1. **编辑 Markdown 文件**：使用 Obsidian 或任何文本编辑器编辑 \`.md\` 文件
2. **同步到 JSON**：运行 \`npm run sync\` 将 Markdown 转换为 JSON
3. **查看更改**：刷新浏览器查看更新

## Frontmatter 格式

每个 Markdown 文件的开头包含 YAML frontmatter（由 \`---\` 包裹），存储结构化数据。
Frontmatter 之后的内容为 \`wiki_content\`（百科内容）。

### 药物文件示例

\`\`\`markdown
---
id: aripiprazole
name_cn: 阿立哌唑
name_en: Aripiprazole
category: SGA
tags:
  - "D2部分激动剂"
  - "不镇静"
stahl_radar:
  bindings:
    - label: D2
      value: 9.5
      action: partial_agonist
      link_id: d2
---

# 阿立哌唑

药物详细内容...
\`\`\`

## 注意事项

- **不要删除 frontmatter**：frontmatter 是必需的结构化数据
- **保持 ID 唯一**：每个文件的 \`id\` 必须唯一且与文件名一致
- **使用 UTF-8 编码**：确保文件使用 UTF-8 编码保存

---

生成时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
`;
  
  fs.writeFileSync(readmePath, readmeContent, 'utf-8');
  console.log(`\n✓ Created ${readmePath}`);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ Migration completed successfully!');
  console.log('='.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   - Source format: ${useNewFormat ? 'Lazy-loading (index + details)' : 'Monolithic'}`);
  console.log(`   - Drugs converted: ${drugsConverted}`);
  console.log(`   - Principles converted: ${principlesConverted}`);
  console.log(`   - Total files: ${drugsConverted + principlesConverted}`);
  console.log(`\n📁 Output directory: ${contentDir}`);
  console.log(`\n⚡ Next steps:`);
  console.log(`   1. Review the generated Markdown files in content/`);
  console.log(`   2. Edit files using Obsidian or any text editor`);
  console.log(`   3. Run "npm run sync" to convert back to JSON`);
  console.log(`   4. Refresh browser to see changes\n`);
}
migrate().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
