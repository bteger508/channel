'use client';

import { useState } from 'react';
import { Heart, HandHeart, ThumbsUp, Share2, Copy, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import type { Update, ReactionType } from '@/types';

// Demo data
const DEMO_PAGE_TITLE = "Sarah's Recovery Updates";
const DEMO_PAGE_ID = "demo-page-123";

const initialUpdates: Update[] = [
  {
    id: '3',
    content: 'Good morning! Just finished my first walk around the block. Small steps but it feels amazing to be moving again. Thank you all for the prayers and support!',
    timestamp: new Date('2025-10-23T09:30:00'),
    reactions: { heart: 12, pray: 8, thumbsup: 15 }
  },
  {
    id: '2',
    content: 'Surgery went well! The doctors are pleased with how everything went. I\'ll be in recovery for the next day or two. Feeling grateful for all the love.',
    timestamp: new Date('2025-10-22T14:15:00'),
    reactions: { heart: 24, pray: 18, thumbsup: 20 }
  },
  {
    id: '1',
    content: 'Heading into surgery in about an hour. Feeling nervous but ready. Will update when I can. Thanks for all the messages!',
    timestamp: new Date('2025-10-22T07:00:00'),
    reactions: { heart: 18, pray: 25, thumbsup: 12 }
  },
];

export default function DemoPage() {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [newUpdate, setNewUpdate] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType | null>>({});

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/demo`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    setIsPosting(true);
    setTimeout(() => {
      const update: Update = {
        id: Date.now().toString(),
        content: newUpdate,
        timestamp: new Date(),
        reactions: { heart: 0, pray: 0, thumbsup: 0 }
      };
      setUpdates([update, ...updates]);
      setNewUpdate('');
      setIsPosting(false);
    }, 500);
  };

  const handleReaction = (updateId: string, reactionType: ReactionType) => {
    const currentReaction = userReactions[updateId];

    setUpdates(updates.map(update => {
      if (update.id !== updateId) return update;

      const newReactions = { ...update.reactions };

      // Remove previous reaction
      if (currentReaction) {
        newReactions[currentReaction] = Math.max(0, newReactions[currentReaction] - 1);
      }

      // Add new reaction if different from current
      if (currentReaction !== reactionType) {
        newReactions[reactionType] = newReactions[reactionType] + 1;
      }

      return { ...update, reactions: newReactions };
    }));

    // Update user's reaction state
    setUserReactions({
      ...userReactions,
      [updateId]: currentReaction === reactionType ? null : reactionType
    });
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

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

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{DEMO_PAGE_TITLE}</h1>
              <p className="text-sm text-muted-foreground mt-1">View updates and show support</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Post Update Form - Only shown to page owner */}
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handlePostUpdate} className="space-y-4">
            <Textarea
              placeholder="Share an update..."
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              aria-label="Write your update"
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
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

          {updates.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No updates yet. Post the first one!</p>
            </div>
          ) : (
            updates.map((update, index) => (
              <Card key={update.id} className="relative">
                {/* Timeline Connector */}
                {index < updates.length - 1 && (
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
                      {reactionButtons.map(({ type, icon: Icon, emoji, color, label }) => {
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

        {/* Helper Text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            This is a demo page showing how One-Way Updates works.
            <br />
            <a href="/" className="text-primary hover:underline font-medium">
              Create your own update page →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}