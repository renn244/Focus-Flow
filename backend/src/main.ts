import './instrument';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './CustomValidationPipe';
import { AllExceptionFilter } from './AllExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new CustomValidationPipe())
  app.useGlobalFilters(new AllExceptionFilter());
  app.setGlobalPrefix('api')

  const config = new DocumentBuilder()
    .setTitle('FocusFlow API')
    .setDescription('API documentation for FocusFlow')
    .setVersion('1.0')
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      })
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config, { 
    extraModels: [], deepScanRoutes: true,  
  });
  SwaggerModule.setup('docs', app, documentFactory);

  app.enableCors({
    origin: process.env.CLIENT_BASE_URL ?? 'http://localhost:5173',
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();