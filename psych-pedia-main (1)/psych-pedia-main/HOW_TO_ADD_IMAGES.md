# 如何在百科中添加图片

## 📍 支持的内容
受体百科和生物学假说详情页面现在支持添加图片！

## 🖼️ 三种方式添加图片

### 方式 1：使用外部 URL（推荐）
最简单的方法是使用外部图片链接（如 CDN 或公开图片网址）。

**在 `public/principles.json` 中添加 `visual_guide` 字段**：

```json
{
  "id": "d2",
  "type": "receptor",
  "title": "D2 多巴胺受体",
  "subtitle": "Dopamine D2 Receptor",
  "content": "D2受体阻断是抗精神病药物效能的基石...",
  "visual_guide": "https://upload.wikimedia.org/wikipedia/commons/example.jpg"
}
```

### 方式 2：使用本地文件（推荐用于长期托管）
将图片放在项目的 `public/images/` 文件夹中，然后引用相对路径。

**步骤**：
1. 在项目根目录创建 `public/images/` 文件夹
2. 将你的图片放进去（例如：`D2-receptor.png`）
3. 在 JSON 中引用：

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

### 方式 3：使用 Base64 编码（不推荐）
对于很小的图片，可以直接用 Base64 编码嵌入 JSON，但不推荐此方法，因为会让 JSON 文件变得很大。

---

## 📋 完整示例

这是一个完整的受体条目示例，包含图片：

```json
{
  "id": "d2",
  "type": "receptor",
  "title": "D2 多巴胺受体",
  "subtitle": "Dopamine D2 Receptor",
  "content": "D2受体阻断是抗精神病药物效能的基石。阻断中脑边缘通路可改善幻觉、妄想等阳性症状；但过度阻断黑质纹状体通路会导致锥体外系反应(EPS)，阻断结节漏斗通路会导致泌乳素升高。",
  "visual_guide": "/images/d2-receptor-diagram.png"
}
```

---

## 🎨 图片建议

### 图片尺寸和格式
- **推荐宽度**：800-1200px
- **推荐高度**：400-600px（最大显示高度为 500px）
- **推荐格式**：PNG、JPG、WebP
- **文件大小**：50-300KB（太大会加载缓慢）

### 图片内容
- 受体结构图或神经生物学示意图
- 假说的机制图解
- 神经通路图
- 分子结构式
- 病理生理示意图

---

## 🔧 如何添加到项目

### 第 1 步：准备图片文件
1. 找到或创建你的医学图片（可以来自教科书、论文、医学数据库等）
2. 确保有版权/许可权使用该图片
3. 调整大小到推荐尺寸

### 第 2 步：上传图片到项目
**选项 A：本地托管**
1. 创建 `public/images/` 文件夹（如果不存在）
2. 将图片复制到这个文件夹
3. 记住文件名（如 `d2-receptor.png`）

**选项 B：使用 CDN 或外部链接**
1. 上传图片到图片托管服务（如 Imgur、CDN 等）
2. 复制图片的公开 URL

### 第 3 步：编辑 JSON 文件
打开 `public/principles.json`，找到对应的受体或假说条目，添加 `visual_guide` 字段：

```json
"visual_guide": "/images/d2-receptor.png"
// 或
"visual_guide": "https://example.com/images/d2.jpg"
```

### 第 4 步：保存并测试
1. 保存 `principles.json` 文件
2. 刷新网页（F5）
3. 点击对应的受体/假说，查看图片是否显示

---

## ⚠️ 常见问题

### Q: 添加了 visual_guide 但图片不显示？
**A**: 检查以下几点：
1. 确认 URL 或路径正确
2. 确认图片文件存在（本地托管时）
3. 确认 URL 可以访问（外部链接时）
4. 清除浏览器缓存（Ctrl+Shift+Delete）后刷新
5. 打开浏览器开发者工具（F12），检查 Console 是否有错误信息

### Q: 图片显示不全或被裁剪了？
**A**: 调整图片大小。网站会自动缩放图片，最大宽度为页面宽度，最大高度为 500px。建议使用宽高比 2:1 或 16:9 的图片。

### Q: 能不能添加动画或视频？
**A**: 目前只支持静态图片。如果需要添加动画或视频，可以考虑：
- 使用 GIF 动画（将其作为普通图片添加）
- 使用视频截图作为缩略图

### Q: 本地文件和外部 URL，哪个更好？
**A**: 
- **本地文件**：更快、更可靠、不依赖外部服务
- **外部 URL**：节省项目空间、易于更新

建议**长期使用本地文件**，**临时展示使用外部 URL**。

---

## 📝 实际例子

### 例 1：添加 D2 受体的结构图
```json
{
  "id": "d2",
  "type": "receptor",
  "title": "D2 多巴胺受体",
  "subtitle": "Dopamine D2 Receptor",
  "content": "D2受体阻断是抗精神病药物效能的基石...",
  "visual_guide": "/images/d2-structure.png"
}
```

### 例 2：添加多巴胺假说的机制图
```json
{
  "id": "dopamine_hypothesis",
  "type": "hypothesis",
  "title": "多巴胺假说",
  "subtitle": "The Dopamine Hypothesis",
  "content": "精神分裂症的经典假说...",
  "visual_guide": "/images/dopamine-hypothesis-pathway.png"
}
```

---

## 💡 获取免费医学图片的资源

| 网站 | 说明 | 协议 |
|------|------|------|
| [Wikimedia Commons](https://commons.wikimedia.org/) | 百科全书式的医学图片库 | 开源/CC 协议 |
| [PubMed Central](https://www.ncbi.nlm.nih.gov/pmc/) | 医学论文中的图片 | 根据论文而定 |
| [OpenStax](https://openstax.org/subjects/science) | 免费医学教科书图片 | CC BY 4.0 |
| [Unsplash/Pexels](https://unsplash.com/) | 通用图片库 | 免费商用 |
| [Pixabay](https://pixabay.com/) | 医学和科学图片 | CC0 Public Domain |

---

## 🚀 快速开始

**最快的 3 步添加图片**：

1. **准备图片 URL**（或放在 `public/images/` 中）
2. **打开** `public/principles.json`
3. **在对应条目中添加**：
   ```json
   "visual_guide": "你的图片URL或路径"
   ```
4. **保存，刷新网页** ✅

---

## 📸 文件夹结构参考

如果使用本地托管，项目结构应如下：

```
public/
├── drugs.json
├── principles.json
└── images/              ← 新建此文件夹
    ├── d2-receptor.png
    ├── 5ht1a-pathway.png
    ├── dopamine-hypothesis.png
    └── ...其他图片
```

---

**就这么简单！现在你可以为百科添加专业的医学插图了！🎨**
