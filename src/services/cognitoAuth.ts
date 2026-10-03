import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const getClientEnv = (key: string) =>
  import.meta.env[key] ??
  (typeof process !== "undefined" ? process.env[key] : undefined);

const getUserPool = () => {
  const userPoolId = getClientEnv("REACT_APP_COGNITO_USER_POOL_ID");
  const clientId = getClientEnv("REACT_APP_COGNITO_CLIENT_ID");
  if (!userPoolId || !clientId) {
    throw new Error("Cognito environment variables are not configured.");
  }

  return new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
};

export interface CognitoLoginResponse {
  kind: "signed-in";
  email: string;
  token: string;
}

export interface CognitoNewPasswordChallenge {
  kind: "new-password-required";
  email: string;
  requiredAttributes: string[];
  complete: (
    password: string,
    attributes?: Record<string, string>,
  ) => Promise<CognitoLoginResponse>;
}

export type CognitoSignInResult =
  CognitoLoginResponse | CognitoNewPasswordChallenge;

export const signInWithCognito = (
  email: string,
  password: string,
): Promise<CognitoSignInResult> =>
  new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });
    const signedIn = (session: CognitoUserSession): CognitoLoginResponse => ({
      kind: "signed-in",
      email,
      token: session.getIdToken().getJwtToken(),
    });
    const unsupportedChallenge = (fail: (error: Error) => void) => () =>
      fail(
        new Error(
          "This account needs an additional sign-in step. Contact your GM for help.",
        ),
      );
    const additionalChallenges = (fail: (error: Error) => void) => ({
      mfaRequired: unsupportedChallenge(fail),
      totpRequired: unsupportedChallenge(fail),
      mfaSetup: unsupportedChallenge(fail),
      selectMFAType: unsupportedChallenge(fail),
      customChallenge: unsupportedChallenge(fail),
    });

    cognitoUser.authenticateUser(
      new AuthenticationDetails({ Username: email, Password: password }),
      {
        onSuccess: (session) => resolve(signedIn(session)),
        onFailure: reject,
        ...additionalChallenges(reject),
        newPasswordRequired: (
          userAttributes: Record<string, string> | null,
          requiredAttributes: string[] = [],
        ) => {
          // Only collect missing required values. Existing attributes and the
          // read-only verification flags must not be echoed to Cognito.
          const missing = Array.from(new Set(requiredAttributes)).filter(
            (name) => !userAttributes?.[name],
          );
          resolve({
            kind: "new-password-required",
            email,
            requiredAttributes: missing,
            // The original CognitoUser retains its challenge Session in memory.
            complete: (newPassword, attributes = {}) =>
              new Promise((finish, fail) => {
                const requiredValues: Record<string, string> = {};
                for (const name of missing) {
                  if (!attributes[name]?.trim()) {
                    fail(new Error(`Please enter ${name.replace(/_/g, " ")}.`));
                    return;
                  }
                  requiredValues[name] = attributes[name].trim();
                }
                cognitoUser.completeNewPasswordChallenge(
                  newPassword,
                  requiredValues,
                  {
                    onSuccess: (session) => finish(signedIn(session)),
                    onFailure: fail,
                    ...additionalChallenges(fail),
                    newPasswordRequired: () =>
                      fail(
                        new Error(
                          "Please return to sign-in and use your invitation password again.",
                        ),
                      ),
                  },
                );
              }),
          });
        },
      },
    );
  });
