import type { LoginSchema, SignupSchema } from "@/types";
import { api } from "./api";

export const signupUser = async (data: SignupSchema) => {
  try {
    const user = await api.post("/auth/signup", data);
    return user;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const loginUser = async (data: LoginSchema) => {
  try {
    const user = await api.post("/auth/login", data);
    return user;
  } catch (error) {
    throw new Error(String(error));
  }
};
