import { supabase } from './supabase';
import type { DbUpdatePage, DbUpdate, UpdatePage, ReactionType } from '@/types';
import { dbPageToPage } from '@/types';

/**
 * Database operations for One-Way Updates
 * All functions are async and handle Supabase interactions
 */

// ============================================
// Page Operations
// ============================================

/**
 * Insert a new update page into the database
 */
export async function insertPage(id: string, title: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('update_pages')
      .insert({
        id,
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error inserting page:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error inserting page:', err);
    return { success: false, error: 'Failed to create page. Please try again.' };
  }
}

/**
 * Fetch a page and all its updates from the database
 */
export async function fetchPage(pageId: string): Promise<{ success: boolean; page?: UpdatePage; error?: string }> {
  try {
    // Fetch the page
    const { data: pageData, error: pageError } = await supabase
      .from('update_pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (pageError) {
      if (pageError.code === 'PGRST116') {
        // Row not found
        return { success: false, error: 'Page not found' };
      }
      console.error('Error fetching page:', pageError);
      return { success: false, error: pageError.message };
    }

    // Fetch all updates for this page
    const { data: updatesData, error: updatesError } = await supabase
      .from('updates')
      .select('*')
      .eq('page_id', pageId)
      .order('timestamp', { ascending: false });

    if (updatesError) {
      console.error('Error fetching updates:', updatesError);
      return { success: false, error: updatesError.message };
    }

    // Validate and convert database types to client types
    if (!pageData || typeof pageData.id !== 'string' || typeof pageData.title !== 'string') {
      console.error('Invalid page data structure:', pageData);
      return { success: false, error: 'Invalid page data received from database' };
    }

    const page = dbPageToPage(pageData as DbUpdatePage, (updatesData || []) as DbUpdate[]);

    return { success: true, page };
  } catch (err) {
    console.error('Unexpected error fetching page:', err);
    return { success: false, error: 'Failed to load page. Please try again.' };
  }
}

// ============================================
// Update Operations
// ============================================

/**
 * Insert a new update into a page
 */
export async function insertUpdate(
  id: string,
  pageId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('updates')
      .insert({
        id,
        page_id: pageId,
        content,
        timestamp: new Date().toISOString(),
        reactions_heart: 0,
        reactions_pray: 0,
        reactions_thumbsup: 0,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error inserting update:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error inserting update:', err);
    return { success: false, error: 'Failed to post update. Please try again.' };
  }
}

// ============================================
// Reaction Operations
// ============================================

/**
 * Increment a reaction counter using atomic database function
 */
export async function incrementReaction(
  updateId: string,
  reactionType: ReactionType
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('increment_reaction', {
      update_id_param: updateId,
      reaction_type: reactionType,
    });

    if (error) {
      console.error('Error incrementing reaction:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error incrementing reaction:', err);
    return { success: false, error: 'Failed to add reaction. Please try again.' };
  }
}

/**
 * Decrement a reaction counter using atomic database function
 */
export async function decrementReaction(
  updateId: string,
  reactionType: ReactionType
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('decrement_reaction', {
      update_id_param: updateId,
      reaction_type: reactionType,
    });

    if (error) {
      console.error('Error decrementing reaction:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error decrementing reaction:', err);
    return { success: false, error: 'Failed to remove reaction. Please try again.' };
  }
}

// ============================================
// Helper function to generate unique IDs
// ============================================

/**
 * Generates a unique ID with timestamp and random component
 * Format: timestamp-random-counter
 * This reduces collision risk under high concurrency
 */
let idCounter = 0;
export function generateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 11);
  const counter = (idCounter++ % 1000).toString().padStart(3, '0');
  return `${timestamp}-${random}-${counter}`;
}
