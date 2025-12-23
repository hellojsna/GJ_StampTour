#!/usr/bin/env python3

import json
import subprocess
import os

def generate_uuid():
    """Generate a UUID using the uuidgen command"""
    result = subprocess.run(['uuidgen'], capture_output=True, text=True)
    if result.returncode == 0:
        return result.stdout.strip()
    else:
        raise Exception(f"Error running uuidgen: {result.stderr}")

def fill_stamp_ids(json_file_path):
    """Fill in the stampId fields with generated UUIDs"""
    
    # Read the JSON file
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Generate UUID for each stamp and fill in stampId
    for stamp in data['stampList']:
        uuid = generate_uuid()
        stamp['stampId'] = uuid
        print(f"Generated UUID for {stamp['stampName']}: {uuid}")
    
    # Write back to the JSON file
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\nSuccessfully updated {json_file_path}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file = os.path.join(script_dir, 'api', 'stampList.json')
    
    if not os.path.exists(json_file):
        print(f"Error: {json_file} not found")
        exit(1)
    
    fill_stamp_ids(json_file)

