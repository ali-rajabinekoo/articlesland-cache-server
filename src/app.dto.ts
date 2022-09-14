export class NewDraftDto {
  body: string;
  title: string;
  userId: number;
}

export class DraftResponseDto {
  id: string;
  body: string;
  title: string;
  userId: number;
  createdAt: string;
  description: string;
}

export class RemoveDraftDto {
  id: string;
  userId: number;
}
