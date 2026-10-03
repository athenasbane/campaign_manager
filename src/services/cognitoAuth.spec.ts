import { CognitoUser } from "amazon-cognito-identity-js";
import { signInWithCognito } from "./cognitoAuth";

jest.mock("amazon-cognito-identity-js", () => ({
  CognitoUser: jest.fn(),
  CognitoUserPool: jest.fn(),
  AuthenticationDetails: jest.fn(),
}));

const session = {
  getIdToken: () => ({ getJwtToken: () => "signed-id-token" }),
};
const makeUser = (
  authenticateUser: jest.Mock,
  completeNewPasswordChallenge = jest.fn(),
) => {
  (CognitoUser as unknown as jest.Mock).mockImplementation(() => ({
    authenticateUser,
    completeNewPasswordChallenge,
  }));
  return completeNewPasswordChallenge;
};

beforeAll(() => {
  process.env.REACT_APP_COGNITO_USER_POOL_ID = "test-pool";
  process.env.REACT_APP_COGNITO_CLIENT_ID = "test-client";
});

it("returns the ID token after ordinary sign-in", async () => {
  makeUser(jest.fn((_details, callbacks) => callbacks.onSuccess(session)));
  await expect(
    signInWithCognito("player@example.com", "password"),
  ).resolves.toEqual({
    kind: "signed-in",
    email: "player@example.com",
    token: "signed-id-token",
  });
});

it("completes the challenge on the original user with only missing required attributes", async () => {
  const complete = makeUser(
    jest.fn((_details, callbacks) =>
      callbacks.newPasswordRequired(
        { email: "player@example.com", email_verified: "true" },
        ["email", "name", "name"],
      ),
    ),
    jest.fn((_password, _attributes, callbacks) =>
      callbacks.onSuccess(session),
    ),
  );
  const result = await signInWithCognito(
    "player@example.com",
    "temporary-password",
  );
  expect(result.kind).toBe("new-password-required");
  if (result.kind !== "new-password-required")
    throw new Error("Expected challenge");
  expect(result.requiredAttributes).toEqual(["name"]);
  await expect(
    result.complete("NewPassword123", {
      name: " Player ",
      email: "changed@example.com",
      email_verified: "false",
    }),
  ).resolves.toEqual({
    kind: "signed-in",
    email: "player@example.com",
    token: "signed-id-token",
  });
  expect(CognitoUser).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledWith(
    "NewPassword123",
    { name: "Player" },
    expect.any(Object),
  );
});

it("rejects missing required values before calling Cognito", async () => {
  const complete = makeUser(
    jest.fn((_details, callbacks) =>
      callbacks.newPasswordRequired(null, ["name"]),
    ),
  );
  const result = await signInWithCognito(
    "player@example.com",
    "temporary-password",
  );
  if (result.kind !== "new-password-required")
    throw new Error("Expected challenge");
  await expect(
    result.complete("NewPassword123", { name: " " }),
  ).rejects.toThrow("Please enter name.");
  expect(complete).not.toHaveBeenCalled();
});

it("propagates challenge failures without pretending sign-in succeeded", async () => {
  makeUser(
    jest.fn((_details, callbacks) => callbacks.newPasswordRequired({}, [])),
    jest.fn((_password, _attributes, callbacks) =>
      callbacks.onFailure(new Error("Invalid session")),
    ),
  );
  const result = await signInWithCognito(
    "player@example.com",
    "temporary-password",
  );
  if (result.kind !== "new-password-required")
    throw new Error("Expected challenge");
  await expect(result.complete("NewPassword123")).rejects.toThrow(
    "Invalid session",
  );
});

it("rejects unsupported authentication challenges instead of leaving the form waiting", async () => {
  makeUser(jest.fn((_details, callbacks) => callbacks.mfaRequired()));
  await expect(
    signInWithCognito("player@example.com", "password"),
  ).rejects.toThrow("additional sign-in step");
});
