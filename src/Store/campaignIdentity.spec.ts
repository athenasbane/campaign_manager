import { setupStore } from "./store";
import { campaignApi } from "./slices/campaignApi";
import { login, logout } from "./slices/auth";

test("changing identity clears cached campaign secrets and requests", async () => {
  const store = setupStore();
  store.dispatch(login({ token: "alice-token", playerName: "Alice" }));
  await store.dispatch(
    campaignApi.util.upsertQueryData(
      "searchCampaign",
      { privateOnly: "true" },
      {
        items: [],
        total: 1,
        unreadTotal: 1,
        page: 1,
        pages: 1,
        types: { knowledge: 1 },
      },
    ),
  );
  expect(Object.keys(store.getState().campaignApi.queries)).toHaveLength(1);
  store.dispatch(login({ token: "bob-token", playerName: "Bob" }));
  expect(store.getState().campaignApi.queries).toEqual({});
  await store.dispatch(
    campaignApi.util.upsertQueryData(
      "searchCampaign",
      {},
      { items: [], total: 0, unreadTotal: 0, page: 1, pages: 0, types: {} },
    ),
  );
  store.dispatch(logout());
  expect(store.getState().campaignApi.queries).toEqual({});
  expect(store.getState().auth.token).toBeNull();
});
