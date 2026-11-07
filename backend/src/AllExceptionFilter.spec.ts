import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';
import { Error as MongooseError } from 'mongoose';
import { AllExceptionFilter } from './AllExceptionFilter';

describe('AllExceptionFilter database errors', () => {
    let response: any;
    let host: ArgumentsHost;

    beforeEach(() => {
        response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        host = { switchToHttp: () => ({ getResponse: () => response }) } as unknown as ArgumentsHost;
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    });
    afterEach(() => jest.restoreAllMocks());

    it('does not disguise a transaction failure as input validation', () => {
        new AllExceptionFilter().catch({ name: 'MongoServerError', code: 251, message: 'NoSuchTransaction' }, host);
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unexpected error occurred', errors: undefined }));
    });

    it('preserves actual field validation errors', () => {
        const error = new MongooseError.ValidationError();
        error.addError('title', new MongooseError.ValidatorError({ path: 'title', message: 'Title is required' }));
        new AllExceptionFilter().catch(error, host);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation failed', errors: { title: { message: 'Title is required' } } }));
    });

    it('handles translated database exceptions inside the filter instead of throwing', () => {
        new AllExceptionFilter().catch({ name: 'MongoServerError', code: 50 }, host);
        expect(response.status).toHaveBeenCalledWith(408);
    });

    it('preserves DTO validation details', () => {
        const errors = { taskFutureColumnId: { message: 'Invalid future column Id.' } };
        new AllExceptionFilter().catch(new BadRequestException({ message: 'Validation failed', errors }), host);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ errors }));
    });
});
