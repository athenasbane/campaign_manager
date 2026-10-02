import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";
import modalReducer from "./slices/modals";
import { contentfulApi } from "./slices/backend";
import activeMissionReducer from "./slices/activeMission";
import layoutReducer from "./slices/layout";
import authReducer from "./slices/auth";
import { playerApi } from "./slices/playerApi";
import { campaignApi } from "./slices/campaignApi";
import { login, logout } from "./slices/auth";

const rootReducer = combineReducers({
  activeMission: activeMissionReducer,
  auth: authReducer,
  modals: modalReducer,
  layout: layoutReducer,
  [contentfulApi.reducerPath]: contentfulApi.reducer,
  [playerApi.reducerPath]: playerApi.reducer,
  [campaignApi.reducerPath]: campaignApi.reducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
  const identityListener = createListenerMiddleware();
  identityListener.startListening({
    matcher: isAnyOf(login, logout),
    effect: (_action, api) => {
      api.dispatch(campaignApi.util.resetApiState());
      api.dispatch(playerApi.util.resetApiState());
    },
  });
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
        .prepend(identityListener.middleware)
        .concat(
          contentfulApi.middleware,
          playerApi.middleware,
          campaignApi.middleware,
        ),
    preloadedState,
  });
}
const store = setupStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;

export type AppStore = ReturnType<typeof setupStore>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
