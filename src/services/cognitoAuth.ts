import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const userPoolId = process.env.REACT_APP_COGNITO_USER_POOL_ID;
const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;

const getUserPool = () => {
  if (!userPoolId || !clientId) {
    throw new Error("Cognito environment variables are not configured.");
  }

  return new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
};

export interface CognitoLoginResponse {
  email: string;
  token: string;
}

export const signInWithCognito = (
  email: string,
  password: string
): Promise<CognitoLoginResponse> =>
  new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.authenticateUser(
      new AuthenticationDetails({
        Username: email,
        Password: password,
      }),
      {
        onSuccess: (session: CognitoUserSession) => {
          resolve({
            email,
            token: session.getIdToken().getJwtToken(),
          });
        },
        onFailure: reject,
        newPasswordRequired: () => {
          reject(
            new Error(
              "This account requires a password reset before it can sign in."
            )
          );
        },
      }
    );
  });
