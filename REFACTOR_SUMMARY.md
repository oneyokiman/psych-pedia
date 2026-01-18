# Psych-Pedia 完整重构报告

## ✅ 全面重构完成

你的 Psych-Pedia 网站已经成功完成**全数据 JSON 化重构**，现在所有数据（药物、受体、假说）都完全独立于代码，以 JSON 格式存储，可以不用任何编程知识轻松管理！

## 🔄 做了什么？

### 第一阶段：药物数据（已完成）✅
- **文件**：`public/drugs.json`
- **内容**：4 个现有药物的完整数据
- **用户指南**：`HOW_TO_ADD_DRUGS.md`

### 第二阶段：受体与假说数据（刚完成）✅
- **文件**：`public/principles.json`
- **内容**：7 个受体 + 2 个假说，分开存储在 `receptors` 和 `hypotheses` 两个数组
- **用户指南**：`HOW_TO_ADD_PRINCIPLES.md`

### 代码修改 ✅
- **App.tsx**：
  - 移除硬编码的 `PRINCIPLES` 导入
  - 添加异步加载 `principles.json` 的逻辑
  - 动态加载时合并 `receptors` 和 `hypotheses` 数组
  - 保持与 `drugs.json` 加载逻辑一致

- **constants.ts**：
  - `PRINCIPLES` 现为空数组（向后兼容）
  - `DRUGS` 保留但不再使用（将来可以完全移除）

## 📂 项目结构（数据管理）

```
public/
├── drugs.json          ← 药物数据（4 个条目 + 模板）
└── principles.json     ← 受体和假说数据（9 个条目 + 模板）

文档/
├── HOW_TO_ADD_DRUGS.md       ← 如何添加药物（详细指南）
├── HOW_TO_ADD_PRINCIPLES.md  ← 如何添加受体/假说（详细指南）
├── QUICK_REFERENCE.md        ← 快速参考卡
└── REFACTOR_SUMMARY.md       ← 本文件
```

## 🎯 现在你可以做什么

### ✅ 药物管理
- 添加新药物
- 修改现有药物信息
- 更新临床笔记
- 调整雷达图数据

### ✅ 受体百科管理
- 添加新的神经受体
- 修改现有受体描述
- 更新机制说明

### ✅ 假说管理
- 添加新的神经生物学假说
- 修改现有假说描述
- 更新科学依据

**所有这些操作都只需编辑 JSON 文件，刷新网页即可生效！**

## 🚀 快速开始指南

### 添加新药物
1. 打开 `public/drugs.json`
2. 复制最后一个药物对象
3. 修改字段值
4. 保存并刷新

参考文档：`HOW_TO_ADD_DRUGS.md`

### 添加新受体
1. 打开 `public/principles.json`
2. 找到 `receptors` 数组
3. 复制最后一个受体对象
4. 修改字段值
5. 保存并刷新

参考文档：`HOW_TO_ADD_PRINCIPLES.md`

### 添加新假说
1. 打开 `public/principles.json`
2. 找到 `hypotheses` 数组
3. 复制最后一个假说对象
4. 修改字段值
5. 保存并刷新

参考文档：`HOW_TO_ADD_PRINCIPLES.md`  

## 📂 重要文件一览

| 文件 | 用途 | 是否需要编辑 |
|------|------|-----------|
| `public/drugs.json` | 🔴 **主要文件** - 所有药物数据存这里 | ✅ 经常编辑 |
| `public/principles.json` | 🔴 **主要文件** - 所有受体和假说数据 | ✅ 经常编辑 |
| `HOW_TO_ADD_DRUGS.md` | 📖 药物添加详细指南 | ✅ 参考 |
| `HOW_TO_ADD_PRINCIPLES.md` | 📖 受体/假说添加详细指南 | ✅ 参考 |
| `QUICK_REFERENCE.md` | ⚡ 快速查询卡片 | ✅ 参考 |
| `App.tsx` | 💻 代码逻辑，自动加载 JSON | ❌ 不需要 |
| `constants.ts` | ⚠️ 已清空，仅保留空数组用于兼容 | ❌ 不需要 |

## 📚 数据文件详细说明

### `public/drugs.json` 结构
```json
{
  "_comment": "说明文字",
  "_instructions": "使用说明",
  "_template": { /* 模板对象 */ },
  "drugs": [
    /* 药物对象数组 */
  ]
}
```

### `public/principles.json` 结构
```json
{
  "_comment": "说明文字",
  "_instructions": "使用说明",
  "_template": { /* 模板对象 */ },
  "receptors": [
    /* 受体对象数组 */
  ],
  "hypotheses": [
    /* 假说对象数组 */
  ]
}
```

## 🔗 数据关联说明

### 受体与药物的关联
药物的雷达图显示受体亲和力，通过 `link_ids` 字段关联：

```json
// 在 drugs.json 中
"stahl_radar": {
  "labels": ["D2", "5HT2A", ...],        // 显示标签
  "values": [9.5, 8.0, ...],             // 亲和力数值
  "link_ids": ["d2", "5ht2a", ...]       // 关联 principles.json 中的 id
}

// 在 principles.json 中
{
  "id": "d2",                            // 必须与 link_ids 中的值对应
  "type": "receptor",
  "title": "D2 多巴胺受体",
  "content": "..."
}
```

