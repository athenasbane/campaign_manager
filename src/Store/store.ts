import { combineReducers, configureStore } from "@reduxjs/toolkit";
import modalReducer from "./slices/modals";
import { contentfulApi } from "./slices/backend";
import activeMissionReducer from "./slices/activeMission";
import layoutReducer from "./slices/layout";
import authReducer from "./slices/auth";
import { playerApi } from "./slices/playerApi";

const rootReducer = combineReducers({
  activeMission: activeMissionReducer,
  auth: authReducer,
  modals: modalReducer,
  layout: layoutReducer,
  [contentfulApi.reducerPath]: contentfulApi.reducer,
  [playerApi.reducerPath]: playerApi.reducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(
        contentfulApi.middleware,
        playerApi.middleware
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
