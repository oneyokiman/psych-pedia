# 如何添加新的受体或生物学假说

## 📍 文件位置
- 所有受体和假说数据都存储在：**`public/principles.json`**

## 🚀 快速开始 - 三步添加新受体或假说

### 第 1 步：打开 `public/principles.json` 文件
在你的文本编辑器中打开这个文件。你会看到：
- 顶部有 `_comment`、`_instructions` 和 `_template` 字段（这些只是说明）
- 下面是两个数组：
  - `receptors`：包含 7 个受体（D2、5HT1A、5HT2A 等）
  - `hypotheses`：包含 2 个假说（多巴胺假说、谷氨酸假说）

### 第 2 步：复制一个完整的模板
找到 `_template` 字段或直接从 `receptors` 或 `hypotheses` 中复制一个完整的 `{}` 对象。

**添加新受体的模板**：
```json
{
  "id": "英文小写唯一ID（如：dopamine，不能重复）",
  "type": "receptor",
  "title": "中文受体名称（如：多巴胺受体）",
  "subtitle": "英文受体名称（可选，如：Dopamine Receptor）",
  "content": "详细的医学描述，说明该受体的作用机制、临床意义等"
}
```

**添加新假说的模板**：
```json
{
  "id": "英文小写唯一ID（如：serotonin_hypothesis）",
  "type": "hypothesis",
  "title": "中文假说名称（如：血清素假说）",
  "subtitle": "英文假说名称（可选，如：The Serotonin Hypothesis）",
  "content": "详细的假说描述和科学依据"
}
```

### 第 3 步：修改字段值并添加到对应数组
1. 将复制的内容粘贴到 `receptors` 或 `hypotheses` 数组的末尾
2. 确保在最后一个现有条目的 `}` 后面添加逗号，然后粘贴新条目
3. 修改各字段的值：
   - `id`：英文小写，不能与现有的重复（受体例：`gaba`, `glutamate`；假说例：`gaba_hypothesis`）
   - `type`：必须是 `receptor` 或 `hypothesis`
   - `title`：中文标题
   - `subtitle`：英文标题（可选）
   - `content`：详细描述（支持医学术语和缩写）

### ✅ 完整的实际例子

**添加一个新受体（GABA 受体）**：

找到 `receptors` 数组中最后一个受体（`alpha1`），在其 `}` 后面添加逗号和新对象：

```json
{
  "id": "gaba",
  "type": "receptor",
  "title": "GABA 受体",
  "subtitle": "Gamma-Aminobutyric Acid Receptor",
  "content": "GABA是大脑主要的抑制性神经递质。GABA受体激动可增强GABAergic神经元的抑制作用，导致镇静、肌肉松弛和抗痫效果。某些抗精神病药物具有间接的GABA增强作用。"
}
```

**添加一个新假说（GABA 假说）**：

找到 `hypotheses` 数组中最后一个假说（`glutamate_hypothesis`），在其 `}` 后面添加逗号和新对象：

```json
{
  "id": "gaba_hypothesis",
  "type": "hypothesis",
  "title": "GABA 假说",
  "subtitle": "The GABA Hypothesis of Schizophrenia",
  "content": "认为精神分裂症患者存在GABAergic神经元功能异常，导致兴奋-抑制失衡。提出通过增强GABA信号传递可能有助于改善精神分裂症症状。"
}
```

## ⚠️ 重要注意事项

### 受体 ID 与药物数据的关联
如果你添加了新的受体，并且想让其在雷达图中显示，还需要：
1. 在 `public/drugs.json` 中的 `stahl_radar.link_ids` 中使用这个新的受体 ID
2. 在 `stahl_radar.labels` 中添加对应的显示标签
3. 在 `stahl_radar.values` 中添加对应的亲和力数值（0-10）

**示例**：如果添加了 `gaba` 受体，你可以这样在阿立哌唑条目中使用它：
```json
"stahl_radar": {
  "labels": ["D2", "5HT1A", "5HT2A", "H1", "M1", "GABA"],
  "values": [9.5, 8.0, 8.5, 2.0, 0.5, 3.0],
  "link_ids": ["d2", "5ht1a", "5ht2a", "h1", "m1", "gaba"]
}
```

### ID 必须唯一
- 不能有两个受体或假说使用相同的 `id`
- 建议使用全小写英文，单词用下划线分隔（如：`5ht1a`, `dopamine_hypothesis`）

## 📝 现有受体和假说 ID 参考

### 现有受体（Receptors）
| ID | 中文名 |
|----|----|
| `d2` | D2 多巴胺受体 |
| `5ht1a` | 5-HT1A 受体 |
| `5ht2a` | 5-HT2A 受体 |
| `5ht2c` | 5-HT2C 受体 |
| `h1` | H1 组胺受体 |
| `m1` | M1 毒蕈碱受体 |
| `alpha1` | α1 肾上腺素受体 |

### 现有假说（Hypotheses）
| ID | 中文名 |
|----|-----|
| `dopamine_hypothesis` | 多巴胺假说 |
| `glutamate_hypothesis` | 谷氨酸假说 |

## 🔍 常见错误和修复

| ❌ 错误 | ✅ 修复 |
|--------|--------|
| JSON 语法错误 | 用在线工具验证：https://jsonlint.com/ |
| ID 重复 | 改成唯一名称 |
| 缺少逗号 | 检查每个 `}` 前是否有逗号（除了最后一个） |
| `type` 拼写错误 | 只能是 `receptor` 或 `hypothesis`（全小写） |
| 在雷达图中显示不了 | 检查药物 JSON 中的 `link_ids` 是否对应新受体的 `id` |

## 💾 保存和测试

1. **保存文件**：按 `Ctrl+S`
2. **刷新网页**：按 `F5` 或 `Ctrl+R`
3. **检查效果**：
   - 新受体应该在网站中能被点击（如果药物数据中有引用）
   - 新假说会立即在百科页面中显示
4. **如果没显示**：
   - 检查浏览器开发者工具（F12 → Console），查看是否有错误信息
   - 确保 JSON 文件格式完全正确

## 🎯 最佳实践

1. **内容结构**
   - 受体描述应包括：名称、作用机制、临床相关性、副作用关联
   - 假说描述应包括：假说内容、科学依据、临床意义

2. **标题和副标题**
   - `title`（中文）用于网站主要显示
   - `subtitle`（英文）用于学术参考，建议添加

3. **描述长度**
   - 保持在 100-300 字左右
   - 简洁有力，突出关键概念
   - 可包含医学缩写（如 EPS、NMDA 等）

4. **ID 命名规范**
   - 全小写英文字母
   - 多个单词用下划线分隔（如：`5ht1a`, `dopamine_hypothesis`）
   - 避免使用特殊字符

---

**遇到问题？检查 JSON 语法或查看主文档 `HOW_TO_ADD_DRUGS.md`！**
