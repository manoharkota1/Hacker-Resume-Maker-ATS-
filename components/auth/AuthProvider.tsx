"use client";

import { ReactNode } from "react";
import { AuthContext, useAuthState } from "@/lib/appwrite/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}
