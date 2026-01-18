import json
import pandas as pd
import os

# --- 配置文件名 ---
JSON_FILE_PATH = "principles.json"
EXCEL_FILE_PATH = "principles.xlsx"

def convert_json_to_excel(json_filepath, excel_filepath):
    # 1. 检查文件
    if not os.path.exists(json_filepath):
        print(f"错误: 找不到文件 {json_filepath}")
        return

    try:
        with open(json_filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"JSON 解析错误: {e}")
        return

    # 2. 提取主要数据列表
    receptors_data = data.get("receptors", [])
    hypotheses_data = data.get("hypotheses", [])
    
    # 转为 DataFrame
    df_receptors = pd.DataFrame(receptors_data)
    df_hypotheses = pd.DataFrame(hypotheses_data)
    
    # 3. 提取元数据 (Metadata)
    # 为了完美还原 JSON 头部信息，我们将它们存入单独的 Sheet
    # 注意：_template 是字典，我们需要把它转为字符串存储，防止 Excel 搞乱格式
    metadata = [
        {"Key": "_comment", "Value": data.get("_comment", "")},
        {"Key": "_instructions", "Value": data.get("_instructions", "")},
        {"Key": "_template", "Value": json.dumps(data.get("_template", {}), ensure_ascii=False)} 
    ]
    df_metadata = pd.DataFrame(metadata)

    # 4. 写入 Excel (包含 3 个 Sheet)
    try:
        # 使用 openpyxl 引擎
        with pd.ExcelWriter(excel_filepath, engine='openpyxl') as writer:
            df_receptors.to_excel(writer, sheet_name='Receptors', index=False)
            df_hypotheses.to_excel(writer, sheet_name='Hypotheses', index=False)
            df_metadata.to_excel(writer, sheet_name='Metadata', index=False)
            
        print(f"✅ 转换成功！Excel 已保存为: {excel_filepath}")
        print(f"   - Receptors Sheet: {len(receptors_data)} 条数据")
        print(f"   - Hypotheses Sheet: {len(hypotheses_data)} 条数据")
        print(f"   - Metadata Sheet: 保留了头部配置信息")
        
    except Exception as e:
        print(f"❌ 写入 Excel 失败: {e}")
        print("请确保 Excel 文件未被打开。")

if __name__ == "__main__":
    convert_json_to_excel(JSON_FILE_PATH, EXCEL_FILE_PATH)