import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";
import { Types } from "mongoose";

/**
 * Custom NestJS pipe that transforms a string or ObjectId value into a Mongoose ObjectId.
 * Validates that the input is a valid ObjectId format.
 * Throws a BadRequestException if the validation fails.
 * 
 * Usage:
 * @UsePipes(new ParseObjectIdPipe())
 * @Query('id', ParseObjectIdPipe) id: Types.ObjectId
 * @Param('id', ParseObjectIdPipe) id: Types.ObjectId
 * 
 * @example
 * import { Controller, Get, Query, UsePipes } from '@nestjs/common';
 * import { ParseObjectIdPipe } from './parse-object-id.pipe';
 * import { Types } from 'mongoose';
 * 
 * @Controller('items')
 * export class ItemsController {
 *    @Get()
 *    getItem(@Query('id', ParseObjectIdPipe) id: Types.ObjectId) {
 *       // id is guaranteed to be a valid ObjectId
 *      return this.itemsService.findById(id);
 *    }
 * }
 */

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): Types.ObjectId {
        if(!Types.ObjectId.isValid(value)) {
            throw new BadRequestException({ message: "Validation failed (ObjectId is expected)" })
        }

        return typeof value === "string" ? new Types.ObjectId(value) : value;
    }
}