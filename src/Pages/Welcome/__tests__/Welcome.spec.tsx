import Welcome from "../Welcome";
import { http, HttpResponse, delay } from "msw";
import { setupServer } from "msw/node";
import { renderWithProviders } from "../../../utils/test-utils";
import { PAGE_RESPONSE } from "./api_responses/page_response";
import { fireEvent, screen } from "@testing-library/react";

export const handlers = [
  http.get(
    "https://graphql.contentful.com/content/v1/spaces/u9i8uh7i6idu",
    async () => {
      await delay(1500);
      return HttpResponse.json(PAGE_RESPONSE);
    }
  ),
];

const server = setupServer(...handlers);

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());

describe("Page - Welcome", () => {
  it("should render the header", () => {
    const { getByText } = renderWithProviders(<Welcome />);

    screen.debug();
  });
});
