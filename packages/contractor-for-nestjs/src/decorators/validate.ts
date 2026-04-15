import { Body } from "@nestjs/common";
import { ValidationPipe } from "../pipes/index.js";

export const ValidateFromContract = () => Body(new ValidationPipe());
