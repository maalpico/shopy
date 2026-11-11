'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';

import CategoriasTab from './components/CategoriasTab';
import MarcasTab from './components/MarcasTab';
import ImagenesTab from './components/ImagenesTab';
import ProductosTab from './components/ProductosTab';
import { TENANT_CONFIG } from '@/config/tenant';

interface SesionUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  tenantId?: string | number;
  tienda?: string;
  esSuperAdmin?: boolean;
}

type TabType = 'productos' | 'categorias' | 'marcas' | 'imagenes';

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const sesionRaw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [tabActiva, setTabActiva] = useState<TabType>('productos');

  // Estado derivado puramente en el render: sin useState ni setState
  let usuario: SesionUsuario | null = null;
  if (sesionRaw) {
    try {
      usuario = JSON.parse(sesionRaw);
    } catch {
      usuario = null;
    }
  }

  const esAdminValido = Boolean(
    usuario && (usuario.rol === 'ADMIN' || usuario.rol === 'SUPERADMIN')
  );

  // El efecto SOLO realiza la acción externa (navegación), cero llamadas a setState
  useEffect(() => {
    // Si no hay snapshot del cliente aún, no redirigir
    const token = localStorage.getItem('token');
    const usuarioStorage = localStorage.getItem('usuario');

    if (!token || !usuarioStorage) {
      router.replace('/login');
      return;
    }

    try {
      const u: SesionUsuario = JSON.parse(usuarioStorage);
      if (u.rol !== 'ADMIN' && u.rol !== 'SUPERADMIN') {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    }
  }, [router]);

  // Si aún no se ha hidratado la sesión o no tiene permisos, mostramos la pantalla de espera
  if (!esAdminValido) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <p className="text-xs font-semibold text-slate-400">Verificando permisos...</p>
      </main>
    );
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const tenantSlug = TENANT_CONFIG.slug;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-100/60 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabecera del Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                {usuario?.rol || 'ADMIN'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Tenant: {usuario?.tienda || tenantSlug}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Administración de catálogo, jerarquías de categorías, marcas e inventario
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition-colors"
            >
              Ver Tienda Pública
            </Link>
          </div>
        </div>

        {/* Barra de Navegación por Pestañas */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setTabActiva('productos')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'productos'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            📦 Productos & Variantes
          </button>

          <button
            onClick={() => setTabActiva('categorias')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'categorias'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            📂 Categorías (N-Niveles)
          </button>

          <button
            onClick={() => setTabActiva('marcas')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'marcas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            🏷️ Marcas
          </button>

          <button
            onClick={() => setTabActiva('imagenes')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tabActiva === 'imagenes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            🖼️ Banco de Imágenes
          </button>
        </div>

        {/* Contenido Dinámico */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* {tabActiva === 'productos' && (
            <ProductosTab token={token} />
          )} */}

          {tabActiva === 'categorias' && (
            <CategoriasTab token={token} />
          )}

          {/* {tabActiva === 'marcas' && (
            <MarcasTab token={token} />
          )}

          {tabActiva === 'imagenes' && (
            <ImagenesTab token={token} />
          )} */}
        </div>
      </div>
    </main>
  );
}