import { MemoryRouter, useLocation } from "react-router-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../utils/test-utils";
import PersonalNotes from "./PersonalNotes";
import { EntryCard } from "./Content";
import Character from "../../Pages/Campaign/Character";
import {
  useGetCampaignOverviewQuery,
  useSearchCampaignQuery,
  useSaveReaderStateMutation,
} from "../../Store/slices/campaignApi";
import type { CampaignEntry } from "../../Types/Interfaces/campaign.interface";

jest.mock("../../Store/slices/campaignApi", () => ({
  ...jest.requireActual("../../Store/slices/campaignApi"),
  useGetCampaignOverviewQuery: jest.fn(),
  useSearchCampaignQuery: jest.fn(),
  useSaveReaderStateMutation: jest.fn(),
}));
const entry: CampaignEntry = {
  id: "slip",
  type: "rumour",
  title: "The priest",
  summary: "A claim to investigate",
  tags: [],
  aliases: [],
  private: true,
  version: 1,
  updatedAt: "2026-10-03",
  intelligence: {
    learnedFrom: "Sister Amelie",
    acquired: "Session 4",
    evidence: "A letter",
  },
};
const setupNotes = (unwrap: jest.Mock) => {
  const save = jest.fn(() => ({ unwrap }));
  (useSaveReaderStateMutation as jest.Mock).mockReturnValue([
    save,
    { isLoading: false },
  ]);
  renderWithProviders(
    <PersonalNotes entryId="slip" initialNotes="A first thought" />,
  );
  return save;
};
it("saves personal notes explicitly, without marking the slip read or changing its content", async () => {
  const save = setupNotes(jest.fn().mockResolvedValue({ saved: true }));
  const user = userEvent.setup();
  expect(screen.getByLabelText("Your private notes")).toHaveValue(
    "A first thought",
  );
  await user.type(
    screen.getByLabelText("Your private notes"),
    " and a suspicion",
  );
  expect(save).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Save my notes" }));
  expect(save).toHaveBeenCalledWith({
    id: "slip",
    personalNotes: "A first thought and a suspicion",
  });
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Your notes are saved.",
  );
  expect(screen.getByRole("button", { name: "Save my notes" })).toBeDisabled();
});
it("retains unsaved notes on failure and supports clearing a saved annotation", async () => {
  const unwrap = jest
    .fn()
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ saved: true });
  const save = setupNotes(unwrap);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Your private notes"), " retained");
  await user.click(screen.getByRole("button", { name: "Save my notes" }));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Your text is still here",
  );
  expect(screen.getByLabelText("Your private notes")).toHaveValue(
    "A first thought retained",
  );
  await user.clear(screen.getByLabelText("Your private notes"));
  await user.click(screen.getByRole("button", { name: "Save my notes" }));
  expect(save).toHaveBeenLastCalledWith({ id: "slip", personalNotes: "" });
});
it("labels rumours and secrets explicitly and shows provenance without exposing evidence on cards", () => {
  renderWithProviders(
    <MemoryRouter>
      <EntryCard entry={entry} />
      <EntryCard
        entry={{
          ...entry,
          id: "fact",
          type: "secret",
          title: "The genuine seal",
        }}
      />
    </MemoryRouter>,
  );
  expect(screen.getByText("Rumour")).toBeInTheDocument();
  expect(screen.getByText("Secret")).toBeInTheDocument();
  expect(screen.getByText("You have heard…")).toBeInTheDocument();
  expect(screen.getByText("You know…")).toBeInTheDocument();
  expect(screen.getByText("Heard from: Sister Amelie")).toBeInTheDocument();
  expect(screen.queryByText("A letter")).not.toBeInTheDocument();
});
function Location() {
  return <output aria-label="Current query">{useLocation().search}</output>;
}
it("keeps filters during pagination and resets the page when changing intelligence type", async () => {
  (useGetCampaignOverviewQuery as jest.Mock).mockReturnValue({
    data: { member: { characterName: "Rowan" } },
    isLoading: false,
  });
  (useSearchCampaignQuery as jest.Mock).mockReturnValue({
    data: { items: [entry], unreadTotal: 1, total: 15, pages: 3 },
    isLoading: false,
  });
  const user = userEvent.setup();
  renderWithProviders(
    <MemoryRouter
      initialEntries={["/character?page=2&q=priest&bookmarked=true"]}
    >
      <Character />
      <Location />
    </MemoryRouter>,
    { preloadedState: { auth: { token: "test", playerName: "Player" } } },
  );
  await user.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByLabelText("Current query")).toHaveTextContent(
    "page=3&q=priest&bookmarked=true",
  );
  await user.click(screen.getByRole("button", { name: "Rumours" }));
  expect(screen.getByLabelText("Current query")).toHaveTextContent(
    "q=priest&bookmarked=true&type=rumour",
  );
  expect(useSearchCampaignQuery).toHaveBeenLastCalledWith(
    expect.objectContaining({
      dossier: "true",
      type: "rumour",
      q: "priest",
      page: 1,
      bookmarked: "true",
    }),
    expect.anything(),
  );
  await user.click(screen.getByRole("button", { name: "New to you" }));
  expect(useSearchCampaignQuery).toHaveBeenLastCalledWith(
    expect.objectContaining({ unread: "true" }),
    expect.anything(),
  );
});
