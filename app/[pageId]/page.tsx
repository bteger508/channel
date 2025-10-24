'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, HandHeart, ThumbsUp, Share2, Check, Clock, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { usePages } from '@/context/PagesContext';
import { VALIDATION } from '@/lib/validation';
import type { ReactionType, UpdatePage } from '@/types';

export default function UpdatePage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;
  const { getPage, postUpdate, addReaction, removeReaction } = usePages();

  const [page, setPage] = useState<UpdatePage | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [pageError, setPageError] = useState('');
  const [newUpdate, setNewUpdate] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType | null>>({});

  // Fetch page data on mount
  useEffect(() => {
    async function loadPage() {
      setIsLoadingPage(true);
      setPageError('');

      try {
        const result = await getPage(pageId);

        if (result.success && result.page) {
          setPage(result.page);
        } else {
          setPageError(result.error || 'Page not found');
        }
      } catch (err) {
        console.error('Error loading page:', err);
        setPageError('Failed to load page. Please try again.');
      } finally {
        setIsLoadingPage(false);
      }
    }

    loadPage();
  }, [pageId, getPage]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim() || !page) return;

    setIsPosting(true);
    setError('');

    try {
      const result = await postUpdate(pageId, newUpdate);

      if (result.success) {
        setNewUpdate('');
        // Reload page to show new update
        const pageResult = await getPage(pageId);
        if (pageResult.success && pageResult.page) {
          setPage(pageResult.page);
        }
      } else {
        setError(result.error || 'Failed to post update');
      }
    } catch (err) {
      console.error('Error posting update:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleReaction = async (updateId: string, reactionType: ReactionType) => {
    if (!page) return;

    const currentReaction = userReactions[updateId];

    // Optimistic update - update UI immediately
    const wasToggleOff = currentReaction === reactionType;
    setUserReactions({
      ...userReactions,
      [updateId]: wasToggleOff ? null : reactionType,
    });

    // Update page state optimistically
    setPage({
      ...page,
      updates: page.updates.map(update => {
        if (update.id !== updateId) return update;

        const newReactions = { ...update.reactions };

        // Remove previous reaction
        if (currentReaction) {
          newReactions[currentReaction] = Math.max(0, newReactions[currentReaction] - 1);
        }

        // Add new reaction if not toggling off
        if (!wasToggleOff) {
          newReactions[reactionType] = newReactions[reactionType] + 1;
        }

        return { ...update, reactions: newReactions };
      }),
    });

    try {
      // Perform database updates
      if (currentReaction) {
        await removeReaction(pageId, updateId, currentReaction);
      }

      if (!wasToggleOff) {
        await addReaction(pageId, updateId, reactionType);
      }
    } catch (err) {
      console.error('Error updating reaction:', err);
      // Revert optimistic update on error
      setUserReactions({
        ...userReactions,
        [updateId]: currentReaction,
      });
      // Reload page to get accurate state
      const pageResult = await getPage(pageId);
      if (pageResult.success && pageResult.page) {
        setPage(pageResult.page);
      }
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const reactionButtons: { type: ReactionType; icon: typeof Heart; emoji: string; color: string; label: string }[] = [
    { type: 'heart', icon: Heart, emoji: '❤️', color: 'text-reaction-heart hover:bg-reaction-heart/10', label: 'Send love' },
    { type: 'pray', icon: HandHeart, emoji: '🙏', color: 'text-reaction-pray hover:bg-reaction-pray/10', label: 'Praying' },
    { type: 'thumbsup', icon: ThumbsUp, emoji: '👍', color: 'text-reaction-thumbs hover:bg-reaction-thumbs/10', label: 'Support' },
  ];

  // Loading state
  if (isLoadingPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (pageError || !page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {pageError || 'This update page doesn\'t exist or may have been removed.'}
          </p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => router.push('/')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Go back home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl md:text-3xl font-bold truncate">{page.title}</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Created {formatTimestamp(page.createdAt)} • {page.updates.length} {page.updates.length === 1 ? 'update' : 'updates'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Post Update Form */}
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handlePostUpdate} className="space-y-4">
            <div>
              <Textarea
                placeholder="Share an update..."
                value={newUpdate}
                onChange={(e) => {
                  setNewUpdate(e.target.value);
                  setError('');
                }}
                aria-label="Write your update"
                className="min-h-[100px]"
                maxLength={VALIDATION.UPDATE_CONTENT.MAX_LENGTH}
                error={error}
              />
              <p className="text-xs text-muted-foreground mt-1.5 text-right">
                {newUpdate.length}/{VALIDATION.UPDATE_CONTENT.MAX_LENGTH}
              </p>
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                Updates are visible to anyone with the link
              </p>
              <Button
                type="submit"
                disabled={!newUpdate.trim() || isPosting}
              >
                {isPosting ? 'Posting...' : 'Post Update'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Updates Timeline */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Updates
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          {page.updates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-2">No updates yet</p>
              <p className="text-muted-foreground text-sm">Post the first update to get started!</p>
            </div>
          ) : (
            page.updates.map((update, index) => (
              <Card key={update.id} className="relative">
                {/* Timeline Connector */}
                {index < page.updates.length - 1 && (
                  <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border -mb-6" />
                )}

                <div className="flex gap-4">
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Update Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <time className="text-sm text-muted-foreground">
                      {formatTimestamp(update.timestamp)}
                    </time>
                    <p className="mt-2 text-foreground whitespace-pre-wrap leading-relaxed">
                      {update.content}
                    </p>

                    {/* Reactions */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {reactionButtons.map(({ type, emoji, color, label }) => {
                        const count = update.reactions[type];
                        const isActive = userReactions[update.id] === type;

                        return (
                          <button
                            key={type}
                            onClick={() => handleReaction(update.id, type)}
                            className={`
                              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                              border-2 transition-all
                              ${isActive
                                ? 'border-current bg-current/10 scale-105'
                                : 'border-border hover:border-current'
                              }
                              ${color}
                            `}
                            aria-label={`${label} (${count})`}
                            aria-pressed={isActive}
                          >
                            <span className="text-base">{emoji}</span>
                            {count > 0 && (
                              <span className="text-sm font-medium">{count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}