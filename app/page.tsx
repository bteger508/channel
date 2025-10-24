'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function Home() {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    // TODO: Create page logic here
    setTimeout(() => {
      console.log('Creating page:', title);
      setIsCreating(false);
      // Will redirect to /[pageId] once that's built
    }, 1000);
  };

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
                <Input
                  label="Page Title"
                  placeholder="e.g., Sarah's Recovery Updates"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                  aria-label="Enter a title for your update page"
                />
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
          <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Perfect For</h2>
            <ul className="space-y-4 max-w-2xl mx-auto">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 mt-0.5 bg-success text-success-foreground rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-foreground">
                  <strong>Medical recovery:</strong> Share progress with family without managing dozens of text threads
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 mt-0.5 bg-success text-success-foreground rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-foreground">
                  <strong>Prayer requests:</strong> Broadcast needs to your community without reply pressure
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 mt-0.5 bg-success text-success-foreground rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-foreground">
                  <strong>Important announcements:</strong> Keep everyone informed when you're too overwhelmed to chat
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
