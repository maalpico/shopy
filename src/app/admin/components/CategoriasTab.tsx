'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { TENANT_CONFIG } from '@/config/tenant';
import { generarSlug } from '@/utils/slugify';

interface CategoriaNodo {
  id: number;
  nombre: string;
  slug: string;
  padreId?: number | null;
  hijos?: CategoriaNodo[];
}

interface ActionState {
  error: string | null;
  exito: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-indigo-300 text-white font-semibold text-xs sm:text-sm py-2.5 px-5 rounded-xl transition-all shadow-sm cursor-pointer"
    >
      {pending ? 'Creando...' : 'Crear Categoría'}
    </button>
  );
}

// Renderizado recursivo del árbol N-Niveles
function RenderNodo({ nodo, nivel = 0 }: { nodo: CategoriaNodo; nivel?: number }) {
  return (
    <div className="space-y-1">
      <div
        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors"
        style={{ marginLeft: `${nivel * 20}px` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-mono">
            {nivel === 0 ? '📁' : nivel === 1 ? '↳ 📂' : '↳ 🏷️'}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-800">
            {nodo.nombre}
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
            /{nodo.slug}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">ID: #{nodo.id}</span>
      </div>

      {nodo.hijos && nodo.hijos.length > 0 && (
        <div className="space-y-1">
          {nodo.hijos.map((hijo) => (
            <RenderNodo key={hijo.id} nodo={hijo} nivel={nivel + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Aplanar el árbol para alimentar el selector de "Categoría Padre"
function aplanarCategorias(nodos: CategoriaNodo[], prefijo = ''): { id: number; etiqueta: string }[] {
  let lista: { id: number; etiqueta: string }[] = [];
  for (const nodo of nodos) {
    const etiqueta = prefijo ? `${prefijo} > ${nodo.nombre}` : nodo.nombre;
    lista.push({ id: nodo.id, etiqueta });
    if (nodo.hijos && nodo.hijos.length > 0) {
      lista = lista.concat(aplanarCategorias(nodo.hijos, etiqueta));
    }
  }
  return lista;
}

export default function CategoriasTab({
  token
}: {
  token: string;
}) {
  const [arbol, setArbol] = useState<CategoriaNodo[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [version, setVersion] = useState(0);

  // Carga asíncrona desacoplada con bandera de limpieza
  useEffect(() => {
    let activo = true;

    fetch(`${TENANT_CONFIG.apiUrl}/tiendas/${TENANT_CONFIG.slug}/categorias/arbol`)
      .then((res) => {
        if (!res.ok) throw new Error('Respuesta inválida');
        return res.json();
      })
      .then((datos: CategoriaNodo[]) => {
        if (activo) {
          setArbol(datos);
          setCargandoLista(false);
        }
      })
      .catch((err) => {
        console.error('Error al consultar categorías:', err);
        if (activo) {
          setCargandoLista(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [version]);

  const [estado, formAction] = useActionState(
    async (_previo: ActionState, formData: FormData): Promise<ActionState> => {
      const nombre = String(formData.get('nombre') || '').trim();
      const slugVal = generarSlug(nombre);
      const padreIdRaw = String(formData.get('padreId') || '');

      if (!nombre) {
        return { error: 'Nombre es requerido', exito: null };
      }

      try {
        const res = await fetch(`${TENANT_CONFIG.apiUrl}/tiendas/${TENANT_CONFIG.slug}/categorias`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            slugVal,
            padreId: padreIdRaw ? Number(padreIdRaw) : null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { error: data.error || 'Error al crear categoría', exito: null };
        }

        
        // Incrementa la versión para que el efecto recargue la lista limpiamente
        setVersion((v) => v + 1);
        return { error: null, exito: `Categoría "${data.nombre}" creada con éxito.` };
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : 'Error al conectar con la API',
          exito: null,
        };
      }
    },
    { error: null, exito: null }
  );

  const opcionesPadre = aplanarCategorias(arbol);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Formulario de Creación */}
      <div className="lg:col-span-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Nueva Categoría</h2>
          <p className="text-xs text-slate-500">
            Crea categorías raíz o asígnalas a un padre para formar subcategorías infinitas
          </p>
        </div>

        {estado.error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {estado.error}
          </div>
        )}

        {estado.exito && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
            {estado.exito}
          </div>
        )}

        <form action={formAction} className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Ej: Tenis Deportivos"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

       

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Categoría Padre (Opcional)
            </label>
            <select
              name="padreId"
              defaultValue=""
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Ninguna (Categoría Raíz / Nivel 1)</option>
              {opcionesPadre.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.etiqueta}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Selecciona una categoría existente para crear un subnivel
            </span>
          </div>

          <SubmitButton />
        </form>



      </div>

      {/* Vista del Árbol Jerárquico */}
      <div className="lg:col-span-7 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Estructura Jerárquica Actual</h2>
          <p className="text-xs text-slate-500">
            Visualización anidada en tiempo real de los niveles de tu catálogo
          </p>
        </div>

        {cargandoLista ? (
          <p className="text-xs text-slate-400">Cargando árbol jerárquico...</p>
        ) : arbol.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-xs text-slate-500">No hay categorías registradas aún.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-125 overflow-y-auto pr-2">
            {arbol.map((nodo) => (
              <RenderNodo key={nodo.id} nodo={nodo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}