import { ArgumentsHost, Catch, ExceptionFilter, HttpException, InternalServerErrorException, Logger } from "@nestjs/common";
import { SentryExceptionCaptured } from "@sentry/nestjs";
import { Error as MongooseError } from "mongoose";
import * as Sentry from '@sentry/nestjs';
import handleMongooseError from "./lib/MongooseExceptionHandler";
import 'dotenv/config'; 

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    private readonly loggerr = new Logger("Exception");

    @SentryExceptionCaptured()
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        let status = 500; // assuming internal server error
        let message = "Unexpected error occurred";
        let name: string | undefined = "Internal Server Error";
        let errors: any = undefined;

        if(exception instanceof MongooseError || exception?.name === "MongoServerError") {
            status = 400;
            name = undefined;
            message = "Validation failed";
            errors = handleMongooseError(exception);

        } else if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse() as any;

            status = exception.getStatus();

            if(typeof exceptionResponse === "object" && exceptionResponse.errors) {
                errors = exceptionResponse.errors;
            }

            if(typeof exceptionResponse === "object") {
                name = exceptionResponse.name;
                message = exceptionResponse.message;
            } else if (typeof exceptionResponse === "string") {
                message = exceptionResponse;
            }
        } else {
            // handle the server unexpected bugs that should be fixed
            this.loggerr.error(exception);
            message = exception.message;
            
            if(process.env.SOFTWARE_ENV === "production") {
                // Log to Sentry Manually if needed
                Sentry.captureException(exception);
            }
        }

        response.status(status).json({
            statusCode: status,
            name: name,
            message: message,
            errors: errors
        })
    }
}