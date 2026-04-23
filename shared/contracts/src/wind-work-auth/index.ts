// @ts-nocheck
export class ValidatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidatorError";
  }
}

export class ValidationError extends Error {
  errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export function Is(value: unknown, constraint: unknown, msg: string): void {
  if (value !== constraint) {
    throw new ValidatorError(msg);
  }
}

export function Min(value: unknown, min: number, msg: string): void {
  if (typeof value !== "number" || value < min) {
    throw new ValidatorError(msg);
  }
}

export function Max(value: unknown, max: number, msg: string): void {
  if (typeof value !== "number" || value > max) {
    throw new ValidatorError(msg);
  }
}

export function Length(value: unknown, length: number, msg: string): void {
  if (typeof value !== "string" || value.length !== length) {
    throw new ValidatorError(msg);
  }
}

export function MinLength(value: unknown, min: number, msg: string): void {
  if (typeof value !== "string" || value.length < min) {
    throw new ValidatorError(msg);
  }
}

export function MaxLength(value: unknown, max: number, msg: string): void {
  if (typeof value !== "string" || value.length > max) {
    throw new ValidatorError(msg);
  }
}

export function Range(value: unknown, min: number, max: number, msg: string): void {
  if (typeof value !== "number" || value < min || value > max) {
    throw new ValidatorError(msg);
  }
}

export function Matches(value: string, pattern: string, msg: string): void {
  const regex = new RegExp(pattern);
  if (!regex.test(value)) {
    throw new ValidatorError(msg);
  }
}

export function Contains(value: string, part: string, msg: string): void {
  if (!value.includes(part)) {
    throw new ValidatorError(msg);
  }
}

export function StartsWith(value: string, prefix: string, msg: string): void {
  if (!value.startsWith(prefix)) {
    throw new ValidatorError(msg);
  }
}

export function EndsWith(value: string, suffix: string, msg: string): void {
  if (!value.endsWith(suffix)) {
    throw new ValidatorError(msg);
  }
}

export function In(value: unknown, values: unknown[], msg: string): void {
  if (!values.includes(value)) {
    throw new ValidatorError(msg);
  }
}

export function IsEmail(value: unknown, msg: string): void {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new ValidatorError(msg);
  }
}

export function IsNumber(value: unknown, msg: string): void {
  if (typeof value !== "number") {
    throw new ValidatorError(msg);
  }
}

export function IsURL(value: unknown, msg: string): void {
  if (typeof value !== "string") {
    throw new ValidatorError(msg);
  }

  try {
    new URL(value);
  } catch {
    throw new ValidatorError(msg);
  }
}

export function IsUUID(value: unknown, msg: string): void {
  if (typeof value !== "string" || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value)) {
    throw new ValidatorError(msg);
  }
}

export function IsDate(value: unknown, msg: string): void {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new ValidatorError(msg);
  }
}

export function IsDateTime(value: unknown, msg: string): void {
  IsDate(value, msg);
}

export function IsAlpha(value: unknown, msg: string): void {
  if (typeof value !== "string" || !/^[A-Za-z]+$/.test(value)) {
    throw new ValidatorError(msg);
  }
}

export function IsAlnum(value: unknown, msg: string): void {
  if (typeof value !== "string" || !/^[A-Za-z0-9]+$/.test(value)) {
    throw new ValidatorError(msg);
  }
}

export function NotNull(value: unknown, msg: string): void {
  if (value === null || value === undefined) {
    throw new ValidatorError(msg);
  }
}

export function IsBool(value: unknown, msg: string): void {
  if (typeof value !== "boolean") {
    throw new ValidatorError(msg);
  }
}

export function ValidateModel(value: unknown, msg: string): void {
  if (value === null || value === undefined) {
    return;
  }

  const candidate = value as { validate?: () => void };
  if (typeof candidate.validate !== "function") {
    return;
  }

  try {
    candidate.validate();
  } catch {
    throw new ValidatorError(msg);
  }
}

function prefixErrorPaths(path: string, errors: Record<string, string[]>): Record<string, string[]> {
  const prefixed: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(errors)) {
    const nextKey = key ? `${path}.${key}` : path;
    prefixed[nextKey] = messages;
  }

  return prefixed;
}

export function NestedValidate(value: unknown, path: string, msg: string): void {
  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      NestedValidate(item, `${path}[${index}]`, msg);
    });
    return;
  }

  const candidate = value as { validate?: () => void };
  if (typeof candidate.validate !== "function") {
    return;
  }

  try {
    candidate.validate();
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new ValidationError(error.message, prefixErrorPaths(path, error.errors));
    }

    if (error instanceof ValidatorError) {
      throw new ValidationError("validation failed", { [path]: [error.message] });
    }

    throw new ValidatorError(msg);
  }
}

