import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as moment from "moment-timezone";

const now = () => {
  return moment.tz(Date.now(), "Asia/Tehran").toISOString();
};

@Schema()
export class Draft {
  @Prop({ required: false, default: null })
  articleId?: number;

  @Prop({ required: true })
  userId: number;

  @Prop({ default: 'بدون عنوان' })
  title?: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  bodyUrl: string;

  @Prop({ default: now })
  createdAt?: Date;
}

export type DraftDocument = Draft & Document;

export const DraftSchema = SchemaFactory.createForClass(Draft);
