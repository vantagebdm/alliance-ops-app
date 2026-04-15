import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

export function useAutocomplete(entityName, searchField, extraSearchFields = []) {
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (value, showAll = false) => {
    if (!showAll && (!value || value.length < 1)) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const results = await base44.entities[entityName].list(null, 100);
      const allFields = [searchField, ...extraSearchFields];
      const filtered = showAll && !value
        ? results.slice(0, 20)
        : results
            .filter(item =>
              allFields.some(field =>
                String(item[field] || "").toLowerCase().includes(value.toLowerCase())
              )
            )
            .slice(0, 10);
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } catch (e) {
      setSuggestions([]);
    }
    setLoading(false);
  };

  const handleInputChange = (value) => {
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleShowAll = () => {
    fetchSuggestions(query, true);
  };

  const handleSelectSuggestion = (item) => {
    setQuery(item[searchField]);
    setSuggestions([]);
    setOpen(false);
    return item[searchField];
  };

  return {
    query,
    setQuery,
    suggestions,
    open,
    setOpen,
    loading,
    handleInputChange,
    handleSelectSuggestion,
    handleShowAll,
  };
}