


import csv
import json

def format_attribute(value):
    if value.isdigit():
        return {'N': value}
    elif value.lower() in ['true', 'false']:
        return {'BOOL': value.lower() == 'true'}
    else:
        return {'S': value}

csv_file_path = 'D:\ML_work\Dataset_rekognition\\Nutrition_CSV.csv'
json_file_path = 'D:\ML_work\Dataset_rekognition\\nutrition_10.json'
table_name = 'nutrition'

with open(csv_file_path, mode='r', newline='', encoding='utf-8') as csv_file:
    reader = csv.DictReader(csv_file)
    dynamodb_data = {table_name: []}

    for row in reader:
        item = {k: format_attribute(v) for k, v in row.items()}
        put_request = {'PutRequest': {'Item': item}}
        dynamodb_data[table_name].append(put_request)

with open(json_file_path, 'w', newline='', encoding='utf-8') as json_file:
    json.dump(dynamodb_data, json_file, indent=4)

print(f'Converted to DynamoDB format and saved to {json_file_path}')
