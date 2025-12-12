import { useState, ReactNode } from "react";
import { AdminSidebar, AdminMobileHeader, NavItem, adminNavItems } from "./admin-sidebar";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
    children: ReactNode;
    activeSection: string;
    onSectionChange: (section: string) => void;
    userEmail?: string;
    onLogout: () => void;
    navItems?: NavItem[];
    pageTitle?: string;
    pageDescription?: string;
}

/**
 * AdminLayout provides a responsive layout wrapper for the admin panel.
 * 
 * Features:
 * - Fixed sidebar on desktop (lg+)
 * - Collapsible sidebar on tablet/mobile
 * - Mobile header with hamburger toggle
 * - Proper content offset for fixed elements
 */
export function AdminLayout({
    children,
    activeSection,
    onSectionChange,
    userEmail,
    onLogout,
    navItems = adminNavItems,
    pageTitle,
    pageDescription,
}: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <AdminMobileHeader
                onToggleSidebar={toggleSidebar}
                title="CopperBear Admin"
            />

            {/* Sidebar */}
            <AdminSidebar
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                userEmail={userEmail}
                onLogout={onLogout}
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
                navItems={navItems}
            />

            {/* Main Content Area */}
            <main
                className={cn(
                    "min-h-screen transition-[padding] duration-300",
                    // Desktop: offset for fixed sidebar
                    "lg:pl-[260px]",
                    // Mobile: add top padding for fixed header
                    "pt-16 lg:pt-0"
                )}
            >
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
                    {/* Page Header (optional) */}
                    {(pageTitle || pageDescription) && (
                        <div className="mb-6 lg:mb-8">
                            {pageTitle && (
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                    {pageTitle}
                                </h1>
                            )}
                            {pageDescription && (
                                <p className="text-gray-600 text-sm sm:text-base">
                                    {pageDescription}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Page Content */}
                    {children}
                </div>
            </main>
        </div>
    );
}

/**
 * AdminContentSection is a helper component for wrapping section content.
 * Use this to wrap each section's content for consistent styling.
 */
interface AdminContentSectionProps {
    children: ReactNode;
    className?: string;
}

export function AdminContentSection({ children, className }: AdminContentSectionProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {children}
        </div>
    );
}
