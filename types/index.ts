export interface Reactions {
  heart: number;
  pray: number;
  thumbsup: number;
}

export interface Update {
  id: string;
  content: string;
  timestamp: Date;
  reactions: Reactions;
}

export interface UpdatePage {
  id: string;
  title: string;
  createdAt: Date;
  updates: Update[];
}

export type ReactionType = keyof Reactions;