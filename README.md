# CopperBear Electrical E-Commerce Platform

A full-stack e-commerce and service booking platform for CopperBear Electrical - providing Amazon-like functionality for electrical products and professional electrical services.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:5000
```

## 🏗️ Project Structure

### Well-Organized & Scalable Architecture

```
├── client/src/                 # Frontend React application
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Route pages
│   ├── features/              # Feature-based modules (future)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and configurations
│   └── main.tsx              # App entry point
├── server/                    # Backend Express.js server
│   ├── data/                  # Seed data and fixtures
│   ├── routes/                # API route handlers (legacy)
│   ├── src/routes/            # New organized API routes
│   ├── firebaseAuth.ts        # Authentication middleware
│   ├── storage.ts             # Data access layer
│   └── index.ts               # Server entry point
├── shared/                    # Shared types and schemas
│   ├── types.ts               # TypeScript interfaces
│   ├── schema.ts              # Zod validation schemas
│   └── firestore.ts           # Firebase configuration
└── docs/                      # Documentation files
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **Radix UI** for accessible component primitives
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Firebase Authentication** for user management
- **Firestore** for database storage
- **Zod** for runtime type validation

### Development Tools
- **tsx** for TypeScript execution
- **ESBuild** for production builds
- **Tailwind CSS** for utility-first styling
- **Type-safe APIs** throughout the stack

## 🌟 Key Features

### E-Commerce
- Product catalog with categories and filtering
- Shopping cart with persistent storage
- Secure checkout process
- Order management and tracking
- Product reviews and ratings
- Wishlist functionality

### Service Booking
- Professional service listings
- Date/time booking system
- Service provider management
- Booking history and status tracking

### Admin Dashboard
- Product and category management
- Order and booking oversight
- User management
- Analytics and reporting

### Technical Features
- Mobile-first responsive design
- Progressive Web App capabilities
- Real-time data synchronization
- Enterprise-level navigation
- Accessibility compliant (WCAG 2.1 AA)
- SEO optimized

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run check    # Type check
```

### Environment Setup

Required environment variables:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PROJECT_ID=your_project_id
```

### Database Seeding

```bash
# Seed the database with sample electrical products
curl -X POST http://localhost:5000/api/admin/seed

# Force refresh the database
curl -X POST http://localhost:5000/api/admin/seed?force=true
```

## 📁 Folder Structure Guidelines

### For Scalability
- **Feature-based organization**: Related components, hooks, and services are co-located
- **Clear separation of concerns**: Business logic separated from presentation
- **Domain-driven design**: API routes organized by business domain
- **Shared utilities**: Common code easily reusable across features

### For Developers
- **Intuitive navigation**: Logical folder structure makes code easy to find
- **Consistent patterns**: Established conventions for new features
- **Type safety**: Comprehensive TypeScript coverage
- **Self-documenting**: Clear naming and organization

### Best Practices
- Components follow atomic design principles
- API routes are grouped by domain (auth, products, orders)
- Shared types and utilities prevent duplication
- Documentation co-located with relevant code

## 🚀 Deployment

The application is designed for easy deployment on Replit with automatic builds and optimized production assets.

## 📖 Documentation

Detailed documentation is available in the `/docs` folder:
- [Admin Setup Guide](docs/ADMIN_SETUP.md)
- [Architecture Analysis](docs/ARCHITECTURE_ANALYSIS.md)
- [Content Strategy](docs/CONTENT_STRATEGY.md)
- [Firebase Setup](docs/FIREBASE_SETUP.md)

## 🎨 Design System

The application uses a copper and electric blue color scheme specifically designed for the electrical industry:
- Professional and trustworthy appearance
- WCAG 2.1 AA accessibility compliance
- Responsive design patterns
- Consistent component library

## 🔐 Security

- Firebase Authentication for secure user management
- JWT token-based API authentication
- Input validation with Zod schemas
- HTTPS-only cookies for session management
- SQL injection prevention through parameterized queries

---

Built with ❤️ for the electrical industry by CopperBear Electrical