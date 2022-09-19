import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { GetDraftsDto, NewDraftDto, RemoveDraftDto } from './app.dto';
import { AppService } from './app.service';
import { systemLogger } from './libs/logger';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @EventPattern('newDraft')
  async addNewDraft(draft: NewDraftDto) {
    try {
      await this.appService.create(draft);
    } catch (e) {
      systemLogger.logger.error(e);
    }
  }

  @MessagePattern({ cmd: 'getDrafts' })
  async getAllDrafts(fields: GetDraftsDto) {
    try {
      return this.appService.getAllUserDraft(fields.userId, fields.articleId);
    } catch (e) {
      systemLogger.logger.error(e);
    }
  }

  @MessagePattern({ cmd: 'removeDraft' })
  async removeDraft({ userId, id }: RemoveDraftDto) {
    try {
      await this.appService.removeDraft(id, userId);
      return this.appService.getAllUserDraft(userId);
    } catch (e) {
      systemLogger.logger.error(e);
    }
  }

  @MessagePattern({ cmd: 'greeting' })
  getGreetingMessage(name: string): string {
    return `Hello ${name}`;
  }
}
