import json
import base64
from os import environ
import logging
import boto3
from boto3.dynamodb.conditions import Attr
from decimal import Decimal
from datetime import datetime
import random, string

from botocore.exceptions import ClientError

# Set up logging.
logger = logging.getLogger(__name__)

# Get the model ARN and confidence.
# model_arn = "arn:aws:rekognition:us-east-1:505532813527:project/term-project-1/version/term-project-1.2023-11-01T00.13.04/1698811984566"
model_arn = "arn:aws:rekognition:us-east-1:505532813527:project/model_30_target/version/model_30_copied/1701130478057"
min_confidence = 50

# Get the boto3 client.
rek_client = boto3.client('rekognition')
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError
    
def lambda_handler(event, context):
    # print(event['path'])
    labels_dictionary = {
        'apple_pie': 'Apple Pie',
        'baby_back_ribs': 'Baby Back Ribs',
        'baklava': 'Baklava',
        'breakfast_burrito': 'Breakfast Burrito',
        'caesar_salad': 'Caesar Salad',
        'cannoli': 'Cannoli',
        'chicken_wings': 'Chicken Wings',
        'creme_brulee': 'Creme Brulee',
        'deviled_eggs': 'Deviled Eggs',
        'donuts': 'Donuts',
        'dumplings': 'Dumplings',
        'eggs_benedict': 'Eggs Benedict',
        'falafel': 'Falafel',
        'fried_calamari': 'Fried Calamari',
        'fried_rice': 'Fried Rice',
        'garlic_bread': 'Garlic Bread',
        'grilled_cheese_sandwich': 'Grilled Cheese Sandwich',
        'grilled_salmon': 'Grilled Salmon',
        'hamburger': 'Hamburger',
        'hot_dog': 'Hot Dog',
        'hummus': 'Hummus',
        'ice_cream': 'Ice Cream',
        'lasagna': 'Lasagna',
        'macarons': 'Macarons',
        'nachos': 'Nachos',
        'omelette': 'Omelette',
        'oysters': 'Oysters',
        'paella': 'Paella',
        'peking_duck': 'Peking Duck',
        'waffles': 'Waffles'
    }
    
    if event['path'] == "/get_calories":
        ############# S3 CODE FOR TESTING ##########################
        # bucket_name = event['Records'][0]['s3']['bucket']['name']
        # object_key = event['Records'][0]['s3']['object']['key']
        
        # bucket_name = "term-project-images-bucket"
        # object_key = "Caesar-Salad-Recipe-3.jpg"
        # object_key = "waffle.jpeg"
        
        # image = {
        #     'S3Object': {
        #         'Bucket': bucket_name,
        #         'Name': object_key
        #     }
        # }
        
        ############# EVENT OBJECT CODE ##########################
        body = json.loads(event.get('body', '{}'))
        image_string = body.get('base64String')
        image_bytes = image_string.encode('utf-8')
        img_b64decoded = base64.b64decode(image_bytes)
        image = {
            'Bytes': img_b64decoded
        }
        
        # Use Rekognition's detect_custom_labels API
        response = rek_client.detect_custom_labels(
            Image=image,
            MinConfidence=min_confidence,
            ProjectVersionArn=model_arn
        )
        
        #Response from Rekognition
        labels = response['CustomLabels']
        
        qty = int(body.get('qty'))
        Id = body.get('Id')
        # print(Id)
        # qty = 2 # testing
        # Id = "abc2" # testing
        
        # Accessing DynamoDB
        source_table = dynamodb.Table('nutrition')
        destination_table = dynamodb.Table('calConsumed')
        
        print(labels)
        # print(labels[0].Name)
        print(labels[0]['Name'])
        
        food_name_to_query = labels[0]['Name']
        # food_name_to_query = "apple_pie" # testing
        
        response = source_table.query(KeyConditionExpression=boto3.dynamodb.conditions.Key('Food').eq(food_name_to_query))
        
        items = response.get('Items', [])
        
        item=items[0]
        
        item['Id'] = Id
        item['key'] = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        print(item)
        for key in item.keys():
            if key != 'Food' and key != 'Id' and key!="unit" and key!="key":
                print(key)
                item[key] = item[key] * qty
        
        item['date'] = datetime.utcnow().strftime('%Y-%m-%d')
        
        # Put the modified item into the destination DynamoDB table
        destination_table.put_item(Item=item)
        
        output = {}
        output['name'] = labels_dictionary[food_name_to_query]
        # output['confidence'] = labels[0].Confidence
        output['confidence'] = 100
        nutrition = {}
        nutrition['protein'] = item['protein']
        nutrition['fat'] = item['fat ']
        nutrition['carb'] = item['carb ']
        nutrition['calorie'] = item['calorie']
        output['nutrition'] = nutrition
        
        json_data = json.dumps(output, default=decimal_default)
        
        # TODO implement
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Required for CORS support to work
                'Access-Control-Allow-Credentials': True,  # Required for cookies, authorization headers with HTTPS
                'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'  # Based on your needs
            },
            'body': json_data
        }
        
    elif event['path'] == "/get_history":
        body = json.loads(event.get('body', '{}'))
        id=body.get('Id')
        table = dynamodb.Table('calConsumed')
        
        current_year_month = datetime.utcnow().strftime('%Y-%m')
        
        filter_id = id
        
        response = table.scan(
            FilterExpression='begins_with(#dateField, :currentYearMonth)',
            ExpressionAttributeNames={
                '#dateField': 'date'
            },
            ExpressionAttributeValues={
                ':currentYearMonth': current_year_month
            }
        )
        
        filtered_items = [item for item in response['Items'] if item['Id'] == filter_id]
        print(filtered_items)
        
        output = []
        for item in filtered_items:
            thisOutput = {}
            thisOutput['name'] = labels_dictionary[item['Food']]
            thisOutput['date'] = item['date']
            nutrition = {}
            nutrition['protein'] = item['protein']
            nutrition['fat'] = item['fat ']
            nutrition['carb'] = item['carb ']
            nutrition['calorie'] = item['calorie']
            thisOutput['nutrition'] = nutrition
            
            output.append(thisOutput)
            
        json_data = json.dumps(output, default=decimal_default)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Required for CORS support to work
                'Access-Control-Allow-Credentials': True,  # Required for cookies, authorization headers with HTTPS
                'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'  # Based on your needs
            },
            'body': json_data
        }
        
