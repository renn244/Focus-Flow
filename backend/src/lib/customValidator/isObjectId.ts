import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import { Types } from "mongoose";

/**
 * Custom decorator that checks if the decorated property value is a valid MongoDB ObjectId.
 * Useful for validating fields that should contain ObjectId values in DTOs.
 * 
 * @param validationOptions - Optional class-validator validation options.
 * 
 * @returns A property decorator that registers the custom validator.
 * 
 * @example
 * import { IsObjectId } from './is-object-id.decorator';
 * import { IsString } from 'class-validator';
 * 
 * export class CreateProjectDto {
 *    @IsObjectId({ message: 'Invalid project ID' })
 *    projectId: string;
 *    
 *    @IsString()
 *    name: string;
 * }
 */

export function IsObjectId(property: any, validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsObjectId',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if(!Types.ObjectId.isValid(value)) {
                        return false;
                    }

                    return true
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid ObjectId`;
                }
            }
        })
    }
}