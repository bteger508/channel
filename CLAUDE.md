# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**One-Way Updates** - A web application for sharing timestamped updates without expecting responses from recipients. Users create shareable update pages (e.g., "Sarah's Recovery") where they can post updates, and recipients can view updates and optionally react with emojis (❤️ 🙏 👍) without the pressure of typing responses.

### Core Use Cases
- Medical recovery updates for family/friends
- Prayer request broadcasting
- Announcements when overwhelmed and unable to manage conversations
- Keeping people informed without individual response management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: v19.2.0
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans & Geist Mono (via next/font)
- **Icons**: Lucide React (to be installed)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Current State
This is a **fresh Next.js project** bootstrapped with create-next-app. The codebase is in the initial setup phase.

### Planned Architecture

**Pages Structure**:
- `/` - Home page for creating new update pages
- `/[pageId]` - Dynamic route for individual update pages (viewing/posting updates)

**Data Model** (prototype uses local state):
- **UpdatePage**: { id, title, createdAt, updates[] }
- **Update**: { id, content, timestamp, reactions: { heart, pray, thumbsup } }

**State Management**:
- Prototype phase: Local React state
- Future: Backend storage (Firebase, Supabase, or custom API)

### Design Philosophy
- **Low Pressure UX**: No typing required for recipients, no read receipts
- **Simple**: Minimal features focused on one-way communication
- **Clean UI**: Minimal, accessible interface

## Configuration Notes

### TypeScript
- Path alias: `@/*` maps to project root
- Strict mode enabled
- JSX mode: `react-jsx`

### Tailwind CSS v4
- Uses new `@theme inline` syntax in `globals.css`
- CSS variables for theming: `--background`, `--foreground`
- Dark mode via `prefers-color-scheme`
- Font variables: `--font-geist-sans`, `--font-geist-mono`

### Next.js Config
- Minimal configuration (default settings)
- App Router architecture
- TypeScript config uses Next.js plugin for enhanced IDE support

## Development Notes

### Next Steps for Implementation
1. Install lucide-react for icons
2. Create type definitions for UpdatePage and Update entities
3. Build home page with "Create Update Page" flow
4. Implement dynamic route `[pageId]` for update pages
5. Add update posting interface with timestamps
6. Implement emoji reaction system
7. Set up local state management (Context or similar)

### Future Production Requirements (from REQUIREMENTS.md)
- Persistent storage backend
- Shareable link generation with URL shortening
- Optional password protection for pages
- Archive/delete functionality
- Edit/delete individual updates
- Optional update notifications