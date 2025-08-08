import React, { useCallback, forwardRef } from "react";
import { Link as WouterLink, useLocation } from "wouter";
import { useEnterpriseNavigation, useLinkPreload } from "@/hooks/use-enterprise-navigation";
import { cn } from "@/lib/utils";

interface SmartLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  preload?: boolean;
  scrollToTop?: boolean;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
}

export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  ({ 
    href, 
    children, 
    className, 
    preload = true, 
    scrollToTop = true, 
    replace = false,
    onClick,
    onMouseEnter,
    ...props 
  }, ref) => {
    const [location] = useLocation();
    const { navigateWithProgress } = useEnterpriseNavigation();
    const { handleLinkHover } = useLinkPreload();
    
    const isActive = location === href || location.startsWith(href + '/') || 
      (href.includes('?') && location.includes(href.split('?')[0]));
    
    const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      
      // Call original onClick if provided
      if (onClick) {
        onClick(e);
      }
      
      // Use enterprise navigation
      navigateWithProgress(href, { 
        preload,
        replace 
      });
    }, [href, navigateWithProgress, preload, replace, onClick]);
    
    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onMouseEnter) {
        onMouseEnter(e);
      }
      
      if (preload) {
        const cleanup = handleLinkHover(href);
        // Cleanup on mouse leave
        const element = e.currentTarget;
        const handleMouseLeave = () => {
          cleanup();
          element.removeEventListener('mouseleave', handleMouseLeave);
        };
        element.addEventListener('mouseleave', handleMouseLeave);
      }
    }, [href, handleLinkHover, preload, onMouseEnter]);

    return (
      <WouterLink
        href={href}
        ref={ref}
        className={cn(
          "transition-all duration-200 ease-in-out",
          "hover:text-copper-600 focus:text-copper-600",
          "focus:outline-none focus:ring-2 focus:ring-copper-500 focus:ring-offset-2",
          isActive && "text-copper-600 font-semibold",
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </WouterLink>
    );
  }
);

SmartLink.displayName = "SmartLink";