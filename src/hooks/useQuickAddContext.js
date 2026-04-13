import { useLocation } from "react-router-dom";

export function useQuickAddContext() {
  const location = useLocation();
  
  // Extract context from current URL and return prefill data
  const getContextData = () => {
    const params = new URLSearchParams(location.search);
    
    // If viewing a specific entity, prefill that in Quick Add forms
    if (location.pathname.includes("/customers/")) {
      return { contextType: "customer", contextId: location.pathname.split("/").pop() };
    }
    if (location.pathname.includes("/parts/")) {
      return { contextType: "part", contextId: location.pathname.split("/").pop() };
    }
    if (location.pathname.includes("/enquiries/")) {
      return { contextType: "enquiry", contextId: location.pathname.split("/").pop() };
    }
    
    return { contextType: null, contextId: null };
  };
  
  return getContextData();
}