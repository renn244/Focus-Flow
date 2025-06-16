

export type ValidationErrors = {
    [key: string]: { message: string };
}

export type ExceptionResponse = {
    statusCode: number;
    message: string ;
    errors?: ValidationErrors;
}