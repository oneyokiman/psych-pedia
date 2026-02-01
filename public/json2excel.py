import json
import pandas as pd
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows

# --- 配置部分 ---
JSON_FILE_PATH = "drugs.json"  # 假设您的完整 JSON 文件名为 drugs.json
EXCEL_FILE_PATH = "psych_pedia_drugs.xlsx"

# --- 核心转换逻辑 ---
def transform_data_for_excel(drugs_list):
    """
    将嵌套的药物JSON数据转换为扁平化的字典列表，以便于写入Excel。
    """
    flat_data = []
    
    for drug in drugs_list:
        # 提取基础信息
        base = {
            "ID": drug.get("id"),
            "中文名": drug.get("name_cn"),
            "英文名": drug.get("name_en"),
            "分类 (Category)": drug.get("category"),
            "标签 (Tags)": ", ".join(drug.get("tags", [])),
        }
        
        # 提取PK数据 (药代动力学)
        pk = drug.get("pk_data", {})
        base.update({
            "PK: 半衰期": pk.get("half_life"),
            "PK: 蛋白结合率": pk.get("protein_binding"),
            "PK: 代谢途径": pk.get("metabolism"),
            "PK: 达峰时间": pk.get("peak_time"),
        })
        
        # 提取市场信息 (Market Info)
        market = drug.get("market_info", {})
        base.update({
            "市场: 价格等级": market.get("price"),
            "市场: 医保状态": market.get("insurance"),
            "市场: 妊娠分级": market.get("pregnancy"),
        })

        # 提取雷达图数据 (Radar Data) - 扁平化为两列
        radar = drug.get("stahl_radar", {})
        # 注意：这里将浮点数转换为字符串并用逗号连接，便于Excel展示。
        # 如果需要保留数值类型以便在Excel中进行数值运算，需要进一步调整。
        base.update({
            "Radar: 受体": ", ".join(radar.get("labels", [])),
            "Radar: 亲和值": ", ".join(map(str, radar.get("values", []))),
        })
        
        # 提取临床实战笔记 (Pearls) - 最多取前三个，并合并
        pearls = drug.get("pearls", [])
        for i in range(3):
            if i < len(pearls):
                pearl = pearls[i]
                base[f"Pearl {i+1}: 标题"] = pearl.get("title", "")
                base[f"Pearl {i+1}: 类型"] = pearl.get("type", "")
                base[f"Pearl {i+1}: 内容"] = pearl.get("content", "")
            else:
                base[f"Pearl {i+1}: 标题"] = ""
                base[f"Pearl {i+1}: 类型"] = ""
                base[f"Pearl {i+1}: 内容"] = ""
        
        flat_data.append(base)
        
    return flat_data

def convert_json_to_excel(json_filepath, excel_filepath):
    """主函数：加载JSON并保存为Excel"""
    try:
        with open(json_filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            drugs_list = data.get("drugs", [])
    except FileNotFoundError:
        print(f"错误: 找不到文件 {json_filepath}。请确保文件存在。")
        return
    except json.JSONDecodeError:
        print(f"错误: {json_filepath} 文件格式错误。请检查JSON结构。")
        return
        
    if not drugs_list:
        print("警告: JSON文件中 'drugs' 列表为空。未生成Excel。")
        return

    flat_data = transform_data_for_excel(drugs_list)
    
    # 使用 Pandas 转换和写入 Excel
    df = pd.DataFrame(flat_data)
    
    # 重新排列列的顺序以提高可读性
    desired_order = [
        "ID", "中文名", "英文名", "分类 (Category)", "标签 (Tags)",
        "PK: 半衰期", "PK: 蛋白结合率", "PK: 代谢途径", "PK: 达峰时间",
        "Radar: 受体", "Radar: 亲和值",
        "市场: 价格等级", "市场: 医保状态", "市场: 妊娠分级",
        "Pearl 1: 标题", "Pearl 1: 类型", "Pearl 1: 内容",
        "Pearl 2: 标题", "Pearl 2: 类型", "Pearl 2: 内容",
        "Pearl 3: 标题", "Pearl 3: 类型", "Pearl 3: 内容"
    ]
    # 确保所有列都在数据框中，并按指定顺序排列
    df = df.reindex(columns=[col for col in desired_order if col in df.columns])
    
    df.to_excel(excel_filepath, index=False, engine='xlsxwriter')
    
    print(f"成功将 {len(drugs_list)} 个药物条目转换并保存到 {excel_filepath}")

if __name__ == "__main__":
    # 在实际运行环境中，确保 'drugs.json' 存在并包含数据。
    convert_json_to_excel(JSON_FILE_PATH, EXCEL_FILE_PATH)