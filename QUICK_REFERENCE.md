# 快速参考卡：添加新药物

## ⚡ 30 秒快速指南

**文件位置**：`public/drugs.json`

**3 个步骤**：
1. 打开 `public/drugs.json`
2. 复制一个已有药物的整个 `{}` 对象（或使用 `_template` 模板）
3. 修改字段值，粘贴到 `drugs` 数组末尾，保存

**刷新网页**，新药物自动出现！

---

## 📋 必填字段速查表

```json
{
  "id": "英文小写唯一ID（如：sertraline）",
  "name_cn": "中文药名",
  "name_en": "英文药名",
  "category": "分类（如：SGA - 部分激动剂）",
  "tags": ["标签1", "标签2", "标签3"],
  "stahl_radar": {
    "labels": ["D2", "5HT1A", "5HT2A", "H1", "M1"],
    "values": [9, 8, 8, 2, 0],  // 0-10数字
    "link_ids": ["d2", "5ht1a", "5ht2a", "h1", "m1"]
  },
  "pearls": [
    {
      "title": "标题",
      "type": "danger|warning|success|info",  // 颜色类型
      "content": "内容描述"
    }
  ],
  "pk_data": {
    "half_life": "半衰期（如：75h）",
    "protein_binding": "蛋白结合率（如：>99%）",
    "metabolism": "代谢途径（如：CYP2D6, CYP3A4）",
    "peak_time": "达峰时间（可选）"
  },
  "market_info": {
    "price": "$|$$|$$$",
    "insurance": "医保分类",
    "pregnancy": "妊娠分级"
  }
}
```

---

## 🎨 Pearls 类型配色速查

| type | 颜色 | 用途 |
|------|------|------|
| `danger` | 🔴 红 | 严重风险、禁忌症 |
| `warning` | 🟡 黄 | 警告、需要监测 |
| `success` | 🟢 绿 | 优点、安全信息 |
| `info` | 🔵 蓝 | 一般信息、建议 |

---

## 🎯 Radar 受体 ID 速查

| ID | 含义 |
|----|------|
| `d2` | D2多巴胺受体 |
| `5ht1a` | 5-HT1A血清素受体 |
| `5ht2a` | 5-HT2A血清素受体 |
| `5ht2c` | 5-HT2C血清素受体 |
| `h1` | H1组胺受体 |
| `m1` | M1毒蕈碱受体 |
| `alpha1` | α1肾上腺素受体 |

---

## ⚠️ 常见错误

| ❌ 错误 | ✅ 修复 |
|--------|--------|
| JSON 语法错误 | 用在线工具验证：https://jsonlint.com/ |
| `id` 重复 | 改成唯一名称 |
| `values` 长度与 `labels` 不匹配 | 两个数组元素数必须相同 |
| 缺少逗号或引号 | 每个字段后加 `,`（最后一个除外），文本用 `""` |
| 网页不显示新药物 | 清浏览器缓存（Ctrl+Shift+Delete）后刷新 |

---

## 💡 最佳实践

- ✅ 半衰期示例：`75h`, `30-33h`, `6-7h`
- ✅ 代谢途径示例：`CYP2D6, CYP3A4`, `CYP1A2 (主), CYP2D6`
- ✅ 每个药物至少 3-4 条 Pearls
- ✅ Radar 数值 0-10，保持相对准确
- ✅ 定期保存并刷新网页测试

---

## 📚 详细文档位置

- 完整指南：`HOW_TO_ADD_DRUGS.md`
- 重构报告：`REFACTOR_SUMMARY.md`
- 数据文件：`public/drugs.json`

**有问题？查看 `HOW_TO_ADD_DRUGS.md` 的故障排查章节！**
