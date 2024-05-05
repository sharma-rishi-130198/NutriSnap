//aws aplify component
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

// replace the user pool region, id, and app client id details
export default {
    "REGION": process.env.REACT_APP_REGION,
    "USER_POOL_ID": process.env.REACT_APP_USER_POOL_ID,
    "USER_POOL_APP_CLIENT_ID": process.env.REACT_APP_CLIENT_ID,
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_signup_attributes": [
        "EMAIL", "Name"
    ]
}

// Configure Amplify in index file or root file
Amplify.configure({
    Auth: {
        region: awsExports.REGION,
        userPoolId: awsExports.USER_POOL_ID,
        userPoolWebClientId: awsExports.USER_POOL_APP_CLIENT_ID
    }
})

// export default awsmobile;
