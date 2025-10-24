'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { UpdatePage, Update, ReactionType } from '@/types';

interface PagesContextType {
  pages: Record<string, UpdatePage>;
  createPage: (title: string) => string;
  getPage: (id: string) => UpdatePage | undefined;
  postUpdate: (pageId: string, content: string) => void;
  addReaction: (pageId: string, updateId: string, reactionType: ReactionType) => void;
  removeReaction: (pageId: string, updateId: string, reactionType: ReactionType) => void;
}

const PagesContext = createContext<PagesContextType | undefined>(undefined);

export function PagesProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Record<string, UpdatePage>>({});

  const createPage = useCallback((title: string): string => {
    const id = generateId();
    const newPage: UpdatePage = {
      id,
      title,
      createdAt: new Date(),
      updates: [],
    };

    setPages(prev => ({
      ...prev,
      [id]: newPage,
    }));

    return id;
  }, []);

  const getPage = useCallback((id: string): UpdatePage | undefined => {
    return pages[id];
  }, [pages]);

  const postUpdate = useCallback((pageId: string, content: string) => {
    const newUpdate: Update = {
      id: generateId(),
      content,
      timestamp: new Date(),
      reactions: { heart: 0, pray: 0, thumbsup: 0 },
    };

    setPages(prev => {
      const page = prev[pageId];
      if (!page) return prev;

      return {
        ...prev,
        [pageId]: {
          ...page,
          updates: [newUpdate, ...page.updates],
        },
      };
    });
  }, []);

  const addReaction = useCallback((pageId: string, updateId: string, reactionType: ReactionType) => {
    setPages(prev => {
      const page = prev[pageId];
      if (!page) return prev;

      return {
        ...prev,
        [pageId]: {
          ...page,
          updates: page.updates.map(update => {
            if (update.id !== updateId) return update;
            return {
              ...update,
              reactions: {
                ...update.reactions,
                [reactionType]: update.reactions[reactionType] + 1,
              },
            };
          }),
        },
      };
    });
  }, []);

  const removeReaction = useCallback((pageId: string, updateId: string, reactionType: ReactionType) => {
    setPages(prev => {
      const page = prev[pageId];
      if (!page) return prev;

      return {
        ...prev,
        [pageId]: {
          ...page,
          updates: page.updates.map(update => {
            if (update.id !== updateId) return update;
            return {
              ...update,
              reactions: {
                ...update.reactions,
                [reactionType]: Math.max(0, update.reactions[reactionType] - 1),
              },
            };
          }),
        },
      };
    });
  }, []);

  return (
    <PagesContext.Provider
      value={{
        pages,
        createPage,
        getPage,
        postUpdate,
        addReaction,
        removeReaction,
      }}
    >
      {children}
    </PagesContext.Provider>
  );
}

export function usePages() {
  const context = useContext(PagesContext);
  if (!context) {
    throw new Error('usePages must be used within a PagesProvider');
  }
  return context;
}

// Helper function to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
