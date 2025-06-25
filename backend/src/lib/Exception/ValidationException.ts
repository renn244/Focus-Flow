import { HttpException } from "@nestjs/common";

class ErrorValidationDto {
    [key: string] : { message: string };   
}

export class ValidationException extends HttpException {
    constructor(error: ErrorValidationDto) {
        super({
            message: "Validation failed",
            errors: error,
        }, 400)
    }
}