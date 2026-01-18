## 如何添加新的药物条目（用户指南）

### 📍 文件位置
- 所有药物数据都存储在：**`public/drugs.json`**

### 🚀 快速开始 - 三步添加新药物

#### 第 1 步：打开 `public/drugs.json` 文件
在你的文本编辑器中打开这个文件。你会看到：
- 顶部有 `_comment`、`_instructions` 和 `_template` 字段（这些只是说明，不会影响网站）
- 下面是一个 `drugs` 数组，里面已经有 4 个药物的例子（阿立哌唑、奥氮平、喹硫平、氟哌啶醇）

#### 第 2 步：复制一个完整的药物条目模板
找到 `_template` 字段，复制整个 `{}` 大括号内的内容，或者直接复制下面的代码：

```json
{
  "id": "示例药名英文小写（如：fluoxetine）- 用作唯一标识符，不能重复",
  "name_cn": "示例药名（中文）",
  "name_en": "示例药名（英文）",
  "category": "SGA / FGA 分类和特点（如：SGA - 部分激动剂）",
  "tags": ["标签1", "标签2", "标签3"],
  "stahl_radar": {
    "labels": ["D2", "5HT1A", "5HT2A", "H1", "M1"],
    "values": [9.5, 8.0, 8.5, 2.0, 0.5],
    "link_ids": ["d2", "5ht1a", "5ht2a", "h1", "m1"]
  },
  "pearls": [
    {
      "title": "临床实战笔记的标题",
      "type": "danger",
      "content": "注意内容（danger=危险/红色, warning=黄色, success=绿色, info=蓝色）"
    }
  ],
  "pk_data": {
    "half_life": "半衰期（如：75h）",
    "protein_binding": "蛋白结合率（如：>99%）",
    "metabolism": "主要代谢途径（如：CYP2D6, CYP3A4）",
    "peak_time": "达峰时间（可选，如：3-5h）"
  },
  "market_info": {
    "price": "价格等级（$ / $$ / $$$）",
    "insurance": "医保状态（如：甲类医保）",
    "pregnancy": "妊娠分级（如：C类）"
  }
}
```

#### 第 3 步：修改字段值并添加到 drugs 数组
1. 将复制的内容粘贴到 `drugs` 数组的末尾（在最后一个 `}` 后面，添加逗号后再粘贴）
2. 修改各字段的值：
   - `id`：英文小写，不能与现有的重复（如：`sertraline`）
   - `name_cn`：中文药名（如：`舍曲林`）
   - `name_en`：英文药名（如：`Sertraline`）
   - `category`：药物分类（如：`SGA - SSRI`）
   - `tags`：3-4 个标签（用 `[]` 方括号包含，每个标签用 `""` 引号和 `,` 逗号分隔）
   - `stahl_radar`：雷达图数据
     - `labels`：受体名称（数组）
     - `values`：亲和力数值 0-10（数组，数字个数必须与 labels 一样）
     - `link_ids`：对应的受体机理 ID（必须是现有的，如：d2, 5ht1a, 5ht2a, h1, m1, alpha1, 5ht2c 等）
   - `pearls`：临床实战笔记列表（数组，每个笔记是一个 `{}` 对象）
     - `title`：笔记标题
     - `type`：`danger`（红）/ `warning`（黄）/ `success`（绿）/ `info`（蓝）
     - `content`：笔记内容（文本）
   - `pk_data`：药动学数据
     - `half_life`：半衰期（如：`30-33h`）
     - `protein_binding`：蛋白结合率（如：`93%`）
     - `metabolism`：主要代谢途径（如：`CYP1A2 (主), CYP2D6`）
     - `peak_time`（可选）：达峰时间
   - `market_info`：市场信息
     - `price`：`$` 或 `$$` 或 `$$$`
     - `insurance`：医保分类
     - `pregnancy`：妊娠分级

### ✅ 完整的实际例子
以下是添加"舍曲林"的例子：

