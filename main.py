import sys
import os
import torch
import cv2
import pandas as pd
from ultralytics import YOLO
import json

def initialize_device():
    if torch.cuda.is_available():
        device = torch.device('cuda:0')
        sys.stderr.write("CUDA Available: Yes, Using GPU.\n")
    else:
        device = torch.device('cpu')
        sys.stderr.write("CUDA Available: No, Using CPU.\n")
    return device

def load_model(model_path, device):
    model = YOLO(model_path)
    return model

def run_inference(video_path, result_path, model):
    if not os.path.exists(result_path):
        os.makedirs(result_path)
        print(f"Directory '{result_path}' created.")
    else:
        print(f"Directory '{result_path}' already exists.")

    results = model.predict(video_path, save=True, save_crop=True, project=result_path)
    return results

def process_results(video_path, results, model):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    detection_data = []

    for frame_idx, result in enumerate(results):
        frame_time = frame_idx / fps
        boxes = result.boxes.xyxy

        confidences = result.boxes.conf.tolist() if result.boxes.conf.numel() > 0 else []
        classes = result.boxes.cls.tolist() if result.boxes.cls.numel() > 0 else []

        # Updated conditional check
        if len(confidences) > 0 and len(classes) > 0 and len(boxes) > 0:
            for box, conf, class_id in zip(boxes, confidences, classes):
                x_min, y_min, x_max, y_max = map(float, box[:4])
                class_name = model.names[int(class_id)]

                detection_data.append({
                    "Timestamp": frame_time,
                    "Class": class_name,
                    "Confidence": conf,
                    "Bounding Box": (x_min, y_min, x_max, y_max)
                })

    df = pd.DataFrame(detection_data)
    df = refine_dataframe(df, fps)
    cap.release()
    return df

def refine_dataframe(df, fps):
    df[["Timestamp", "Confidence"]] = df[["Timestamp", "Confidence"]].round(3)
    df["Bounding Box"] = df["Bounding Box"].apply(lambda box: tuple(round(coord, 3) for coord in box))
    df['Frame Number'] = (df['Timestamp'] * fps).astype(int)
    df.insert(0, "Fender ID", 1)
    df.insert(1, "Defect ID", 1)
    df = assign_defect_ids(df)
    return df

def assign_defect_ids(df):
    defect_id = 1
    for index, row in df.iterrows():
        if index > 0:
            time_difference = row["Timestamp"] - df.at[index-1, "Timestamp"]
            same_class = row["Class"] == df.at[index-1, "Class"]
            if time_difference > 0.15 or not same_class:
                defect_id += 1
        df.at[index, "Defect ID"] = defect_id
    return df

def generate_report(df, video_info):
    df_json = df.to_json(orient='records')
    report = {
        "video_info": video_info,
        "detection_data": json.loads(df_json)
    }
    report_json = json.dumps(report, indent=4)
    return report_json

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python main.py <video_path> <result_path> <model_path>")
        sys.exit(1)

    video_path = sys.argv[1]
    result_path = sys.argv[2]
    model_path = sys.argv[3]

    device = initialize_device()
    model = load_model(model_path, device)
    
    results = run_inference(video_path, result_path, model)
    processed_df = process_results(video_path, results, model)

    video_info = {
        "path": video_path,
        "result_path": result_path
    }

    json_output = generate_report(processed_df, video_info)
    print(json_output)
