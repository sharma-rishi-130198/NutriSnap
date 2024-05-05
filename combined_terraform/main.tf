provider "aws" {
  region = "us-east-1"
}

# Create Lambda resource
resource "aws_iam_role" "lambda_role" {
  name = "lambda_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
      },
    ],
  })
}

# Create execution role
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Grant permissions
resource "aws_iam_role_policy_attachment" "lambda_s3_full_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_full_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_rekognition_custom_labels_full_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRekognitionCustomLabelsFullAccess"
}

# Create Lambda
resource "aws_lambda_function" "test_lambda" {
  filename         = "lambda_function_payload.zip"
  function_name    = "test_lambda"
  role             = aws_iam_role.lambda_role.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = filebase64sha256("lambda_function_payload.zip")
  runtime          = "python3.8"

  tags = {
    Name = "test_lambda"
  }
}

# Create an API Gateway Rest API
resource "aws_api_gateway_rest_api" "my_api" {
  name        = "terraform-api"
  description = "API Gateway with Lambda Integration"
}

# Create a Proxy Resource
resource "aws_api_gateway_resource" "proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.my_api.id
  parent_id   = aws_api_gateway_rest_api.my_api.root_resource_id
  path_part   = "{proxy+}"
}

# Create a Method for the Proxy Resource
resource "aws_api_gateway_method" "proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.my_api.id
  resource_id   = aws_api_gateway_resource.proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}
resource "aws_api_gateway_method" "options_method" {
  rest_api_id   = aws_api_gateway_rest_api.my_api.id
  resource_id   = aws_api_gateway_resource.proxy_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}
# Method response for OPTIONS
resource "aws_api_gateway_method_response" "options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.my_api.id
  resource_id = aws_api_gateway_resource.proxy_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}


resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id             = aws_api_gateway_rest_api.my_api.id
  resource_id             = aws_api_gateway_resource.proxy_resource.id
  http_method             = aws_api_gateway_method.options_method.http_method
  integration_http_method = "POST"
  type                    = "MOCK"

  request_templates = {
    "application/json" = "{statusCode: 200}"
  }
}

# Integration response for OPTIONS
resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.my_api.id
  resource_id = aws_api_gateway_resource.proxy_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = aws_api_gateway_method_response.options_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
    "method.response.header.Access-Control-Allow-Methods" = "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }
}


# Create an Integration between the Method and Lambda
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.my_api.id
  resource_id             = aws_api_gateway_resource.proxy_resource.id
  http_method             = aws_api_gateway_method.proxy_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.test_lambda.invoke_arn
}

# Grant API Gateway permissions to invoke the Lambda function
resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.test_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # The source arn for which this permission applies
  source_arn = "${aws_api_gateway_rest_api.my_api.execution_arn}/*/*/*"
}

# Create deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration,
	aws_api_gateway_integration.options_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.my_api.id
  stage_name  = "prod"
}

# Create DynamoDb table
resource "aws_dynamodb_table" "nutrition_table" {
  name           = "nutrition" # Name of the DynamoDB table
  billing_mode   = "PROVISIONED"   # Billing mode: PROVISIONED or PAY_PER_REQUEST
  read_capacity  = 10             # Read capacity units
  write_capacity = 10             # Write capacity units
  hash_key       = "Food"           # Hash key attribute name

  attribute {
    name = "Food"                  # Attribute name
    type = "S"                   # Attribute type (S = String, N = Number, B = Binary)
  }

  tags = {
    Name = "nutrition"
  }
}

resource "aws_dynamodb_table" "cal_consumed_table" {
  name           = "calConsumed" # Name of the DynamoDB table
  billing_mode   = "PROVISIONED"   # Billing mode: PROVISIONED or PAY_PER_REQUEST
  read_capacity  = 10             # Read capacity units
  write_capacity = 10             # Write capacity units
  hash_key       = "key"           # Hash key attribute name

  attribute {
    name = "key"                  # Attribute name
    type = "S"                   # Attribute type (S = String, N = Number, B = Binary)
  }

  tags = {
    Name = "calConsumed"
  }
}


# Frontend
resource "aws_cognito_user_pool" "my_pool" {
  name = var.cognito_user_pool_name
  
  # For email verification
  auto_verified_attributes = ["email"]
}

resource "aws_cognito_user_pool_client" "my_client" {
  name         = var.cognito_user_pool_client_name
  user_pool_id = aws_cognito_user_pool.my_pool.id 
}

resource "aws_amplify_app" "my_app" {
  name       = var.app_name
  repository = var.repository
  oauth_token = var.token  
  # Pass Cognito IDs as environment variables to Amplify
  environment_variables = {
    REACT_APP_USER_POOL_ID     = aws_cognito_user_pool.my_pool.id
    REACT_APP_CLIENT_ID = aws_cognito_user_pool_client.my_client.id
    REACT_APP_REGION = "us-east-1"
    REACT_APP_API_URL = aws_api_gateway_deployment.api_deployment.invoke_url
  }
}

resource "aws_amplify_branch" "my_branch" {
  app_id      = aws_amplify_app.my_app.id
  branch_name = var.branch_name
}

resource "aws_amplify_webhook" "main" {
  app_id = aws_amplify_app.my_app.id
  branch_name = aws_amplify_branch.my_branch.branch_name
  description = "trigger-main"

  provisioner "local-exec" {
    command = "curl -X POST -d {} '${aws_amplify_webhook.main.url}&operation=startbuild' -H 'Content-Type:application/json'"
  }
}