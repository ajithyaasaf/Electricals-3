# CopperBear Electrical E-Commerce Platform

## Overview
This is a full-stack e-commerce and service booking platform for CopperBear, an electrical products and services company. It replicates Amazon-like functionality for electrical products and professional electrical services. The platform aims to provide a modern, scalable solution for online sales and service management in the electrical industry.

## User Preferences
Preferred communication style: Simple, everyday language.
Navigation Preferences: Enterprise-level navigation with smooth transitions, loading states, and scroll restoration.

## Recent Changes (January 2025)
- ✅ Successfully migrated from Replit Agent to Replit environment 
- ✅ Implemented enterprise-level navigation system with:
  - Smart scroll restoration and position memory
  - Loading progress indicators and smooth transitions 
  - Route preloading for improved performance
  - Professional breadcrumb navigation
  - Enhanced user experience with proper loading states
- ✅ Fixed category filtering in products API (supports both categoryId and category slug)
- ✅ Database seeded with electrical products for all categories
- ✅ All category pages now working properly (wiring-cables, tools-equipment, etc.)
- ✅ Created modern "Why Choose CopperBear Electrical?" section with:
  - Real-time Firebase integration for admin editing
  - Responsive design (1-col mobile, 2-col md, 3-col lg)
  - Accessibility compliant with ARIA labels and keyboard navigation
  - Framer Motion animations and smooth interactions
  - Admin editor interface for live content management

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Library**: Custom components built on Radix UI primitives, Shadcn/ui
- **Styling**: Tailwind CSS with custom CopperBear brand colors (copper/electric-blue theme)
- **Forms**: React Hook Form with Zod validation
- **UI/UX Decisions**: Copper primary colors with electric blue accents, responsive design (mobile-first), WCAG 2.1 AA accessibility considerations, Amazon-style mobile navigation.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Firebase Authentication with Google Sign-In, token-based session management.
- **API Design**: RESTful API with consistent error handling.

### Data Storage Solutions
- **Primary Database**: Firestore (Google Cloud NoSQL database)
- **SDK**: Firebase SDK
- **Schema Management**: TypeScript interfaces and Zod validation schemas
- **Real-time**: Native Firestore real-time listeners

### Authentication & Authorization
- **Provider**: Firebase Authentication with Google Sign-In.
- **Session Management**: Firebase Auth tokens with automatic refresh.
- **User Roles**: Admin permissions based on specific email (admin@copperbear.com).
- **Security**: Firebase secure authentication with redirect flow, pure Firebase token verification.
- **Features**: Dedicated admin login system, guest cart functionality (localStorage persistence, migrates on sign-in), secure authentication modal.

### Key Components
- **Database Schema**: Users, Categories, Products, Services, Orders & Order Items, Service Bookings, Cart Items, Reviews, Wishlists.
- **Frontend Pages**: Landing, Home, Products, Services, Product/Service Detail, Cart, Checkout, Account, Admin.
- **Account Management**: Comprehensive dashboard with order history, bookings, saved items, payments, and security settings.
- **Currency Localization**: All currency displays are in Indian Rupees (INR) with consistent formatting.
- **Content Strategy**: Separate landing page (marketing-focused) vs home page (personalized) following e-commerce best practices.

### Data Flow
- **Authentication Flow**: User login via Firebase Google Sign-In, Firebase handles OAuth, user state managed in Firebase Auth, frontend receives authenticated user data.
- **E-Commerce Flow**: Product browsing, add to cart (authentication required at checkout), cart persistence, multi-step checkout, order creation.
- **Service Booking Flow**: Service discovery, booking form with date/time, address/notes collection, booking confirmation.
- **Admin Flow**: Admin authentication, CRUD operations for products/services/categories, order/booking management, analytics.

## External Dependencies

### Core Dependencies
- `firebase`: Complete Firebase SDK for authentication and Firestore.
- `@tanstack/react-query`: Server state management.
- `wouter`: Client-side routing.
- `express`: Backend web framework.
- `zod`: Schema validation for data types.

### UI & Styling
- `@radix-ui/*`: Headless UI component primitives.
- `tailwindcss`: Utility-first CSS framework.
- `class-variance-authority`: Component variant management.
- `lucide-react`: Icon library.

### Development Tools
- `typescript`: Type safety across the stack.
- `vite`: Frontend build tool.
- `tsx`: TypeScript execution for development.
- `esbuild`: Production backend bundling.