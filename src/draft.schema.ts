import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as moment from 'moment-timezone';

const now = () => {
  return moment.tz(Date.now(), 'Asia/Tehran').toISOString();
};

@Schema()
export class Draft {
  @Prop()
  userId: number;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  bodyUrl: string;

  @Prop({ default: now })
  createdAt: Date;
}

export type DraftDocument = Draft & Document;

export const DraftSchema = SchemaFactory.createForClass(Draft);
