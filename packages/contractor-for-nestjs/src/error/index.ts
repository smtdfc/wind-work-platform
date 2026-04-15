import { HttpStatus } from "@nestjs/common";

export class ContractError extends Error {
  constructor(
    public message: string,
    public status: HttpStatus = 400,
    public code: string = "UNKNOWN_ERR",
    public details: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export interface IContractError {
  code: string;
  status: number | string;
  name: string;
}

export function throwErrorFromContract(
  ErrorContractClass: new () => IContractError,
  details: any,
): never {
  let instance = new ErrorContractClass();
  throw new ContractError(
    instance.name,
    typeof instance.status == "string"
      ? parseInt(instance.status)
      : instance.status,
    instance.code,
    details,
  );
}
