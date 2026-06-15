import { useEffect, useState } from "react";
import { mockMetadata } from "../data/edaSummary";
import { fetchModelMetadata } from "../lib/api";
import type { ModelMetadata } from "../types/metadata";

export function useModelMetadata() {
  const [metadata, setMetadata] = useState<ModelMetadata>(mockMetadata);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchModelMetadata()
      .then((nextMetadata) => {
        if (isMounted) setMetadata(nextMetadata);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    metadata,
    isLoading,
    isLive: metadata.metadata_source === "api",
  };
}
