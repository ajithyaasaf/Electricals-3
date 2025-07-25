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
- **Authentication**: Firebase Authentication with Google Sign-In
- **Session Management**: Firebase Auth tokens with automatic refresh
- **API Design**: RESTful API with consistent error handling

### Data Storage Solutions
- **Primary Database**: Firestore (Google Cloud NoSQL database)
- **SDK**: Firebase SDK for client and server operations
- **Schema Management**: TypeScript interfaces and Zod validation schemas
- **Real-time**: Native Firestore real-time listeners for live data updates

### Authentication & Authorization
- **Provider**: 100% Firebase Authentication with Google Sign-In (No Replit Auth)
- **Session Management**: Firebase Auth tokens with automatic refresh
- **User Roles**: Admin permissions based on email (admin@copperbear.com)
- **Security**: Firebase secure authentication with redirect flow
- **Backend**: Pure Firebase token verification (No Passport/OpenID dependencies)

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
1. User initiates login via Firebase Google Sign-In
2. Firebase handles OAuth redirect flow
3. User state managed in Firebase Auth
4. Frontend receives authenticated user data with Firebase tokens

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
- **firebase**: Complete Firebase SDK for authentication and Firestore
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing
- **express**: Backend web framework
- **zod**: Schema validation for data types

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
- **Database**: Firebase Firestore with real-time sync

### Build Process
1. Frontend: Vite builds to `dist/public`
2. Backend: esbuild bundles to `dist/index.js`
3. Database: Firestore schema managed through TypeScript types

### Production Deployment
- **Static Assets**: Frontend build serves from `dist/public`
- **API Server**: Node.js serves bundled Express application
- **Database**: Firebase Firestore with automatic scaling
- **Environment**: Configuration via Firebase environment variables

### Key Configuration
- **Database**: Firebase Firestore with SDK authentication
- **Auth**: Firebase Authentication with Google Sign-In
- **Build**: Separate client/server build processes with shared Firestore schema

The application is designed for easy deployment on Replit with automatic Firebase setup and Firebase Authentication, providing a modern serverless architecture that scales automatically without complex database configuration.

## Recent Changes - July 25, 2025

### Currency Localization to INR - Migration Completed
- **Complete INR Migration**: Successfully migrated all currency displays from USD to Indian Rupees (INR) 
- **Currency Utilities**: Created comprehensive currency formatting library with formatPrice(), formatSavings(), and calculateDiscount() functions
- **Price Updates**: Updated all mock product data, deals, and pricing displays to use appropriate INR values (approximately 83:1 USD to INR conversion)
- **Filter Range Updates**: Adjusted product price range filters from $0-1000 to ₹0-100,000 with appropriate step values
- **Component Updates**: Updated ProductCard, ProductDetail, HorizontalProductSection, and all pricing components to use INR formatting
- **Consistent Formatting**: Implemented Indian number formatting with proper rupee symbol (₹) and comma separators as per Indian standards

## Previous Changes - July 25, 2025

### Enterprise-Level Account Management System
- **Professional Dashboard**: Added comprehensive account overview with key metrics cards showing total orders, bookings, saved items, and total spending
- **Advanced Tab Navigation**: Expanded from 5 to 7 tabs including new Payments and Security sections for enterprise-grade account management
- **Payment Management**: Professional payment methods section with saved cards, billing history, and invoice downloads
- **Security Center**: Complete security dashboard with 2FA settings, login notifications, password management, and active session monitoring
- **Business Account Integration**: Added business upgrade pathway with contractor benefits and bulk pricing access
- **Enhanced Settings**: Comprehensive notification preferences, account actions, and danger zone for account deletion
- **Mobile Responsive Design**: Optimized tab layout for mobile with hidden text labels and icon-only display on small screens
- **Enterprise UX**: Professional card layouts, hover effects, status indicators, and visual hierarchy matching Amazon/Google standards

## Recent Changes - July 24, 2025

### Professional Authentication Modal Implementation - Migration Completed
- **Modern UI Design**: Implemented enterprise-grade authentication modal with Amazon/Google-style professional design
- **Enhanced UX**: Added comprehensive form validation with visual error indicators and loading states
- **Responsive Layout**: Professional mobile-first design with proper spacing, typography, and accessibility
- **Security Features**: Added password visibility toggle, remember me option, and security assurance messaging
- **Email/Password Primary**: Prioritized email/password authentication with Google OAuth as optional backup
- **User Role System**: Automatic user creation in database with proper role assignment (default: user, admin: admin@copperbear.com)
- **Complete Migration**: Successfully migrated project from Replit Agent to Replit environment with full Firebase integration

