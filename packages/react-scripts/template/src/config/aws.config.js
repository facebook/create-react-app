import Amplify, { Auth } from 'aws-amplify';

export default Amplify.configure({
  Auth: {
    identityPoolId: 'AWS_COGNITO_IDENTITY_POOL_ID',
    region: 'AWS_COGNITO_REGION',
    userPoolId: 'AWS_COGNITO_USER_POOL_ID',
    userPoolWebClientId: 'AWS_COGNITO_WEB_CLIENT_ID',
  },
  API: {
    endpoints: [
      {
        name: '', // REQUIRED - Endpoint name e.g. 'products'
        endpoint: '', // REQUIRED - API URL e.g. https://your-api-url.your-region.amazonaws.com/products
        custom_header: async () => ({
          Authorization: (await Auth.currentSession()).idToken.jwtToken,
        }),
      },
    ],
  },
});
