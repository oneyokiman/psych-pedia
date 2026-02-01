# Psych-Pedia 内容源文件

此目录包含所有药物和原理的 Markdown 源文件。

## 目录结构

```
content/
├── drugs/          # 药物条目 (45 个文件)
├── principles/     # 原理/受体条目 (21 个文件)
└── README.md       # 本文件
```

## 编辑工作流

1. **编辑 Markdown 文件**：使用 Obsidian 或任何文本编辑器编辑 `.md` 文件
2. **同步到 JSON**：运行 `npm run sync` 将 Markdown 转换为 JSON
3. **查看更改**：刷新浏览器查看更新

## Frontmatter 格式

每个 Markdown 文件的开头包含 YAML frontmatter（由 `---` 包裹），存储结构化数据。
Frontmatter 之后的内容为 `wiki_content`（百科内容）。

### 药物文件示例

```markdown
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
```

## 注意事项

- **不要删除 frontmatter**：frontmatter 是必需的结构化数据
- **保持 ID 唯一**：每个文件的 `id` 必须唯一且与文件名一致
- **使用 UTF-8 编码**：确保文件使用 UTF-8 编码保存

---

生成时间: 2026/2/1 12:12:01
