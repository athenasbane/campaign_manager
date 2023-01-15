import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./slices/modals";
import listsReducer from "./slices/lists";
import sessionsReducer from "./slices/sessions";
import mapsReducer from "./slices/map";
import contentReducer from "./slices/content";

const store = configureStore({
  reducer: {
    modals: modalReducer,
    lists: listsReducer,
    sessions: sessionsReducer,
    maps: mapsReducer,
    content: contentReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
