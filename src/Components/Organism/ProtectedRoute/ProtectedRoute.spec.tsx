import { MemoryRouter, Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../../utils/test-utils";
import ProtectedRoute from "./ProtectedRoute";

describe("Organism - ProtectedRoute", () => {
  it("redirects logged out players to login", () => {
    const { getByText } = renderWithProviders(
      <MemoryRouter initialEntries={["/me"]}>
        <Routes>
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <div>Private page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Login page")).toBeInTheDocument();
  });

  it("renders protected content for logged in players", () => {
    const { getByText } = renderWithProviders(
      <MemoryRouter initialEntries={["/me"]}>
        <Routes>
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <div>Private page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            token: "token",
            playerName: "Player",
          },
        },
      }
    );

    expect(getByText("Private page")).toBeInTheDocument();
  });
});