export class UserNotFoundError extends Error {
  public code = "USER_NOT_FOUND_ERR";
  public status = "404";

  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

export class SignInInformationIncorrectError extends Error {
  public code = "SIGNIN_INFO_INCORRECT_ERR";
  public status = "400";

  constructor() {
    super("Sign-in Information Incorrect");
    this.name = "SignInInformationIncorrectError";
  }
}

export class AuthorizationError extends Error {
  public code = "AUTHORIZATION_ERR";
  public status = "401";

  constructor() {
    super("Unauthenticated");
    this.name = "AuthorizationError";
  }
}

export class InvalidSessionError extends Error {
  public code = "INVALID_SESSION_ERR";
  public status = "400";

  constructor() {
    super("InvalidSessionError");
    this.name = "InvalidSessionError";
  }
}
export const ErrorMap: Record<string, () => Error> = {
  "USER_NOT_FOUND_ERR": () => new UserNotFoundError(),
  "SIGNIN_INFO_INCORRECT_ERR": () => new SignInInformationIncorrectError(),
  "AUTHORIZATION_ERR": () => new AuthorizationError(),
  "INVALID_SESSION_ERR": () => new InvalidSessionError(),
};

export function createErrorByKey(key: string): Error | null {
  const factory = ErrorMap[key];
  return factory ? factory() : null;
}
export class Token {
  // @ts-ignore: generated field may be initialized outside constructor
accessToken: string;

  static fromJson(json: string): Token {
    const data = JSON.parse(json);
    return data instanceof Token ? data : new Token(data);
  }
  constructor(data: any = {}) {
    this.accessToken = data.accessToken;
  }

  validate(): void {
    const errors: Record<string, string[]> = {};

    const addError = (field: string, message: string): void => {
      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    };

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("validation failed", errors);
    }
  }

}

export class User {
  // @ts-ignore: generated field may be initialized outside constructor
id: string;
  // @ts-ignore: generated field may be initialized outside constructor
email: string;
  // @ts-ignore: generated field may be initialized outside constructor
username: string;
  avatar?: string;
  displayName?: string;

  static fromJson(json: string): User {
    const data = JSON.parse(json);
    return data instanceof User ? data : new User(data);
  }
  constructor(data: any = {}) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username;
    this.avatar = data.avatar;
    this.displayName = data.displayName;
  }

  validate(): void {
    const errors: Record<string, string[]> = {};

    const addError = (field: string, message: string): void => {
      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    };

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("validation failed", errors);
    }
  }

}

export class SignInMetadata {
  // @ts-ignore: generated field may be initialized outside constructor
browser: string;
  // @ts-ignore: generated field may be initialized outside constructor
userAgent: string;

  static fromJson(json: string): SignInMetadata {
    const data = JSON.parse(json);
    return data instanceof SignInMetadata ? data : new SignInMetadata(data);
  }
  constructor(data: any = {}) {
    this.browser = data.browser;
    this.userAgent = data.userAgent;
  }

  validate(): void {
    const errors: Record<string, string[]> = {};

    const addError = (field: string, message: string): void => {
      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    };
    try {
      NotNull(this.userAgent, "FIELD_NOT_NULL");
    } catch (error) {
      if (error instanceof ValidatorError) {
        addError("userAgent", error.message);
      } else if (error instanceof ValidationError) {
        for (const [key, messages] of Object.entries(error.errors)) {
          for (const message of messages) {
            addError(key, message);
          }
        }
      } else {
        throw error;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("validation failed", errors);
    }
  }

}

export class SignInWithEmailRequest {
  // @ts-ignore: generated field may be initialized outside constructor
email: string;
  // @ts-ignore: generated field may be initialized outside constructor
password: string;
  // @ts-ignore: generated field may be initialized outside constructor
metadata: SignInMetadata;

  static fromJson(json: string): SignInWithEmailRequest {
    const data = JSON.parse(json);
    return data instanceof SignInWithEmailRequest ? data : new SignInWithEmailRequest(data);
  }
  constructor(data: any = {}) {
    this.email = data.email;
    this.password = data.password;
    this.metadata = data.metadata ? (data.metadata instanceof SignInMetadata ? data.metadata : new SignInMetadata(data.metadata)) : undefined;
  }

