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
  publishToken?: string; // Only returned to creator, not included in public fetches
  createdAt: Date;
  updates: Update[];
}

export type ReactionType = keyof Reactions;

// ============================================
// Database Types (matching Supabase schema)
// ============================================

export interface DbUpdatePage {
  id: string;
  title: string;
  publish_token: string;
  created_at: string; // ISO timestamp from Postgres
  updated_at: string;
}

export interface DbUpdate {
  id: string;
  page_id: string;
  content: string;
  timestamp: string; // ISO timestamp from Postgres
  reactions_heart: number;
  reactions_pray: number;
  reactions_thumbsup: number;
  created_at: string;
}

// ============================================
// Type Conversion Utilities
// ============================================

export function dbUpdateToUpdate(dbUpdate: DbUpdate): Update {
  return {
    id: dbUpdate.id,
    content: dbUpdate.content,
    timestamp: new Date(dbUpdate.timestamp),
    reactions: {
      heart: dbUpdate.reactions_heart,
      pray: dbUpdate.reactions_pray,
      thumbsup: dbUpdate.reactions_thumbsup,
    },
  };
}

export function dbPageToPage(dbPage: DbUpdatePage, dbUpdates: DbUpdate[]): UpdatePage {
  return {
    id: dbPage.id,
    title: dbPage.title,
    createdAt: new Date(dbPage.created_at),
    updates: dbUpdates.map(dbUpdateToUpdate).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  };
}