# Output api gateway endpoint
output "api_gateway_endpoint" {
  value = "${aws_api_gateway_deployment.api_deployment.invoke_url}"
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.my_pool.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.my_client.id
}

output "amplify_app_id" {
  value = aws_amplify_app.my_app.id
}

output "amplify_app_default_domain" {
  value = aws_amplify_app.my_app.default_domain
}