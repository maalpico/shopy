'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EstadoRegistro {
  error: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-indigo-300 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer mt-2"
    >
      {pending ? 'Creando cuenta...' : 'Registrarme'}
    </button>
  );
}

export default function RegistroPage() {
  const router = useRouter();

  const [estado, formAction] = useActionState(
    async (_previo: EstadoRegistro, formData: FormData): Promise<EstadoRegistro> => {
      const nombre = String(formData.get('nombre') || '').trim();
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const telefono = String(formData.get('telefono') || '').trim();
      const password = String(formData.get('password') || '');
      const confirmPassword = String(formData.get('confirmPassword') || '');
      const tenantSlug = String(formData.get('tenantSlug') || '').trim().toLowerCase();

      if (password !== confirmPassword) {
        return { error: 'Las contraseñas no coinciden' };
      }

      if (password.length < 6) {
        return { error: 'La contraseña debe tener al menos 6 caracteres' };
      }

      try {
        const res = await fetch('http://localhost:4000/api/auth/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            email,
            telefono: telefono || undefined,
            password,
            tenantSlug,
            rol: 'CLIENTE',
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { error: data.error || 'Error al completar el registro' };
        }

        router.push('/login');
        return { error: null };
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : 'Error de conexión con el servidor',
        };
      }
    },
    { error: null }
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Crear Cuenta</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Regístrate para guardar tu carrito, compras y direcciones
          </p>
        </div>

        {estado.error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-3.5 rounded-2xl mb-5">
            {estado.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Tienda (Slug)
            </label>
            <input
              type="text"
              name="tenantSlug"
              required
              defaultValue="sportwear-mx"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Ej: Ana Morales"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="ana@correo.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Teléfono (Opcional)
              </label>
              <input
                type="tel"
                name="telefono"
                placeholder="+52 662 000 0000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Repite la contraseña"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <SubmitButton />
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </main>
  );
}