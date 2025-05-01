import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IAuth {
  email: string;
  name: string;
  image: string;
  role: string;
  isLogin: boolean;
}

const initialState: IAuth = {
  email: "",
  name: "",
  image: "",
  role: "",
  isLogin: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state: IAuth, action: PayloadAction<IAuth>) => {
      state.email = action.payload.email;
      state.name = action.payload.name;

      state.isLogin = true;
    },
    logout: (state: IAuth) => {
      state.isLogin = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