### Complete PostgreSQL to Firestore Migration
- **Database Migration**: Successfully migrated from PostgreSQL/Drizzle ORM to Google Firestore NoSQL database
- **Modern Architecture**: Implemented scalable NoSQL data structure with Firebase SDK integration
- **Type Safety**: Created comprehensive TypeScript types and Zod validation schemas for all data models
- **Service Layer**: Built robust Firestore service layer with generic CRUD operations and specialized query methods
- **Authentication Integration**: Updated Firebase Authentication to work seamlessly with Firestore user management
- **Real-time Capabilities**: Enabled Firestore's native real-time listeners for live data updates
- **Performance Optimization**: Removed PostgreSQL dependencies and streamlined database operations
- **Development Simplicity**: Eliminated complex database setup requirements for easier development workflow

### Firebase Authentication Integration
- **Complete Migration**: Replaced Replit Auth with Firebase Authentication system
- **Google Sign-In**: Implemented Google OAuth authentication with Firebase redirect flow
- **User State Management**: Created useFirebaseAuth hook for consistent authentication state
- **Admin Role Management**: Updated admin access to use Firebase user email verification (admin@copperbear.com)
- **Authentication Components**: Built FirebaseRedirectHandler for post-authentication flow handling
- **Toast Notifications**: Added user feedback for sign-in/sign-out operations with proper error handling
- **Cross-Platform**: Fully functional authentication across all pages and components

### Firebase Authentication Integration
- **Complete Migration**: Replaced Replit Auth with Firebase Authentication system
- **Google Sign-In**: Implemented Google OAuth authentication with Firebase redirect flow
- **User State Management**: Created useFirebaseAuth hook for consistent authentication state
- **Admin Role Management**: Updated admin access to use Firebase user email verification (admin@copperbear.com)
- **Authentication Components**: Built FirebaseRedirectHandler for post-authentication flow handling
- **Toast Notifications**: Added user feedback for sign-in/sign-out operations with proper error handling
- **Cross-Platform**: Fully functional authentication across all pages and components

### Amazon-Style Mobile Navigation Implementation
- **Mobile UX Redesign**: Implemented Amazon-style hierarchical mobile navigation for electrical products
- **Organized Categories**: Created department-style sections including "Electrical Components", "Tools & Equipment", "Lighting Solutions", "Installation Services", "Shop by Project", and "Special Offers"  
- **Expandable Sections**: Added collapsible navigation sections with chevron indicators for better information hierarchy
- **Professional Layout**: Updated mobile sidebar with dark header, user greeting, and proper visual separation
- **Industry-Focused Structure**: Tailored navigation to electrical trade workflows and professional purchasing patterns
- **Clean Interface**: Removed redundant search bar from mobile navigation for cleaner, more professional appearance matching Amazon's UX patterns

## Recent Performance Improvements - July 19, 2025

### Site Speed Optimizations Implemented
- **Query Client Optimization**: Updated TanStack Query cache settings with 5-minute stale time and 10-minute garbage collection
- **Lazy Loading Images**: Created LazyImage component with intersection observer for efficient image loading
- **Debounced Search**: Implemented 300ms search debouncing to reduce API calls in products page
- **Skeleton Loading**: Added optimized skeleton components for better perceived performance
- **Memoization**: Added React.memo to ProductCard component to prevent unnecessary re-renders
- **Error Boundaries**: Implemented error boundary for graceful error handling
- **Performance Monitoring**: Added Web Vitals tracking and resource preloading
- **CSS Optimizations**: Added critical CSS and performance-focused styles
- **Session Configuration**: Fixed session secret configuration for development environment

### Component Architecture Improvements
- **Performance Utilities**: Created comprehensive performance library with caching, optimization functions
- **Loading States**: Unified skeleton loading across all pages with ProductGridSkeleton and HeroSkeleton
- **Search Optimization**: Replaced basic input with optimized SearchInput component with debouncing
- **Image Optimization**: Added automatic image URL optimization for Unsplash images with proper sizing