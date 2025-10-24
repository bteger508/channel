'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import type { UpdatePage, ReactionType } from '@/types';
import { validatePageTitle, validateUpdateContent, sanitizeText } from '@/lib/validation';
import * as db from '@/lib/database';

interface PagesContextType {
  createPage: (title: string) => Promise<{ success: boolean; pageId?: string; error?: string }>;
  getPage: (id: string) => Promise<{ success: boolean; page?: UpdatePage; error?: string }>;
  postUpdate: (pageId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  addReaction: (pageId: string, updateId: string, reactionType: ReactionType) => Promise<void>;
  removeReaction: (pageId: string, updateId: string, reactionType: ReactionType) => Promise<void>;
}

const PagesContext = createContext<PagesContextType | undefined>(undefined);

export function PagesProvider({ children }: { children: ReactNode }) {
  // ============================================
  // SUPABASE IMPLEMENTATION
  // ============================================

  const createPage = useCallback(async (title: string): Promise<{ success: boolean; pageId?: string; error?: string }> => {
    // Validate title
    const validation = validatePageTitle(title);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const sanitizedTitle = sanitizeText(title);
    const id = db.generateId();

    // Insert into database
    const result = await db.insertPage(id, sanitizedTitle);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, pageId: id };
  }, []);

  const getPage = useCallback(async (id: string): Promise<{ success: boolean; page?: UpdatePage; error?: string }> => {
    return await db.fetchPage(id);
  }, []);

  const postUpdate = useCallback(async (pageId: string, content: string): Promise<{ success: boolean; error?: string }> => {
    // Validate content
    const validation = validateUpdateContent(content);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const sanitizedContent = sanitizeText(content);
    const id = db.generateId();

    // Insert into database
    return await db.insertUpdate(id, pageId, sanitizedContent);
  }, []);

  const addReaction = useCallback(async (pageId: string, updateId: string, reactionType: ReactionType): Promise<void> => {
    await db.incrementReaction(updateId, reactionType);
  }, []);

  const removeReaction = useCallback(async (pageId: string, updateId: string, reactionType: ReactionType): Promise<void> => {
    await db.decrementReaction(updateId, reactionType);
  }, []);

  return (
    <PagesContext.Provider
      value={{
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
