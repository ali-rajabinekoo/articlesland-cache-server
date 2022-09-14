export class NewDraftDto {
  body: string;
  userId: number;
  title?: string | undefined;
  articleId?: number | undefined;
}

export class DraftResponseDto {
  id: string;
  body: string;
  title: string;
  userId: number;
  createdAt: string;
  description: string;
  articleId?: number | undefined;
}

export class GetDraftsDto {
  userId: number;
  articleId: number;
}

export class RemoveDraftDto {
  id: string;
  userId: number;
}
