import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BarChart3,
    Package,
    ShoppingCart,
    LogOut,
    ExternalLink,
    Shield,
    Menu,
    X,
    ChevronLeft,
    Settings,
} from "lucide-react";

// Navigation item type
export interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
}

// Default navigation items
export const adminNavItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "products", label: "Products", icon: <Package className="w-5 h-5" /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart className="w-5 h-5" /> },
];

interface AdminSidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
    userEmail?: string;
    onLogout: () => void;
    isOpen: boolean;
    onToggle: () => void;
    navItems?: NavItem[];
}

export function AdminSidebar({
    activeSection,
    onSectionChange,
    userEmail,
    onLogout,
    isOpen,
    onToggle,
    navItems = adminNavItems,
}: AdminSidebarProps) {
    // Handle ESC key to close sidebar on mobile
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onToggle();
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onToggle]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleNavClick = (sectionId: string) => {
        onSectionChange(sectionId);
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
            onToggle();
        }
    };

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onToggle}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-[280px] lg:w-[260px]",
                    "bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950",
                    "border-r border-gray-800 shadow-2xl",
                    "flex flex-col",
                    "transition-transform duration-300 ease-in-out",
                    "lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header / Branding */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white tracking-tight">CopperBear</span>
                            <span className="text-xs text-gray-400 font-medium">Admin Panel</span>
                        </div>
                    </div>

                    {/* Close button - mobile only */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
                                    "text-left font-medium transition-all duration-200",
                                    "group relative overflow-hidden",
                                    isActive
                                        ? "bg-teal-600/20 text-teal-400 shadow-lg shadow-teal-500/10"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                                )}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-r-full" />
                                )}

                                <span className={cn(
                                    "transition-colors duration-200",
                                    isActive ? "text-teal-400" : "text-gray-500 group-hover:text-teal-400"
                                )}>
                                    {item.icon}
                                </span>

                                <span className="flex-1">{item.label}</span>

                                {item.badge && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-teal-600/30 text-teal-300 border-teal-600/50 text-xs"
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Quick Actions */}
                <div className="p-4 border-t border-gray-800">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open("/", "_blank")}
                        className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-gray-800/60 font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Store</span>
                    </Button>
                </div>

                {/* User Section */}
                <div className="p-4 border-t border-gray-800 bg-gray-950/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {userEmail?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {userEmail || "Admin"}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs text-gray-500">Authenticated</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onLogout}
                        className="w-full justify-start gap-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </aside>
        </>
    );
}

// Mobile Header with Hamburger Toggle
interface MobileHeaderProps {
    onToggleSidebar: () => void;
    title?: string;
}

export function AdminMobileHeader({ onToggleSidebar, title = "Admin" }: MobileHeaderProps) {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                    <Menu className="w-6 h-6" />
                </Button>

                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <span className="font-bold text-gray-900">{title}</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open("/", "_blank")}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                    <ExternalLink className="w-5 h-5" />
                </Button>
            </div>
        </header>
    );
}
