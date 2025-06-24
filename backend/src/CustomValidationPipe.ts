import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        if(metadata.type !== 'body') {
            return value;
        }

        if(!value) {
            throw new BadRequestException('Validation failed: No data provided');
        }

        // if it's not a class, return the value    
        if(!metadata.metatype || !this.toValidateClass(metadata.metatype)) {
            return value;
        }

        const object = plainToInstance(metadata.metatype, value);
        const errors = await validate(object);

        // if there are validation errors, throw a BadRequestException
        if(errors.length > 0) {
            const validationErrors = errors.reduce((acc, err) => {
                acc[err.property] = err.constraints ? { message: Object.values(err.constraints)[0] } : {};
                return acc;
            }, {})

            throw new BadRequestException({
                message: 'Validation failed',
                errors: validationErrors
            })
        }

        // if no errors, return the value
        return value;
    }

    private toValidateClass(metaType: any): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.includes(metaType)
    }
}