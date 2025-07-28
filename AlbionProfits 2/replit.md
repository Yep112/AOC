# Albion Online Crafting Profit Calculator

## Overview

This is a comprehensive Albion Online crafting profit calculator web application that helps players determine the profitability of crafting various items in the game. The application fetches real-time market data from the Albion Online Data Project API and calculates profit margins based on material costs, usage fees, return rates, and market taxes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with a clear separation between frontend and backend concerns:

- **Frontend**: React-based single-page application built with Vite
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM (configured but may need implementation)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: Wouter for lightweight client-side routing
- **HTTP Client**: Axios for API communication
- **State Management**: TanStack Query for server state caching and synchronization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Pattern**: RESTful endpoints following standard conventions
- **External API Integration**: Albion Online Data Project API for real-time market data
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development Tools**: tsx for TypeScript execution in development

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migration System**: drizzle-kit for schema migrations
- **Connection**: Neon Database serverless PostgreSQL
- **Schema**: Shared schema definitions between client and server

### UI Components
- **Design System**: Custom implementation using shadcn/ui components
- **Theme**: Dark mode support with CSS custom properties
- **Icons**: Lucide React icon library
- **Form Handling**: React Hook Form with Zod validation
- **Data Visualization**: Recharts for profit charts and analytics

## Data Flow

1. **Item Loading**: Application fetches all craftable items from Albion API on startup
2. **Item Selection**: User selects an item, triggering modal with configuration options
3. **Price Fetching**: System retrieves current market prices for the item and its materials
4. **Profit Calculation**: Real-time calculation of profit margins based on user inputs
5. **Results Display**: Comprehensive breakdown of costs, taxes, and net profit

### API Endpoints
- `GET /api/items` - Fetches all craftable items with categories and tiers
- `GET /api/prices?items=<item_ids>` - Retrieves current market prices
- `GET /api/crafting/<item_id>` - Gets crafting material requirements

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **axios**: HTTP client for API requests
- **zod**: Schema validation and type safety

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives (30+ components)
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: SVG icon library
- **react-hook-form**: Form state management
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type safety and developer experience
- **esbuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx with file watching for automatic restarts
- **Database**: Local PostgreSQL or Neon serverless connection
- **Environment**: NODE_ENV=development with debug logging

### Production Build
1. **Frontend Build**: `vite build` compiles React app to static assets
2. **Backend Build**: `esbuild` bundles server code to single JavaScript file
3. **Asset Serving**: Express serves static files from dist/public directory
4. **Database**: Production PostgreSQL with connection pooling

### Key Features
- **Real-time Data**: Live market prices from Albion Online Data Project
- **Comprehensive Calculations**: Material costs, usage fees, return rates, market taxes
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Performance**: Optimized with query caching and lazy loading
- **Type Safety**: End-to-end TypeScript with shared schemas
- **Accessibility**: WAI-ARIA compliant components via Radix UI

The application is designed to handle the complexity of Albion Online's crafting system while providing an intuitive user experience for profit analysis and decision-making.