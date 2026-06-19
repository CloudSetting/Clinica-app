"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function BotonCerrarSesion() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 px-4 py-2 rounded-xl transition-all active:scale-95 bg-white"
    >
      <LogOut size={14} /> Cerrar Sesión
    </button>
  );
}