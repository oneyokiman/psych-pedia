import pandas as pd
import json
import os
import re  # 引入正则模块，用于动态识别列名

# --- 配置部分 ---
EXCEL_FILE_PATH = "psych_pedia_drugs.xlsx"
JSON_OUTPUT_PATH = "drugs_updated.json"

# --- 辅助函数 (保持不变) ---
def clean_str(val):
    if pd.isna(val) or val == "":
        return ""
    return str(val).strip()

def str_to_list(val, separator=","):
    s = clean_str(val)
    if not s:
        return []
    s = s.replace("，", ",")
    return [item.strip() for item in s.split(separator) if item.strip()]

def str_to_float_list(val, separator=","):
    str_list = str_to_list(val, separator)
    try:
        return [float(x) for x in str_list]
    except ValueError:
        return []

# --- 核心逻辑 ---
def convert_excel_to_json(excel_path, json_path):
    if not os.path.exists(excel_path):
        print(f"错误: 找不到文件 {excel_path}")
        return

    try:
        df = pd.read_excel(excel_path)
    except Exception as e:
        print(f"读取 Excel 失败: {e}")
        return

    drugs_list = []
    
    # 遍历每一行数据
    for index, row in df.iterrows():
        drug_id = clean_str(row.get("ID"))
        if not drug_id:
            continue

        # --- 1. 基础字段处理 ---
        drug = {
            "id": drug_id,
            "name_cn": clean_str(row.get("中文名")),
            "name_en": clean_str(row.get("英文名")),
            "category": clean_str(row.get("分类 (Category)")),
            "tags": str_to_list(row.get("标签 (Tags)")),
        }

        # --- 2. Radar & PK & Market (标准字段) ---
        radar_labels = str_to_list(row.get("Radar: 受体"))
        radar_values = str_to_float_list(row.get("Radar: 亲和值"))
        link_ids = [label.lower().replace(" ", "") for label in radar_labels]

        drug["stahl_radar"] = {
            "labels": radar_labels,
            "values": radar_values,
            "link_ids": link_ids
        }

        drug["pk_data"] = {
            "half_life": clean_str(row.get("PK: 半衰期")),
            "protein_binding": clean_str(row.get("PK: 蛋白结合率")),
            "metabolism": clean_str(row.get("PK: 代谢途径")),
            "peak_time": clean_str(row.get("PK: 达峰时间"))
        }

        drug["market_info"] = {
            "price": clean_str(row.get("市场: 价格等级")),
            "insurance": clean_str(row.get("市场: 医保状态")),
            "pregnancy": clean_str(row.get("市场: 妊娠分级"))
        }

        # --- 3. 动态扫描 Pearls (关键修改) ---
        # 创建一个临时字典来存储解析到的 Pearl 数据
        # 结构示例: { 1: {'title': '...', 'content': '...'}, 2: {...} }
        pearls_temp = {}

        # 遍历该行的所有列名
        for col_name in df.columns:
            # 正则匹配：查找以 "Pearl " 开头，后面跟数字，再跟冒号的列
            # 例如: "Pearl 1: 标题", "Pearl 10: 内容"
            match = re.match(r"^Pearl\s+(\d+):\s+(.*)$", col_name.strip())
            
            if match:
                pearl_idx = int(match.group(1)) # 提取数字 (如 1, 2, 10)
                field_cn = match.group(2)       # 提取字段名 (如 "标题", "内容")
                
                # 建立列名映射
                field_map = {
                    "标题": "title",
                    "类型": "type",
                    "内容": "content"
                }
                
                if field_cn in field_map:
                    field_key = field_map[field_cn]
                    cell_val = clean_str(row.get(col_name))
                    
                    # 初始化该索引的字典
                    if pearl_idx not in pearls_temp:
                        pearls_temp[pearl_idx] = {}
                    
                    # 存入数据
                    pearls_temp[pearl_idx][field_key] = cell_val

        # 将临时字典转换为最终的列表
        final_pearls = []
        # 按索引排序 (确保 Pearl 1 在 Pearl 2 前面)
        for idx in sorted(pearls_temp.keys()):
            p_data = pearls_temp[idx]
            
            # 只有当标题或内容不为空时，才添加这个笔记
            if p_data.get("title") or p_data.get("content"):
                final_pearls.append({
                    "title": p_data.get("title", ""),
                    "type": p_data.get("type", "info"), # 默认类型 info
                    "content": p_data.get("content", "")
                })

        drug["pearls"] = final_pearls
        drugs_list.append(drug)

    # 4. 构建并保存
    final_data = {
        "_comment": "==================== Psych-Pedia 药物数据库 ====================",
        "_instructions": "此文件由 Excel 脚本生成。",
        "_template": { "id": "template_id", "pearls": [] }, # 简化的模板
        "drugs": drugs_list
    }

    try:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)
        print(f"转换成功！已处理 {len(drugs_list)} 个药物条目。")
        print(f"最大 Pearl 数量无限制，已自动合并。")
        print(f"文件保存至: {json_path}")
    except Exception as e:
        print(f"写入 JSON 失败: {e}")

if __name__ == "__main__":
    convert_excel_to_json(EXCEL_FILE_PATH, JSON_OUTPUT_PATH)