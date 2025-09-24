export interface SignupSchema {
  name: string;
  email: string;
  password: string;
}

export interface LoginSchema {
  email: string;
  password: string;
}

export interface NavItems {
  name: string;
  url: string;
}
