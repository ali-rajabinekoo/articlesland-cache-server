import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Draft, DraftSchema } from './draft.schema';
import { databaseUrl } from './libs/config';

@Module({
  imports: [
    MongooseModule.forRoot(databaseUrl),
    MongooseModule.forFeature([
      {
        name: Draft.name,
        schema: DraftSchema,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
