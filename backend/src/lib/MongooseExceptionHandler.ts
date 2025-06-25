import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, RequestTimeoutException } from "@nestjs/common";
import { Error as MongooseError } from "mongoose";

// any = MongoServerError
const handleMongooseError = (exception: MongooseError | any) => {
    if(exception instanceof MongooseError) {
        return handleMongooseInstanceError(exception);
    } else {
        return handleMongoServerError(exception);
    }
}

const handleMongooseInstanceError = (exception: MongooseError) => {
    if(exception instanceof MongooseError.CastError) {       
        return { 
            [exception.path]: { message: `Invalid value, expected a valid ${exception.kind} for path "${exception.path}"` } 
        }
    }

    if(exception instanceof MongooseError.ValidationError) {
        return Object.entries(exception.errors).reduce((acc, [key, error]) => {
            if(error instanceof MongooseError.CastError) {
                acc[key] = { message: `Invalid value for "${key}", expected ${error.kind}` }
            } else {
                acc[key] = { message: error.properties.message || `Invalid value for "${key}"` }
            }
 
            return acc
        }, {} as Record<string, { message: string }>)
    }

    if(exception instanceof MongooseError.DocumentNotFoundError) {
        const path = Object.keys(exception.filter)[0] || Object.keys(exception.query)[0] || "unknown";
        const value = exception.filter[path] || exception.query[path];
        
        throw new NotFoundException(`No document found for "${path}" with value "${value}"`);
    }
}

const handleMongoServerError = (exception: any) => {
    if(exception?.code === 11000) {
        // handle compuound indexes Violation by mapping the keyPattern and keyValue
        const key = exception.keyPattern ? Object.keys(exception.keyPattern)[0] : "key";
        const value = Object.keys(exception.keyValue)[0];

        return { [key]: { message: `${value} already exists` } }
    } else if(exception?.code === 121) {
        // The inserted or updated document violates schema-level validation rules (e.g., schema validation in MongoDB or strict field types).
        // Usually this is caught earlier by Mongoose itself (via ValidationError), 
        // but can appear if raw MongoDB inserts bypass Mongoose or schema-level validations are defined directly in the database. 
        throw new BadRequestException("Document validation failed, please check your input data");
    } else if(exception?.code === 66) {
        // This error code indicates that the operation failed due to a write concern error.
        // It means that the write operation did not meet the specified write concern level.
        throw new ConflictException("Write concern error, please try again later");
    } else if(exception?.code === 50) {
        throw new RequestTimeoutException("The operation timed out, please try again later");
    } else if(exception?.code === 13) {
        throw new ForbiddenException("Permission denied for the requested operation");
    }
}

export default handleMongooseError;