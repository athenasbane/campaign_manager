import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import Login from "./Login";
import { signInWithCognito } from "../../services/cognitoAuth";

jest.mock("../../services/cognitoAuth", () => ({
  signInWithCognito: jest.fn(),
}));

describe("Page - Login", () => {
  it("stores credentials and routes to the personal page", async () => {
    (signInWithCognito as jest.Mock).mockResolvedValue({
      kind: "signed-in",
      email: "laura@example.com",
      token: "cognito-id-token",
    });
    const user = userEvent.setup();
    const { store } = renderWithProviders(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/character" element={<div>Personal page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/Email/), "laura@example.com");
    await user.type(screen.getByLabelText(/Password/), "secret-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Personal page")).toBeInTheDocument();
    expect(signInWithCognito).toHaveBeenCalledWith(
      "laura@example.com",
      "secret-password",
    );
    expect(store.getState().auth).toEqual({
      playerName: "laura@example.com",
      token: "cognito-id-token",
    });
  });

  it("shows login errors", async () => {
    (signInWithCognito as jest.Mock).mockRejectedValue(
      new Error("Incorrect username or password."),
    );
    const user = userEvent.setup();

    renderWithProviders(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/Email/), "laura@example.com");
    await user.type(screen.getByLabelText(/Password/), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Incorrect username or password."),
    ).toBeInTheDocument();
  });
});

const renderInvitation = async (
  complete: jest.Mock,
  requiredAttributes: string[] = [],
) => {
  window.localStorage.clear();
  (signInWithCognito as jest.Mock).mockResolvedValue({
    kind: "new-password-required",
    email: "player@example.com",
    requiredAttributes,
    complete,
  });
  const user = userEvent.setup();
  const { store } = renderWithProviders(
    <MemoryRouter
      initialEntries={[
        {
          pathname: "/login",
          state: { from: { pathname: "/private-dossier" } },
        },
      ]}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/private-dossier" element={<div>Character dossier</div>} />
      </Routes>
    </MemoryRouter>,
    { preloadedState: { auth: { token: null, playerName: null } } },
  );
  await user.type(screen.getByLabelText(/^Email\s*\*?$/), "player@example.com");
  await user.type(screen.getByLabelText(/^Password\s*\*?$/), "Temporary123");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  await screen.findByRole("form", { name: "Set your password" });
  return { user, store };
};

const enterNewPassword = async (
  user: ReturnType<typeof userEvent.setup>,
  confirmation = "MyPassword123",
) => {
  await user.type(screen.getByLabelText(/^New password\s*\*?$/), "MyPassword123");
  await user.type(screen.getByLabelText(/^Confirm new password\s*\*?$/), confirmation);
  await user.click(
    screen.getByRole("button", { name: "Set password and continue" }),
  );
};

describe("Invited player password setup", () => {
  it("waits for completion before storing a token and preserves the requested destination", async () => {
    const complete = jest
      .fn()
      .mockResolvedValue({
        kind: "signed-in",
        email: "player@example.com",
        token: "final-id-token",
      });
    const { user, store } = await renderInvitation(complete, ["name"]);
    expect(store.getState().auth.token).toBeNull();
    expect(localStorage.getItem("campaign_manager_auth")).toBeNull();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/^name\s*\*?$/), "Player");
    await enterNewPassword(user);
    expect(await screen.findByText("Character dossier")).toBeInTheDocument();
    expect(complete).toHaveBeenCalledWith("MyPassword123", { name: "Player" });
    expect(store.getState().auth.token).toBe("final-id-token");
    const persisted = localStorage.getItem("campaign_manager_auth")!;
    expect(persisted).toContain("final-id-token");
    expect(persisted).not.toContain("Password");
    expect(persisted).not.toContain("Temporary");
  });

  it("rejects mismatched passwords without completing the challenge", async () => {
    const complete = jest.fn();
    const { user } = await renderInvitation(complete);
    await enterNewPassword(user, "Different123");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your passwords do not match.",
    );
    expect(complete).not.toHaveBeenCalled();
  });

  it("explains the password policy before submitting an invalid password", async () => {
    const complete = jest.fn();
    const { user } = await renderInvitation(complete);
    await user.type(screen.getByLabelText(/^New password\s*\*?$/), "short");
    await user.type(screen.getByLabelText(/^Confirm new password\s*\*?$/), "short");
    await user.click(
      screen.getByRole("button", { name: "Set password and continue" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Use at least 10 characters",
    );
    expect(complete).not.toHaveBeenCalled();
  });

  it("clears rejected passwords and allows the same challenge to be retried", async () => {
    const complete = jest
      .fn()
      .mockRejectedValueOnce(new Error("Password was previously used."))
      .mockResolvedValueOnce({
        kind: "signed-in",
        email: "player@example.com",
        token: "final-id-token",
      });
    const { user } = await renderInvitation(complete);
    await enterNewPassword(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Password was previously used.",
    );
    expect(screen.getByLabelText(/^New password\s*\*?$/)).toHaveValue("");
    expect(screen.getByLabelText(/^Confirm new password\s*\*?$/)).toHaveValue("");
    await enterNewPassword(user);
    expect(await screen.findByText("Character dossier")).toBeInTheDocument();
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it("explains expired sessions and allows a fresh sign-in", async () => {
    const complete = jest
      .fn()
      .mockRejectedValue(new Error("Invalid session for the user."));
    const { user, store } = await renderInvitation(complete);
    await enterNewPassword(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your sign-in session has expired.",
    );
    await user.click(screen.getByRole("button", { name: "Return to sign-in" }));
    expect(screen.getByLabelText(/^Email\s*\*?$/)).toHaveValue("player@example.com");
    expect(screen.getByLabelText(/^Password\s*\*?$/)).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(store.getState().auth.token).toBeNull();
    (signInWithCognito as jest.Mock).mockResolvedValue({
      kind: "signed-in",
      email: "player@example.com",
      token: "fresh-id-token",
    });
    await user.type(screen.getByLabelText(/^Password\s*\*?$/), "MyPassword123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Character dossier")).toBeInTheDocument();
  });
});
