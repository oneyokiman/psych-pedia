import pandas as pd
import json
import os

# --- 配置文件名 ---
EXCEL_FILE_PATH = "principles.xlsx"
JSON_OUTPUT_PATH = "principles_updated.json" # 输出新文件，避免覆盖原文件

def clean_nan(val):
    """清理 Excel 中的空值 (NaN)，转为空字符串"""
    if pd.isna(val):
        return ""
    return str(val).strip()

def convert_excel_to_json(excel_path, json_path):
    if not os.path.exists(excel_path):
        print(f"错误: 找不到文件 {excel_path}")
        return

    final_data = {}

    try:
        # --- 1. 读取 Metadata (元数据) ---
        try:
            df_meta = pd.read_excel(excel_path, sheet_name='Metadata')
            # 将 DataFrame 转为键值对字典
            for _, row in df_meta.iterrows():
                key = row.get("Key")
                value = row.get("Value")
                
                # 特殊处理 _template，它被存为了 JSON 字符串，需要还原为对象
                if key == "_template":
                    try:
                        final_data[key] = json.loads(value)
                    except:
                        final_data[key] = {}
                else:
                    final_data[key] = clean_nan(value)
                    
        except ValueError:
            print("警告: 找不到 'Metadata' Sheet，将使用默认头部信息。")
            final_data["_comment"] = "Restored from Excel"
            final_data["_instructions"] = ""
            final_data["_template"] = {}

        # --- 2. 读取 Receptors (受体) ---
        try:
            df_receptors = pd.read_excel(excel_path, sheet_name='Receptors')
            # 填充空值
            df_receptors = df_receptors.fillna("")
            # 转为字典列表
            final_data["receptors"] = df_receptors.to_dict(orient='records')
        except ValueError:
            print("提示: Excel 中没有 'Receptors' Sheet，跳过。")
            final_data["receptors"] = []

        # --- 3. 读取 Hypotheses (假说) ---
        try:
            df_hypotheses = pd.read_excel(excel_path, sheet_name='Hypotheses')
            df_hypotheses = df_hypotheses.fillna("")
            final_data["hypotheses"] = df_hypotheses.to_dict(orient='records')
        except ValueError:
            print("提示: Excel 中没有 'Hypotheses' Sheet，跳过。")
            final_data["hypotheses"] = []

        # --- 4. 保存 JSON ---
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)
            
        print(f"✅ 还原成功！文件已保存至: {json_path}")
        print(f"   - Receptors: {len(final_data.get('receptors', []))} 条")
        print(f"   - Hypotheses: {len(final_data.get('hypotheses', []))} 条")

    except Exception as e:
        print(f"❌ 转换过程中发生错误: {e}")

if __name__ == "__main__":
    convert_excel_to_json(EXCEL_FILE_PATH, JSON_OUTPUT_PATH)