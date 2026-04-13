import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

export function useAutocomplete(entityName, searchField) {
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (value) => {
    if (!value || value.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const results = await base44.entities[entityName].list(null, 50);
      const filtered = results
        .filter(item => 
          String(item[searchField] || "")
            .toLowerCase()
            .includes(value.toLowerCase())
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
  };
}