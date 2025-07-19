# CopperBear Electrical E-Commerce Platform

## Overview

This is a full-stack e-commerce and service booking platform for CopperBear, an electrical products and services company. The application replicates Amazon-like functionality specifically tailored for electrical products and professional electrical services. Built with modern web technologies, it features a React/TypeScript frontend, Express.js backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Custom components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CopperBear brand colors (copper/electric-blue theme)
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with consistent error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon serverless with WebSocket support

### Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions
- **User Roles**: Admin and regular user permissions
- **Security**: HTTP-only cookies, secure session management

## Key Components

### Database Schema
The application uses a comprehensive schema with the following main entities:
- **Users**: Authentication and profile data with admin roles
- **Categories**: Hierarchical product/service categorization
- **Products**: Complete product catalog with specifications, pricing, and inventory
- **Services**: Professional electrical services with pricing and descriptions
- **Orders & Order Items**: E-commerce order management
- **Service Bookings**: Appointment scheduling for services
- **Cart Items**: Shopping cart persistence
- **Reviews**: Product and service rating system
- **Wishlists**: User favorite items

### Frontend Pages
- **Landing**: Public marketing page for unauthenticated users
- **Home**: Authenticated user dashboard with featured products
- **Products**: Product catalog with filtering, search, and pagination
- **Services**: Service listings with booking capabilities
- **Product/Service Detail**: Detailed views with reviews and specifications
- **Cart**: Shopping cart management
- **Checkout**: Multi-step order completion
- **Account**: User profile and order history
- **Admin**: Administrative dashboard for content management

### UI Component System
- **Design System**: Shadcn/ui components with custom CopperBear branding
- **Color Scheme**: Copper primary colors with electric blue accents
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: WCAG 2.1 AA compliance considerations

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect handles authentication
3. User session stored in PostgreSQL
4. Frontend receives user data and permissions

### E-Commerce Flow
1. Product browsing with category/search filtering
2. Add to cart (requires authentication)
3. Cart persistence in database
4. Multi-step checkout process
5. Order creation and confirmation

### Service Booking Flow
1. Service discovery and details
2. Booking form with date/time selection
3. Address and service notes collection
4. Booking confirmation and management

### Admin Flow
1. Admin authentication verification
2. CRUD operations for products, services, categories
3. Order and booking management
4. Analytics dashboard

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing
- **express**: Backend web framework
- **passport**: Authentication middleware

### UI & Styling
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **typescript**: Type safety across the stack
- **vite**: Frontend build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Production backend bundling

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with auto-reload
- **Database**: Neon serverless PostgreSQL

### Build Process
1. Frontend: Vite builds to `dist/public`
2. Backend: esbuild bundles to `dist/index.js`
3. Database: Drizzle migrations apply schema changes

### Production Deployment
- **Static Assets**: Frontend build serves from `dist/public`
- **API Server**: Node.js serves bundled Express application
- **Database**: Neon PostgreSQL with connection pooling
- **Environment**: Configuration via environment variables

### Key Configuration
- **Database**: `DATABASE_URL` for Neon connection
- **Auth**: Replit Auth with `REPLIT_DOMAINS` and `SESSION_SECRET`
- **Build**: Separate client/server build processes with shared schema

The application is designed for easy deployment on Replit with automatic environment setup and integrated authentication, while maintaining the flexibility to deploy on other platforms with minimal configuration changes.