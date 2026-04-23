import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(`${process.env.PORT}`) || 3000;
  await app.listen(port, () => {
    console.log(` __    __ _           _   __    __           _    
/ / /\\ \\ (_)_ __   __| | / / /\\ \\ \\___  _ __| | __
\\ \\/  \\/ / | '_ \\ / _\` | \\ \\/  \\/ / _ \\| '__| |/ /
 \\  /\\  /| | | | | (_| |  \\  /\\  / (_) | |  |   < 
  \\/  \\/ |_|_| |_|\\__,_|   \\/  \\/ \\___/|_|  |_|\\_\\
                                                  `);
    console.log(`Monolithic Mode: Server started on port ${port}`);
  });
}

bootstrap();
