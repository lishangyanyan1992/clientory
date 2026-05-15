import { useState, useEffect } from "react";

interface AdminStatus {
  isAdmin: boolean;
  loading: boolean;
}

export function useAdminStatus(emailToken: string | null): AdminStatus {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!emailToken) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch("/api/auth/me", {
      headers: { "x-email-token": emailToken },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { isAdmin?: boolean } | null) => {
        if (!cancelled) setIsAdmin(data?.isAdmin === true);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [emailToken]);

  return { isAdmin, loading };
}
