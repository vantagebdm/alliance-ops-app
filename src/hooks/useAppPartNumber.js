import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useAppPartNumber() {
  const [appNumber, setAppNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async (category) => {
    if (!category) {
      setAppNumber("");
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("generateAppPartNumber", { category });
      if (res.data.success) {
        setAppNumber(res.data.app_part_number);
      } else {
        setError(res.data.error || "Failed to generate number");
        setAppNumber("");
      }
    } catch (err) {
      setError(err.message || "Error generating part number");
      setAppNumber("");
    } finally {
      setLoading(false);
    }
  }, []);

  const validateOverride = useCallback(async (override) => {
    if (!override) {
      setError("Part number cannot be empty");
      return false;
    }
    if (!override.startsWith("APP-")) {
      setError("Part number must start with APP- prefix");
      return false;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke("generateAppPartNumber", { app_part_number_override: override });
      if (res.data.success) {
        setAppNumber(override);
        setError("");
        return true;
      } else {
        setError(res.data.error || "Failed to validate override");
        return false;
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("APP internal part number already exists");
      } else {
        setError(err.message || "Error validating override");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    appNumber,
    setAppNumber,
    error,
    setError,
    loading,
    generate,
    validateOverride
  };
}