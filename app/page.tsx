'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Sparkles, Lock, Users, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { usePages } from '@/context/PagesContext';
import { VALIDATION } from '@/lib/validation';

export default function Home() {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [createdPage, setCreatedPage] = useState<{ pageId: string; publishToken: string } | null>(null);
  const [copiedPublisher, setCopiedPublisher] = useState(false);
  const [copiedSubscriber, setCopiedSubscriber] = useState(false);
  const { createPage } = usePages();
  const router = useRouter();

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    setError('');

    try {
      // Create the page and get the result (now async)
      const result = await createPage(title);

      if (result.success && result.pageId && result.publishToken) {
        // Show success screen with both URLs
        setCreatedPage({ pageId: result.pageId, publishToken: result.publishToken });
      } else {
        // Show error
        setError(result.error || 'Failed to create page');
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Unexpected error creating page:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsCreating(false);
    }
  };

  const handleCopyUrl = async (url: string, type: 'publisher' | 'subscriber') => {
    try {
      await navigator.clipboard.writeText(url);
      if (type === 'publisher') {
        setCopiedPublisher(true);
        setTimeout(() => setCopiedPublisher(false), 2000);
      } else {
        setCopiedSubscriber(true);
        setTimeout(() => setCopiedSubscriber(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const publisherUrl = createdPage
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${createdPage.pageId}/publish?token=${createdPage.publishToken}`
    : '';

  const subscriberUrl = createdPage
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${createdPage.pageId}`
    : '';

  // Success screen showing both URLs
  if (createdPage) {
    return (
      <div className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-success/10 text-success rounded-full flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Page Created!</h1>
              <p className="text-muted-foreground text-lg">
                Your update page is ready. Save your publisher link and share the subscriber link.
              </p>
            </div>

            {/* Publisher URL */}
            <Card variant="elevated" className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">Publisher URL (Keep Secret!)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Only you should have this link. Use it to post updates.
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0 px-3 py-2 bg-muted rounded-lg text-sm font-mono truncate">
                        {publisherUrl}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(publisherUrl, 'publisher')}
                        className="shrink-0"
                      >
                        {copiedPublisher ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscriber URL */}
            <Card variant="elevated" className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/10 text-accent-foreground rounded-full flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">Subscriber URL (Share This!)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Share this link with anyone who wants to follow your updates.
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0 px-3 py-2 bg-muted rounded-lg text-sm font-mono truncate">
                        {subscriberUrl}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(subscriberUrl, 'subscriber')}
                        className="shrink-0"
                      >
                        {copiedSubscriber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => router.push(publisherUrl)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Publisher View
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => {
                  setCreatedPage(null);
                  setTitle('');
                  setIsCreating(false);
                }}
              >
                Create Another Page
              </Button>
            </div>

            {/* Warning */}
            <Card className="mt-8 bg-warning/5 border-warning/20">
              <CardContent className="pt-6">
                <p className="text-sm text-warning-foreground">
                  <strong>Important:</strong> Save your publisher URL now! You won&apos;t be able to retrieve it later.
                  If you lose it, you won&apos;t be able to post new updates.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-accent/30 text-accent-foreground rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Share updates, not conversations
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              One-Way Updates
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Share important updates with loved ones without the pressure of managing conversations.
            </p>
          </div>

          {/* Create Form */}
          <Card variant="elevated" className="mb-16">
            <CardHeader>
              <CardTitle>Create Your Update Page</CardTitle>
              <CardDescription>
                Start sharing updates in seconds. No account required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePage} className="space-y-6">
                <div>
                  <Input
                    label="Page Title"
                    placeholder="e.g., Sarah's Recovery Updates"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setError('');
                    }}
                    required
                    autoFocus
                    maxLength={VALIDATION.PAGE_TITLE.MAX_LENGTH}
                    error={error}
                    aria-label="Enter a title for your update page"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5 text-right">
                    {title.length}/{VALIDATION.PAGE_TITLE.MAX_LENGTH}
                  </p>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!title.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Page'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No Pressure</h3>
                <p className="text-muted-foreground text-sm">
                  Recipients can show support without typing responses
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Simple Reactions</h3>
                <p className="text-muted-foreground text-sm">
                  React with ❤️ 🙏 👍 to show you care
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Easy Sharing</h3>
                <p className="text-muted-foreground text-sm">
                  One link to share, everyone stays updated
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases */}
          <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-8 sm:mb-10 md:mb-12 text-center">Perfect For</h2>
            <ul className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-8 xl:gap-10 max-w-6xl mx-auto">
              <li className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-5 bg-success text-success-foreground rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">Medical recovery</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Share progress with family without managing dozens of text threads
                  </p>
                </div>
              </li>
              <li className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-5 bg-success text-success-foreground rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">Prayer requests</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Broadcast needs to your community without reply pressure
                  </p>
                </div>
              </li>
              <li className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-5 bg-success text-success-foreground rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">Important announcements</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Keep everyone informed when you&apos;re too overwhelmed to chat
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