  validate(): void {
    const errors: Record<string, string[]> = {};

    const addError = (field: string, message: string): void => {
      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    };
    try {
      NotNull(this.email, "FIELD_NOT_NULL");
    } catch (error) {
      if (error instanceof ValidatorError) {
        addError("email", error.message);
      } else if (error instanceof ValidationError) {
        for (const [key, messages] of Object.entries(error.errors)) {
          for (const message of messages) {
            addError(key, message);
          }
        }
      } else {
        throw error;
      }
    }
    try {
      IsEmail(this.email, "INVALID_EMAIL");
    } catch (error) {
      if (error instanceof ValidatorError) {
        addError("email", error.message);
      } else if (error instanceof ValidationError) {
        for (const [key, messages] of Object.entries(error.errors)) {
          for (const message of messages) {
            addError(key, message);
          }
        }
      } else {
        throw error;
      }
    }
    try {
      NotNull(this.password, "FIELD_NOT_NULL");
    } catch (error) {
      if (error instanceof ValidatorError) {
        addError("password", error.message);
      } else if (error instanceof ValidationError) {
        for (const [key, messages] of Object.entries(error.errors)) {
          for (const message of messages) {
            addError(key, message);
          }
        }
      } else {
        throw error;
      }
    }
    try {
      NotNull(this.metadata, "FIELD_NOT_NULL");
    } catch (error) {
      if (error instanceof ValidatorError) {
        addError("metadata", error.message);
      } else if (error instanceof ValidationError) {
        for (const [key, messages] of Object.entries(error.errors)) {
          for (const message of messages) {
            addError(key, message);
          }
        }
      } else {
        throw error;
      }
    }
    try {
      NestedValidate(this.metadata, "metadata", "INVALID_DATA");
    } catch (error) {
      if (error instanceof ValidatorError) {
        addError("metadata", error.message);
      } else if (error instanceof ValidationError) {
        for (const [key, messages] of Object.entries(error.errors)) {
          for (const message of messages) {
            addError(key, message);
          }
        }
      } else {
        throw error;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("validation failed", errors);
    }
  }

}

export class SignInWithEmailResponse {
  // @ts-ignore: generated field may be initialized outside constructor
user: User;
  // @ts-ignore: generated field may be initialized outside constructor
tokens: Token;

  static fromJson(json: string): SignInWithEmailResponse {
    const data = JSON.parse(json);
    return data instanceof SignInWithEmailResponse ? data : new SignInWithEmailResponse(data);
  }
  constructor(data: any = {}) {
    this.user = data.user ? (data.user instanceof User ? data.user : new User(data.user)) : undefined;
    this.tokens = data.tokens ? (data.tokens instanceof Token ? data.tokens : new Token(data.tokens)) : undefined;
  }

  validate(): void {
    const errors: Record<string, string[]> = {};

    const addError = (field: string, message: string): void => {
      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    };

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("validation failed", errors);
    }
  }

}

export class GetProfileResponse {
  // @ts-ignore: generated field may be initialized outside constructor
user: User;

  static fromJson(json: string): GetProfileResponse {
    const data = JSON.parse(json);
    return data instanceof GetProfileResponse ? data : new GetProfileResponse(data);
  }
  constructor(data: any = {}) {
    this.user = data.user ? (data.user instanceof User ? data.user : new User(data.user)) : undefined;
  }

  validate(): void {
    const errors: Record<string, string[]> = {};

    const addError = (field: string, message: string): void => {
      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    };

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("validation failed", errors);
    }
  }

}

export class RefreshSessionResponse {
  // @ts-ignore: generated field may be initialized outside constructor
user: User;
  // @ts-ignore: generated field may be initialized outside constructor
tokens: Token;

  static fromJson(json: string): RefreshSessionResponse {
    const data = JSON.parse(json);
    return data instanceof RefreshSessionResponse ? data : new RefreshSessionResponse(data);
  }
  constructor(data: any = {}) {
    this.user = data.user ? (data.user instanceof User ? data.user : new User(data.user)) : undefined;
    this.tokens = data.tokens ? (data.tokens instanceof Token ? data.tokens : new Token(data.tokens)) : undefined;
  }

  validate(): void {
    const errors: Record<string, string[]> = {};

    const addError = (field: string, message: string): void => {
      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    };

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("validation failed", errors);
    }
  }

}

export type RestInfo = {
  path: string;
  method: string;
  queries: string[];
};

export const SignInWithEmail: RestInfo = {
  path: "/api/v1/auth/sign-in/email",
  method: "POST",
  queries: [],
};
export type SignInWithEmailRequestBody = any;
export type SignInWithEmailResponseBody = any;

export const GetProfile: RestInfo = {
  path: "/api/v1/auth/profile",
  method: "GET",
  queries: [],
};
export type GetProfileRequestBody = any;
export type GetProfileResponseBody = any;

export const RefreshSession: RestInfo = {
  path: "/api/v1/auth/refresh",
  method: "POST",
  queries: [],
};
export type RefreshSessionRequestBody = any;
export type RefreshSessionResponseBody = any;

export const SignOut: RestInfo = {
  path: "/api/v1/auth/sign-out",
  method: "POST",
  queries: [],
};
export type SignOutRequestBody = any;
export type SignOutResponseBody = any;
