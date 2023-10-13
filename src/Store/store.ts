import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./slices/modals";
import { backendApi, contentfulApi } from "./slices/backend";

const store = configureStore({
  reducer: {
    modals: modalReducer,
    [backendApi.reducerPath]: backendApi.reducer,
    [contentfulApi.reducerPath]: contentfulApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      backendApi.middleware,
      contentfulApi.middleware
    ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