```json
{
  "id": "sertraline",
  "name_cn": "舍曲林",
  "name_en": "Sertraline",
  "category": "一代抗抑郁药 - SSRI",
  "tags": ["SSRI", "抗抑郁", "焦虑友好"],
  "stahl_radar": {
    "labels": ["D2", "5HT1A", "5HT2A", "H1", "M1"],
    "values": [1.0, 5.0, 3.0, 1.0, 1.0],
    "link_ids": ["d2", "5ht1a", "5ht2a", "h1", "m1"]
  },
  "pearls": [
    {
      "title": "SSRI 之王 - 起效最快",
      "type": "success",
      "content": "在 SSRI 类中起效最快，通常 2-4 周见效。特别适合抑郁症和广泛焦虑症患者。"
    },
    {
      "title": "胃肠道不适常见",
      "type": "warning",
      "content": "初期可能出现恶心、腹泻、腹部不适。建议饭后服用，通常 1-2 周缓解。"
    }
  ],
  "pk_data": {
    "half_life": "26h",
    "protein_binding": "98%",
    "metabolism": "CYP2D6, CYP3A4",
    "peak_time": "4-8h"
  },
  "market_info": {
    "price": "$",
    "insurance": "甲类医保",
    "pregnancy": "C类"
  }
}
```

### ⚠️ 常见错误提示和修复

| 错误 | 原因 | 修复方法 |
|------|------|--------|
| **JSON 解析错误** | 漏掉逗号或引号 | 检查每个字段后面是否有 `,` （除了最后一个字段） |
| **网站显示"Drug not found"** | `id` 重复了 | 检查 `id` 是否与其他药物冲突，改成新的唯一名称 |
| **雷达图显示错误** | `link_ids` 中的值不存在 | 只能使用：`d2`, `5ht1a`, `5ht2a`, `h1`, `m1`, `alpha1`, `5ht2c` |
| **values 数量不对** | `values` 数组长度与 `labels` 不一致 | 两个数组的元素数量必须相同 |
| **文本不显示** | 忘记用 `""` 引号包含文本 | 所有文本值都必须用双引号，数字不需要引号 |

### 📝 保存后的步骤
1. **保存文件**：按 `Ctrl+S`（Windows）或 `Cmd+S`（Mac）
2. **刷新网页**：在浏览器中按 `F5` 或 `Ctrl+R` 刷新
3. **检查效果**：新药物应该出现在侧边栏的列表中，点击可以查看详情

### 🔗 "link_ids" 快速参考（雷达图受体机理）
这些是当前支持的受体 ID，在 `stahl_radar.link_ids` 中使用：

- `d2` - D2多巴胺受体
- `5ht1a` - 5-HT1A血清素受体
- `5ht2a` - 5-HT2A血清素受体
- `5ht2c` - 5-HT2C血清素受体
- `h1` - H1组胺受体
- `m1` - M1毒蕈碱受体
- `alpha1` - α1肾上腺素受体

### 💡 最佳实践

1. **保持数据一致性**
   - `id` 用英文小写，单词用 `-` 分隔（如：`fluoxetine-xl`）
   - 半衰期和代谢途径的格式保持一致

2. **Clinical Pearls（临床实战笔记）**
   - 每个药物至少 3-4 条笔记
   - 使用不同的 `type` 配色来突出不同的警告级别
   - 内容简洁有力，突出临床要点

3. **Radar Chart 数据**
   - `values` 的数字范围是 0-10（0 表示无效应，10 表示最强）
   - 保持数据的相对准确性（同类药物便于对比）

4. **测试你的添加**
   - 打开浏览器的"开发者工具"（F12），检查 Console 是否有错误
   - 确认新药物在侧边栏可见且能点击进去

### 🆘 故障排查

**网站加载失败 / 药物列表为空？**
- 检查 `public/drugs.json` 文件是否有语法错误（用在线 JSON 验证工具 https://jsonlint.com/ 检查）
- 确保 `drugs` 数组不为空，至少有一个完整的药物条目

**修改后刷新网页仍无变化？**
- 清除浏览器缓存（Ctrl+Shift+Delete）
- 关闭开发服务器，再次运行 `npm run dev`

**某些字段显示不出来？**
- 检查是否所有必填字段都已填写
- 确保 JSON 格式正确（没有多余或缺少的括号/引号）

---

**恭喜！你现在可以自己添加和管理药物数据了！🎉**
