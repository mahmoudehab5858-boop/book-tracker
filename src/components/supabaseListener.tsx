"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SupabaseListener() {
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login"); // redirect if user logs out or session is gone
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
