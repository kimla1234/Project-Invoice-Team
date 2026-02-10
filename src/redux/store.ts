import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./feature/auth/authSlice";
import { normPlovApi } from "./api";
import tokenSlice from "./feature/auth/authSlice";


export const makeStore = () => {
  const store = configureStore({
    reducer: {
      [normPlovApi.reducerPath]: normPlovApi.reducer,
      auth: authSlice,
      token: tokenSlice,


    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(normPlovApi.middleware),
  });

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
