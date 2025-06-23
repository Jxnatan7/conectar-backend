import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './user/core/schemas/user.schema';
import { runSeeders } from 'typeorm-extension';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  const userCount = await dataSource.getRepository(User).count();
  if (userCount === 0) {
    await runSeeders(dataSource, {
      seeds: ['./src/user/core/seed/user.seeder.ts'],
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
