import './instrument';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './CustomValidationPipe';
import { AllExceptionFilter } from './AllExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new CustomValidationPipe())
  app.useGlobalFilters(new AllExceptionFilter());
  app.setGlobalPrefix('api')

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();