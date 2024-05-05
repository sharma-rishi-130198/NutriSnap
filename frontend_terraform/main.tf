provider "aws" {
  region = "us-east-1"
}

resource "aws_cognito_user_pool" "my_pool" {
  name = var.cognito_user_pool_name
  # Additional configurations can be added here
}

resource "aws_cognito_user_pool_client" "my_client" {
  name         = var.cognito_user_pool_client_name
  user_pool_id = aws_cognito_user_pool.my_pool.id
  # Additional configurations can be added here
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
  }
  # Additional configurations can be added here
}

resource "aws_amplify_branch" "my_branch" {
  app_id      = aws_amplify_app.my_app.id
  branch_name = var.branch_name
  # Additional configurations can be added here
}