# NutriSnap: Smart Nutrition Management with AWS

## Overview

The NutriSnap project introduces an innovative and user-friendly React application designed to transform how individuals manage their diet and nutrition. By simply taking a picture of a meal, users can have the app identify the food and provide detailed nutritional information presented in an intuitive graphical format.

NutriSnap goes beyond food identification and nutrient analysis; it also enables users to track their dietary habits over time. This feature is especially valuable for individuals looking to monitor their eating patterns and maintain a healthy lifestyle. The app's primary goal is to empower users on their journey toward better health and wellness by promoting informed food choices.

Its motto, "Snap, Track, Thrive," highlights its role as a pocket-sized health companion, making health management accessible and engaging.

## AWS Technologies Used

* **Amplify:** This service lets us add user sign-up, sign-in, and access control to your web or mobile applications. This is used to deploy frontend in our project.
* **Amazon Cognito:** This is used to store user profiles and handle user authentication.
* **Amazon S3:** This is an object storage service, to store and retrieve any amount of data at any time, from anywhere. This is used to store food images for machine learning model training.
* **Amazon Rekognition:** This makes it easy to add image and video analysis to applications. This is used to identify uploaded food items.
* **AWS API Gateway:** A fully managed service for creating, publishing, maintaining, monitoring, and securing REST, HTTP. This is used to provide a communication layer between the frontend and backend.
* **AWS Lambda:** This is a serverless, event-driven compute service. This is used to implement the serverless backend logic.
* **Amazon DynamoDB:** This is a fully managed, serverless, key-value NoSQL database. This is used to store historical and nutritional data.
* **CloudWatch:** This is a performance monitoring tool for AWS services. This is used to view logs and debugging.
* **Terraform:** This is an infrastructure as code tool to automatically spin up and manage infrastructure for our application.


## High Level WorkFlow 

1. The user takes a picture of their food and uploads it to the backend using our APIs.
2. This triggers a Lambda function, which fetches our machine learning model built using Rekognition/SageMaker to identify the food item.
3. We then query DynamoDB collections to get the nutritional information of this food item.
4. The Lambda function then updates the user's profile and historical data in DynamoDB collections along with the nutritional information, and returns it to the frontend in a json object.
5. The user can then view their nutritional information in tabular and graph format in the frontend.

<div style="display: flex; gap: 60px;">
    <img src="https://github.com/user-attachments/assets/c78568e6-daa1-4fa8-8f91-03179cce778b" alt="Image 1" width="213">
    <img src="https://github.com/user-attachments/assets/f38217e3-ecf8-416b-a756-f26e3981f586" alt="Image 2" width="750">
</div>


## Architecture Diagram

<img width="850" alt="Screenshot 2025-01-09 at 7 13 16 PM" src="https://github.com/user-attachments/assets/1f6378b1-fbcb-4752-81c5-8208d8b6f6b6" />

### Training Diagram

<img width="535" alt="Screenshot 2025-01-09 at 6 57 28 PM" src="https://github.com/user-attachments/assets/30237b97-dd25-4eeb-8145-4e9cac850e9b" />


## AWS Cost Estimation

<img width="466" alt="Screenshot 2025-01-09 at 6 26 16 PM" src="https://github.com/user-attachments/assets/b5f2b6a6-973d-4ebc-89f0-aeccf88e3c04" />

## Conclusion
* NutriSnap is an app that uses AWS technologies to help users identify food items and estimate their nutrient content.
* The app is easy to use and provides users with valuable information about their diet.


## Challenges

* Initially, the plan was to train a model locally, upload it to an S3 bucket, and access it via a Lambda function to make predictions. However, loading the model into the Lambda function took more than 10 minutes, making the approach unfeasible.
* It is difficult to share the Custom Labels Rekognition model with other AWS users and can only be transferred using a special “Copy” command that needs a lot of steps to achieve.
* Terraform's support with aws amplify and Cognito is very new. So documentation and online resources on its integration are less.


## Future Work

If given more time, I would look to work on the below enhancements:

* **Expanded Food Database:** Increase the current recognition limit of 30 food items to improve variety and nutrient accuracy.  
* **Mobile Optimization:** Make the app fully compatible with mobile devices for easier food photo uploads and increased accessibility.  
* **Personalized Recommendations:** Offer tailored dietary and workout suggestions based on user history to support fitness and health goals.  
* **Multi-Food Recognition:** Enable identification of multiple food items in a single image for improved efficiency and usability.  
* **Smart Notifications:** Use AWS SNS to send personalized reminders to users, encouraging workouts or dietary adjustments based on their history.  

These enhancements would not only improve the user experience but also increase the app's effectiveness in assisting users with their dietary management.








