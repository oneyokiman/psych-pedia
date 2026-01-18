import json
import pandas as pd
import os

# --- 配置部分 ---
JSON_FILE_PATH = "drugs.json"
EXCEL_FILE_PATH = "psych_pedia_drugs.xlsx"

def transform_data_for_excel(drugs_list):
    """
    将嵌套的药物JSON数据转换为扁平化的字典列表。
    自动适应 Pearl 的最大数量。
    """
    flat_data = []
    
    # 1. 第一步：先算出所有药物中，谁的 Pearl 最多？
    max_pearl_count = 0
    for drug in drugs_list:
        pearls = drug.get("pearls", [])
        if len(pearls) > max_pearl_count:
            max_pearl_count = len(pearls)
            
    print(f"探测到最大 Pearl 数量为: {max_pearl_count}")

    # 2. 第二步：开始转换数据
    for drug in drugs_list:
        # --- 基础信息 ---
        base = {
            "ID": drug.get("id"),
            "中文名": drug.get("name_cn"),
            "英文名": drug.get("name_en"),
            "分类 (Category)": drug.get("category"),
            "标签 (Tags)": ", ".join(drug.get("tags", [])),
        }
        
        # --- PK 数据 ---
        pk = drug.get("pk_data", {})
        base.update({
            "PK: 半衰期": pk.get("half_life"),
            "PK: 蛋白结合率": pk.get("protein_binding"),
            "PK: 代谢途径": pk.get("metabolism"),
            "PK: 达峰时间": pk.get("peak_time"),
        })
        
        # --- 市场信息 ---
        market = drug.get("market_info", {})
        base.update({
            "市场: 价格等级": market.get("price"),
            "市场: 医保状态": market.get("insurance"),
            "市场: 妊娠分级": market.get("pregnancy"),
        })

        # --- Radar 数据 ---
        radar = drug.get("stahl_radar", {})
        base.update({
            "Radar: 受体": ", ".join(radar.get("labels", [])),
            "Radar: 亲和值": ", ".join(map(str, radar.get("values", []))),
        })
        
        # --- Pearls (动态生成) ---
        pearls = drug.get("pearls", [])
        
        # 循环直到 max_pearl_count，确保所有行都有相同的列数
        for i in range(max_pearl_count):
            # 动态生成列名，如 "Pearl 1: 标题", "Pearl 4: 内容"
            col_idx = i + 1
            
            if i < len(pearls):
                # 如果这个药有第 i 个 pearl，填入数据
                pearl = pearls[i]
                base[f"Pearl {col_idx}: 标题"] = pearl.get("title", "")
                base[f"Pearl {col_idx}: 类型"] = pearl.get("type", "")
                base[f"Pearl {col_idx}: 内容"] = pearl.get("content", "")
            else:
                # 如果这个药没有第 i 个 pearl，填空
                base[f"Pearl {col_idx}: 标题"] = ""
                base[f"Pearl {col_idx}: 类型"] = ""
                base[f"Pearl {col_idx}: 内容"] = ""
        
        flat_data.append(base)
        
    return flat_data, max_pearl_count

def convert_json_to_excel(json_filepath, excel_filepath):
    if not os.path.exists(json_filepath):
        print(f"错误: 找不到文件 '{json_filepath}'")
        return

    try:
        with open(json_filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            drugs_list = data.get("drugs", [])
    except Exception as e:
        print(f"读取 JSON 失败: {e}")
        return
        
    if not drugs_list:
        print("无数据。")
        return

    # 获取数据和最大 Pearl 数
    flat_data, max_pearl_count = transform_data_for_excel(drugs_list)
    
    df = pd.DataFrame(flat_data)
    
    # --- 动态构建列顺序 ---
    # 基础列
    desired_order = [
        "ID", "中文名", "英文名", "分类 (Category)", "标签 (Tags)",
        "PK: 半衰期", "PK: 蛋白结合率", "PK: 代谢途径", "PK: 达峰时间",
        "Radar: 受体", "Radar: 亲和值",
        "市场: 价格等级", "市场: 医保状态", "市场: 妊娠分级"
    ]
    
    # 动态添加 Pearl 列 (根据实际探测到的最大数量)
    for i in range(1, max_pearl_count + 1):
        desired_order.extend([
            f"Pearl {i}: 标题",
            f"Pearl {i}: 类型",
            f"Pearl {i}: 内容"
        ])
    
    # 重新排列列 (只取存在的列，防止出错)
    cols = [col for col in desired_order if col in df.columns]
    df = df[cols]
    
    try:
        df.to_excel(excel_filepath, index=False)
        print(f"成功！已保存 {len(drugs_list)} 条数据。")
        print(f"Excel 列已根据最大 Pearl 数量 ({max_pearl_count}) 自动扩展。")
        print(f"保存路径: {excel_filepath}")
    except Exception as e:
        print(f"保存 Excel 失败: {e}")

if __name__ == "__main__":
    convert_json_to_excel(JSON_FILE_PATH, EXCEL_FILE_PATH)