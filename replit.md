# CopperBear Electrical E-Commerce Platform

## Overview
This project is a full-stack e-commerce and service booking platform for CopperBear, an electrical products and services company. It aims to provide Amazon-like functionality for electrical products and professional electrical services, offering a modern, scalable solution for online sales and service management in the electrical industry.

## User Preferences
Preferred communication style: Simple, everyday language.
Navigation Preferences: Enterprise-level navigation with smooth transitions, loading states, and scroll restoration.

## System Architecture

### Folder Structure
- **Root Level**: Essential config files, `/docs` for documentation.
- **Client**: Feature-based organization with shared components, hooks, and utilities.
- **Server**: Domain-driven API routes (`/src/routes/`) separated by business concerns.
- **Shared**: Type definitions and schemas shared between client and server.
- **Documentation**: Centralized in `/docs`.

### Frontend Architecture
- **Framework**: React 18 with TypeScript, Vite.
- **Routing**: Wouter.
- **State Management**: TanStack Query (React Query).
- **UI Library**: Custom components built on Radix UI primitives, Shadcn/ui.
- **Styling**: Tailwind CSS with custom CopperBear brand colors (copper/lime theme), responsive design (mobile-first), WCAG 2.1 AA accessibility considerations, Amazon-style mobile navigation.
- **Forms**: React Hook Form with Zod validation.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Authentication**: Firebase Authentication with Google Sign-In, token-based session management.
- **API Design**: RESTful API with domain-based routes (auth, products, categories, orders, services, admin).

### Data Storage Solutions
- **Primary Database**: Firestore (Google Cloud NoSQL database).
- **SDK**: Firebase SDK.
- **Schema Management**: TypeScript interfaces and Zod validation schemas.
- **Real-time**: Native Firestore real-time listeners.

### Authentication & Authorization
- **Provider**: Firebase Authentication with Google Sign-In.
- **Session Management**: Firebase Auth tokens with automatic refresh.
- **User Roles**: Admin permissions based on specific email.
- **Security**: Firebase secure authentication with redirect flow, pure Firebase token verification.
- **Features**: Dedicated admin login system, guest cart functionality (localStorage persistence, migrates on sign-in), secure authentication page with animated slide-in.

### Key Components
- **Database Schema**: Users, Categories, Products, Services, Orders & Order Items, Service Bookings, Cart Items, Reviews, Wishlists.
- **Enterprise Cart System**: Supports coupons, discounts, validation, real-time updates with optimistic UI, guest cart support with session persistence and authenticated user migration, "save for later", special instructions, and coupon management. Includes comprehensive debugging and race condition prevention.
- **Frontend Pages**: Landing, Home, Products, Services, Product/Service Detail, Cart, Checkout, Account, Admin.
- **Account Management**: Comprehensive dashboard with order history, bookings, saved items, payments, and security settings.
- **Currency Localization**: All currency displays are in Indian Rupees (INR) with consistent formatting.
- **Content Strategy**: Separate marketing-focused landing page and personalized home page.
- **UI/UX Decisions**: Copper primary colors with lime green accents, responsive design, WCAG 2.1 AA accessibility, Amazon-style mobile navigation, enterprise-level navigation system with smart scroll restoration, loading progress indicators, and route preloading.

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