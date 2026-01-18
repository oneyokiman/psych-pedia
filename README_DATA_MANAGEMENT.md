# 📋 Psych-Pedia 重构完成 - 快速总结

## ✨ 大功告成！

你的网站现在完全 JSON 化了。**所有数据都从代码中独立出来**，存储在两个简洁的 JSON 文件中。

---

## 📁 两个核心数据文件

### 1️⃣ `public/drugs.json` - 药物数据库
包含：
- 4 个现有药物（阿立哌唑、奥氮平、喹硫平、氟哌啶醇）
- 完整模板（复制粘贴即可添加新药物）
- 清晰的注释和使用说明

**内容字段**：
- 基本信息：id, name_cn, name_en, category, tags
- 雷达图：stahl_radar (labels, values, link_ids)
- 临床笔记：pearls (title, type, content)
- 药动学：pk_data (half_life, protein_binding, metabolism, peak_time)
- 市场信息：market_info (price, insurance, pregnancy)

---

### 2️⃣ `public/principles.json` - 受体与假说百科
包含两个数组：

#### `receptors` 数组（受体）
- 7 个受体：D2、5HT1A、5HT2A、5HT2C、H1、M1、α1

#### `hypotheses` 数组（假说）
- 2 个假说：多巴胺假说、谷氨酸假说

---

## 🚀 如何添加新内容？

### 添加新药物（3 步）
1. 打开 `public/drugs.json`
2. 复制最后一个药物的 `{...}`
3. 修改数据，保存，刷新
✅ 新药物自动显示！

### 添加新受体（3 步）
1. 打开 `public/principles.json`
2. 在 `receptors` 数组中复制最后一个受体
3. 修改数据，保存，刷新
✅ 新受体百科页面立即显示！

### 添加新假说（3 步）
1. 打开 `public/principles.json`
2. 在 `hypotheses` 数组中复制最后一个假说
3. 修改数据，保存，刷新
✅ 新假说自动显示！

---

## 📚 详细文档

| 文件 | 内容 | 何时查看 |
|------|------|---------|
| `HOW_TO_ADD_DRUGS.md` | 药物添加完整指南 | 要添加/修改药物时 |
| `HOW_TO_ADD_PRINCIPLES.md` | 受体/假说完整指南 | 要添加/修改受体或假说时 |
| `QUICK_REFERENCE.md` | 快速查询卡（模板、ID、颜色代码） | 需要快速查找时 |
| `REFACTOR_SUMMARY.md` | 重构技术细节 | 想了解架构时 |

---

## 🔑 关键 ID 速查

### 受体 ID（用于药物的 link_ids）
```
d2, 5ht1a, 5ht2a, 5ht2c, h1, m1, alpha1
```

### Pearl 类型（临床笔记颜色）
```
danger  → 🔴 红色（危险/禁忌）
warning → 🟡 黄色（警告/需监测）
success → 🟢 绿色（优点/安全信息）
info    → 🔵 蓝色（一般信息）
```

---

## ⚠️ 常见陷阱

| ❌ 常见错误 | ✅ 解决办法 |
|-----------|----------|
| JSON 格式错误 | 用 https://jsonlint.com/ 验证 |
| ID 重复 | 改成唯一名称（例：用药物英文名 + 数字） |
| 缺少逗号 | 检查每个 `}` 前面是否有 `,`（最后一个除外） |
| 网页不显示新内容 | 清浏览器缓存（Ctrl+Shift+Del）后刷新 |
| 雷达图显示不了新受体 | 确保 drugs.json 中的 link_ids 包含该受体 ID |

---

## 📊 文件结构一览

```
public/
├── drugs.json           ← 🔴 重点关注
│   └── 药物数据 + 模板
│
└── principles.json      ← 🔴 重点关注
    ├── receptors[]      (受体)
    └── hypotheses[]     (假说)

src/
├── App.tsx              ← 已修改为动态加载
├── constants.ts         ← 已清空，仅保留兼容代码
└── ...

docs/
├── HOW_TO_ADD_DRUGS.md          ← 📖 详细指南
├── HOW_TO_ADD_PRINCIPLES.md     ← 📖 详细指南
├── QUICK_REFERENCE.md           ← ⚡ 快速查询
└── REFACTOR_SUMMARY.md          ← 📋 完整报告
```

---

## 🎯 下一步行动计划

- [ ] 阅读 `HOW_TO_ADD_DRUGS.md` 了解药物格式
- [ ] 阅读 `HOW_TO_ADD_PRINCIPLES.md` 了解受体/假说格式
- [ ] 在 `public/drugs.json` 中添加你的第一个新药物
- [ ] 在 `public/principles.json` 中添加你的第一个新受体或假说
- [ ] 分享网站给同事/朋友 ✨

---

## 💡 温馨提示

✅ **网站界面保持不变** - 用户看不出有什么区别  
✅ **数据完全独立** - 修改 JSON 不需要懂代码  
✅ **实时生效** - 刷新网页立即看到新数据  
✅ **易于备份** - JSON 文件可随时导出  
✅ **多人协作** - 团队成员可同时编辑不同数据  

---

## 🆘 需要帮助？

1. **JSON 语法错误？** → 查看 `HOW_TO_ADD_DRUGS.md` 或 `HOW_TO_ADD_PRINCIPLES.md` 中的"常见错误"部分
2. **想查字段说明？** → 打开 `QUICK_REFERENCE.md`
3. **想了解技术细节？** → 阅读 `REFACTOR_SUMMARY.md`
4. **想要完整例子？** → 查看各指南中的"完整实际例子"

---

**祝你使用愉快！现在你可以轻松管理一个专业的医学百科网站，而不需要任何编程知识。🚀**
