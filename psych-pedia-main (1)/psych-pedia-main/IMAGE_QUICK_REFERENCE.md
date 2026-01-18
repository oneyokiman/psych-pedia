# 快速添加图片 - 速查表

## ⚡ 30 秒快速上手

### 方式 A：外部 URL（最快）
在 `public/principles.json` 中添加：
```json
"visual_guide": "https://example.com/image.jpg"
```

### 方式 B：本地文件（推荐）
1. 创建 `public/images/` 文件夹
2. 放入图片文件（如 `d2.png`）
3. 在 JSON 中添加：
```json
"visual_guide": "/images/d2.png"
```

### 方式 C：完整示例
```json
{
  "id": "d2",
  "type": "receptor",
  "title": "D2 多巴胺受体",
  "subtitle": "Dopamine D2 Receptor",
  "content": "...",
  "visual_guide": "/images/d2-receptor.png"
}
```

---

## 📋 JSON 字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `visual_guide` | 图片 URL 或路径（可选） | `/images/d2.png` 或 `https://...` |

---

## 🖼️ 推荐图片规格

| 属性 | 推荐值 |
|------|--------|
| 宽度 | 800-1200px |
| 高度 | 400-600px |
| 最大显示高度 | 500px |
| 格式 | PNG, JPG, WebP |
| 文件大小 | 50-300KB |

---

## 📂 项目文件夹结构

```
public/
├── drugs.json
├── principles.json
└── images/
    ├── d2-receptor.png
    ├── 5ht1a-pathway.png
    └── ...其他图片
```

---

## ✅ 添加步骤清单

- [ ] 准备或下载医学图片
- [ ] 调整到推荐尺寸（800-1200px 宽，400-600px 高）
- [ ] **方式 A**：获取图片公开 URL，或
- [ ] **方式 B**：创建 `public/images/` 文件夹，放入图片
- [ ] 打开 `public/principles.json`
- [ ] 找到对应受体/假说条目
- [ ] 添加 `"visual_guide": "URL或路径"`
- [ ] 保存文件
- [ ] 刷新网页查看效果

---

## 🔗 免费医学图片来源

| 网站 | 类型 | 协议 |
|------|------|------|
| Wikimedia Commons | 医学、科学 | CC 协议 |
| OpenStax | 教科书 | CC BY 4.0 |
| PubMed | 论文配图 | 论文协议 |

---

## ⚠️ 常见错误

| 问题 | 原因 | 解决 |
|------|------|------|
| 图片不显示 | URL 错误或图片不存在 | 检查路径，清浏览器缓存 |
| 图片被裁剪 | 宽高比不对 | 调整图片大小 |
| 加载很慢 | 文件过大 | 压缩图片，控制在 300KB 以内 |

---

**详细指南请查看 `HOW_TO_ADD_IMAGES.md`**
