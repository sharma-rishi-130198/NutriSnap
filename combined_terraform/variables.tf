variable "cognito_user_pool_name" {
  type        = string
  description = "Name of the Cognito User Pool"
}

variable "cognito_user_pool_client_name" {
  type        = string
  description = "Name of the Cognito User Pool Client"
}

variable "token" {
  type        = string
  description = "GitHub token to connect GitHub repo"
}

variable "repository" {
  type        = string
  description = "GitHub repo URL"
}

variable "app_name" {
  type        = string
  description = "AWS Amplify App Name"
}

variable "branch_name" {
  type        = string
  description = "AWS Amplify App Repo Branch Name"
}