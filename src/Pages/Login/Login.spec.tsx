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
      email: "laura@example.com",
      token: "cognito-id-token",
    });
    const user = userEvent.setup();
    const { store } = renderWithProviders(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/me" element={<div>Personal page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email/), "laura@example.com");
    await user.type(screen.getByLabelText(/Password/), "secret-password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Personal page")).toBeInTheDocument();
    expect(signInWithCognito).toHaveBeenCalledWith(
      "laura@example.com",
      "secret-password"
    );
    expect(store.getState().auth).toEqual({
      playerName: "laura@example.com",
      token: "cognito-id-token",
    });
  });

  it("shows login errors", async () => {
    (signInWithCognito as jest.Mock).mockRejectedValue(
      new Error("Incorrect username or password.")
    );
    const user = userEvent.setup();

    renderWithProviders(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email/), "laura@example.com");
    await user.type(screen.getByLabelText(/Password/), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Incorrect username or password.")
    ).toBeInTheDocument();
  });
});
