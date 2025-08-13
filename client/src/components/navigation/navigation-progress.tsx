import { useEnterpriseNavigation } from "@/hooks/use-enterprise-navigation";
import { cn } from "@/lib/utils";

export function NavigationProgress() {
  const { navigationState } = useEnterpriseNavigation();
  
  if (!navigationState.isNavigating) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className={cn(
          "h-1 bg-gradient-to-r from-copper-500 to-lime-500",
          "transition-all duration-300 ease-out",
          "shadow-lg shadow-copper-500/20"
        )}
        style={{
          width: `${navigationState.loadingProgress}%`,
          opacity: navigationState.isNavigating ? 1 : 0,
        }}
      />
      
      {/* Subtle loading backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-white/50 backdrop-blur-sm",
          "transition-opacity duration-300",
          navigationState.isNavigating ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ zIndex: -1 }}
      />
    </div>
  );
}