**重要**：如果要在雷达图中显示新受体，必须确保：
1. `principles.json` 中有该受体的定义
2. `drugs.json` 中药物的 `link_ids` 包含该受体的 ID

## ✨ 技术优势

- ✅ **零编程学习曲线** - 只需会编辑 JSON 文件
- ✅ **实时更新** - 无需重新构建，刷新即可
- ✅ **完全分离** - 数据与代码完全独立
- ✅ **易于维护** - 数据格式统一，便于版本控制
- ✅ **可扩展** - 轻松添加数十个或数百个条目
- ✅ **备份友好** - JSON 文件易于备份和迁移
- ✅ **团队协作** - 多人可同时编辑不同数据

## 📚 文档导航

| 文件 | 内容 |
|------|------|
| `HOW_TO_ADD_DRUGS.md` | 药物添加详细指南，包括快速开始、字段说明、实例、错误修复 |
| `HOW_TO_ADD_PRINCIPLES.md` | 受体/假说添加详细指南，同样包含完整说明 |
| `QUICK_REFERENCE.md` | 快速参考卡片，包含 JSON 模板、字段对照表、常见错误 |
| `REFACTOR_SUMMARY.md` | 本文件（重构总体说明） |

## 🚨 常见问题

**Q: 修改 JSON 后网站没有更新？**  
A: 清除浏览器缓存（Ctrl+Shift+Delete）后刷新，或用隐私/无痕模式打开网站。

**Q: JSON 文件有错误时会怎样？**  
A: 网站会显示"加载中..."，检查浏览器开发者工具的 Console 查看错误信息。用在线 JSON 验证工具检查语法：https://jsonlint.com/

**Q: 我想删除某个药物或受体？**  
A: 直接从相应的数组中删除该对象的整个 `{}` 块，记得处理好逗号。

**Q: 我想在两个文件中都改数据，会不会出问题？**  
A: 不会。`drugs.json` 和 `principles.json` 完全独立，可以同时编辑。

**Q: 如何添加新受体并让其在雷达图中显示？**  
A: 
1. 在 `principles.json` 的 `receptors` 中添加新受体
2. 在 `drugs.json` 中的药物条目中添加该受体 ID 到 `link_ids` 数组
3. 在 `labels` 中添加显示名称，在 `values` 中添加亲和力数值

## 🔧 技术细节（如果你感兴趣）

### App.tsx 的数据加载流程
```typescript
// 1. 加载 drugs.json
const response = await fetch('/drugs.json');
const data = await response.json();
setDrugs(data.drugs);

// 2. 加载 principles.json
const response = await fetch('/principles.json');
const data = await response.json();
// 合并 receptors 和 hypotheses
const allPrinciples = [
  ...data.receptors,
  ...data.hypotheses
];
setPrinciples(allPrinciples);

// 3. 网页加载时，components 会使用 drugs 和 principles 状态来渲染
```

## 🎓 最佳实践总结

### 数据组织
- 每个数据文件保持逻辑清晰（药物与百科分开）
- 使用有意义的 ID（易于识别和维护）
- 定期备份 JSON 文件

### 编辑工作流
1. 在本地文本编辑器修改 JSON
2. 用 JSONLint 验证语法：https://jsonlint.com/
3. 保存文件
4. 刷新网页查看效果
5. 如有错误，检查 Console 并修正

### 版本管理（如果使用 Git）
```bash
git add public/drugs.json public/principles.json
git commit -m "Add new drug/receptor: XXX"
git push
```

## 🔮 将来的增强方向（可选）

如果将来想进一步优化，可以考虑：

1. **全文搜索** - 让用户按名称、作用、假说搜索
2. **对比功能** - 同时展示多个药物或受体的对比
3. **导出功能** - 导出为 PDF、Excel 或 Markdown
4. **编辑界面** - 创建一个简单的网页表单来编辑 JSON（无需手动编辑）
5. **多语言支持** - 支持中英文自动切换
6. **医学文献链接** - 添加到 PubMed、指南的引用链接
7. **药物对比雷达图** - 同时显示多个药物的雷达图进行对比

但现在的架构已经完全满足你的需求了！

---

## 总结

**你现在拥有一个完全由 JSON 驱动的医学百科网站！** 🎉

所有数据都以易于编辑的 JSON 格式存储，无需任何编程知识就能维护和扩展内容。网站界面保持美观专业，用户体验不变，但你的内容管理变得前所未有的简单。

**文件清单**：
- ✅ `public/drugs.json` - 药物数据
- ✅ `public/principles.json` - 受体与假说数据
- ✅ `src/App.tsx` - 改为动态加载
- ✅ `src/constants.ts` - 清空硬编码数据
- ✅ `HOW_TO_ADD_DRUGS.md` - 药物添加指南
- ✅ `HOW_TO_ADD_PRINCIPLES.md` - 受体/假说添加指南
- ✅ `QUICK_REFERENCE.md` - 快速参考

**下一步**：选择一份指南（`HOW_TO_ADD_DRUGS.md` 或 `HOW_TO_ADD_PRINCIPLES.md`）开始添加你的内容！

有问题？文档里都有详细说明。祝你使用愉快！ 🚀
