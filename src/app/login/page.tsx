'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TENANT_CONFIG } from '@/config/tenant';

interface EstadoAccion {
  error: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-indigo-300 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
    >
      {pending ? 'Iniciando sesión...' : 'Entrar'}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);

  const [estado, formAction] = useActionState(
    async (_previo: EstadoAccion, formData: FormData): Promise<EstadoAccion> => {
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');
      //const tenantSlug = String(formData.get('tenantSlug') || '').trim().toLowerCase();

      try {
        const payload: { email: string; password: string; tenantSlug?: string } = {
          email,
          password,
        };

        if (!esSuperAdmin) {
          payload.tenantSlug = TENANT_CONFIG.slug;
        }

        const res = await fetch(`${TENANT_CONFIG.apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          return { error: data.error || 'Credenciales inválidas' };
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.dispatchEvent(new Event('storage'));

        if (data.usuario.rol === 'SUPERADMIN' || data.usuario.rol === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }

        return { error: null };
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : 'Error al conectar con el servidor',
        };
      }
    },
    { error: null }
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ingresa a tu cuenta para gestionar compras o administrar la tienda
          </p>
        </div>

        {estado.error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-2xl mb-5">
            {estado.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-700">Acceso Plataforma Global</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={esSuperAdmin}
                onChange={(e) => setEsSuperAdmin(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div> */}

          {/* {!esSuperAdmin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Tienda (Slug)
              </label>
              <input
                type="text"
                name="tenantSlug"
                required
                defaultValue="sportwear-mx"
                placeholder="ej: sportwear-mx"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )} */}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="tu@correo.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <SubmitButton />
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          ¿No tienes una cuenta?{' '}
          <Link href="/registro" className="font-semibold text-indigo-600 hover:underline">
            Crea tu cuenta aquí
          </Link>
        </p>
      </div>
    </main>
  );
}