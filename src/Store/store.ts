import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./slices/modals";
import { listApi } from "./slices/lists";
import { mapApi } from "./slices/map";
import { contentApi } from "./slices/content";
import { sessionsApi } from "./slices/sessions";

const store = configureStore({
  reducer: {
    modals: modalReducer,
    [sessionsApi.reducerPath]: sessionsApi.reducer,
    [contentApi.reducerPath]: contentApi.reducer,
    [mapApi.reducerPath]: mapApi.reducer,
    [listApi.reducerPath]: listApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      sessionsApi.middleware,
      contentApi.middleware,
      mapApi.middleware,
      listApi.middleware
    ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
