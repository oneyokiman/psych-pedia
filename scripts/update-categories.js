#!/usr/bin/env node

/**
 * 更新所有 MD 文件中的 category 字段
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacements = {
    '"SSRI"': '"选择性血清素转运体抑制剂（SSRI）"',
    '"SNRI"': '"血清素-去甲肾上腺素转运体抑制剂（SNRI）"',
    '"TCA"': '"三环抗抑郁药（TCA）"',
    '"NDRI"': '"去甲肾-多巴胺转运体抑制剂（NDRI）"',
    '"NRI"': '"去甲肾上腺素转运体抑制剂（NRI）"',
    '"SARI"': '"5-HT2A拮抗剂/再摄取抑制剂（SARI）"',
    '"NaSSA"': '"去甲肾-特异性血清素抗抑郁药（NaSSA）"',
    '"SMS"': '"血清素调制剂（SMS）"',
    '"SGA"': '"第二代抗精神病药（SGA）"',
    '"Benzodiazepine"': '"苯二氮䓬类（BZD）"',
    '"Z-Drug"': '"非苯二氮䓬类催眠药（Z-Drug）"',
    '"ADHD Stimulant"': '"ADHD 刺激类药物"',
    '"ADHD Non-Stimulant"': '"ADHD 非刺激类药物"',
    '"Anxiolytic"': '"抗焦虑药"',
    '"Anxiolytic/Analgesic"': '"抗焦虑/镇痛药"',
    '"Mood Stabilizer"': '"情绪稳定剂"',
    '"Mood Stabilizer Adjunct"': '"情绪稳定剂辅助药物"',
    '"SSRE"': '"选择性血清素转运体抑制剂（SSRE）"'
};

async function updateCategories() {
    console.log('🔄 开始更新 category 字段...\n');
    
    const projectRoot = path.resolve(__dirname, '..');
    const drugsDir = path.join(projectRoot, 'content', 'drugs');
    
    const files = fs.readdirSync(drugsDir).filter(f => f.endsWith('.md'));
    let updateCount = 0;
    
    files.forEach(file => {
        const filePath = path.join(drugsDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        const originalContent = content;
        
        for (const [oldVal, newVal] of Object.entries(replacements)) {
            if (content.includes(oldVal)) {
                content = content.replace(oldVal, newVal);
                updateCount++;
            }
        }
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`✓ ${file}`);
        }
    });
    
    console.log(`\n✅ 完成！共更新 ${updateCount} 处`);
}

updateCategories().catch(error => {
    console.error('❌ 更新失败:', error);
    process.exit(1);
});
