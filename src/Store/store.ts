import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./slices/modals";
import { contentfulApi } from "./slices/backend";
import activeMissionReducer from "./slices/activeMission";
import layoutReducer from "./slices/layout";

const store = configureStore({
  reducer: {
    activeMission: activeMissionReducer,
    modals: modalReducer,
    layout: layoutReducer,
    [contentfulApi.reducerPath]: contentfulApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(contentfulApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
