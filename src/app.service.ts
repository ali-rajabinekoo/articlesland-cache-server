import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Draft, DraftDocument } from "./draft.schema";
import { Model } from "mongoose";
import { DraftResponseDto, NewDraftDto } from "./app.dto";
import { join } from "path";
import * as fs from "fs/promises";
import { v4 as uuidV4 } from "uuid";
import { htmlToText } from "html-to-text";
import { systemLogger } from "./libs/logger";
import { draftQueueLimit } from "./libs/config";

@Injectable()
export class AppService {
  private draftDirectoryCreated = false;

  constructor(
    @InjectModel(Draft.name) private draftModel: Model<DraftDocument>
  ) {
    this.checkCacheDirectories().catch((e) => {
      if (!!e) {
        console.log(e);
        systemLogger.logger.error(e);
      }
    });
  }

  private generateDraftName(): string {
    return join(__dirname, `../cache/drafts/${uuidV4()}.html`);
  }

  private async checkCacheDirectories(): Promise<void> {
    const articleDir: string = join(__dirname, "../cache/drafts/");
    const catDir: string = join(__dirname, `../cache/drafts/`);
    try {
      await fs.readdir(articleDir);
    } catch {
      await fs.mkdir(articleDir, { recursive: true });
    }
    try {
      await fs.readdir(catDir);
    } catch {
      await fs.mkdir(catDir, { recursive: true });
    }
    this.draftDirectoryCreated = true;
  }

  private async saveDraftBody(body: string): Promise<string> {
    if (!this.draftDirectoryCreated) {
      await this.checkCacheDirectories();
    }
    let filePath: string = this.generateDraftName();
    let exist = true;
    while (exist) {
      try {
        await fs.readFile(filePath);
        filePath = this.generateDraftName();
      } catch {
        exist = false;
      }
    }
    await fs.writeFile(filePath, body, "utf8");
    return filePath;
  }

  private async fetchDraftBody(url: string): Promise<string> {
    return await fs.readFile(url, "utf8");
  }

  private async removeSavedFile(bodyPath: string): Promise<void> {
    await fs.unlink(bodyPath);
  }

  private formatDescription(description: string): string {
    return htmlToText(description).slice(0, 300);
  }

  private async checkAndRemoveLastDraft(userId: number, articleId: number | undefined) {
    const query: any = { userId, articleId: null };
    if (!!articleId) query.articleId = articleId;
    const drafts: DraftDocument[] = await this.draftModel
      .find(query)
      .sort({ createdAt: -1 });
    while (
      drafts.length !== 0 &&
      !!draftQueueLimit &&
      drafts.length > draftQueueLimit
      ) {
      const removableDraft: DraftDocument = drafts.pop();
      try {
        await this.removeSavedFile(removableDraft.bodyUrl);
      } catch (e) {
      }
      await this.draftModel.deleteOne({ _id: removableDraft._id });
    }
  }

  async create(newDraft: NewDraftDto): Promise<void> {
    const query: DraftDocument = {
      userId: newDraft.userId,
      bodyUrl: await this.saveDraftBody(newDraft.body),
      description: this.formatDescription(newDraft.body)
    } as DraftDocument;
    if (!!newDraft.title) {
      query.title = newDraft.title;
    }
    if (!!newDraft.articleId) {
      query.articleId = newDraft.articleId;
    }
    const createdCat = new this.draftModel(query);
    await createdCat.save();
    await this.checkAndRemoveLastDraft(newDraft.userId, newDraft.articleId);
  }

  async getAllUserDraft(userId: number, articleId?: number | undefined): Promise<DraftResponseDto[]> {
    const query: any = { userId, articleId: null };
    if (!!articleId) query.articleId = articleId;
    const drafts: DraftDocument[] = await this.draftModel
      .find(query)
      .sort({ createdAt: -1 });
    const response: DraftResponseDto[] = await Promise.all(
      drafts.map(
        async (el: DraftDocument): Promise<DraftResponseDto> => ({
          id: el._id,
          title: el.title,
          userId: el.userId,
          description: el.description,
          createdAt: String(el.createdAt),
          body: await this.fetchDraftBody(el.bodyUrl)
        })
      )
    );
    return response;
  }

  async removeDraft(id: string, userId: number): Promise<void> {
    const draft: DraftDocument = await this.draftModel.findById(id);
    if (!!draft && Number(draft?.userId) === userId) {
      await this.removeSavedFile(draft.bodyUrl);
      await draft.remove();
    }
  }
}
