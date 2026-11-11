'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';

interface SesionUsuario {
  nombre: string;
  email: string;
  rol: string;
  tienda?: string;
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): string | null {
  return localStorage.getItem('usuario');
}

function getServerSnapshot(): null {
  return null;
}

export default function Header() {
  const router = useRouter();
  const sesionRaw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let usuario: SesionUsuario | null = null;
  if (sesionRaw) {
    try {
      usuario = JSON.parse(sesionRaw);
    } catch {
      usuario = null;
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.dispatchEvent(new Event('storage'));
    router.push('/login');
  };

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logotipo / Marca */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg group-hover:scale-105 transition-transform">
              T
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 leading-tight">
                TiendaStore
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Multi-Tenant
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              Catálogo
            </Link>
            <Link href="/ofertas" className="hover:text-indigo-600 transition-colors">
              Ofertas
            </Link>
          </nav>
        </div>

        {/* Acciones y Autenticación */}
        <div className="flex items-center gap-3">
          {usuario ? (
            <div className="flex items-center gap-3">
              {(usuario.rol === 'ADMIN' || usuario.rol === 'SUPERADMIN') && (
                <Link
                  href="/admin"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  Panel Admin
                </Link>
              )}

              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-none">{usuario.nombre}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{usuario.rol}</p>
              </div>

              <button
                onClick={cerrarSesion}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                className="text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}