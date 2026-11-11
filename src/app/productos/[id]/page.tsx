import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function obtenerProducto(id: string): Promise<Producto | null> {
  try {
    const res = await fetch(`http://localhost:4000/api/productos/${id}`, {
      cache: 'no-store',
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Fallo al obtener el producto');

    return await res.json();
  } catch (error) {
    console.error('Error al consultar el producto:', error);
    return null;
  }
}

export default async function DetalleProductoPage({ params }: PageProps) {
  const { id } = await params;
  const producto = await obtenerProducto(id);

  if (!producto) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Botón de Regresar */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
        >
          ← Volver al catálogo
        </Link>

        {/* Tarjeta de Detalle */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
            <div>
              <span className="text-xs font-mono uppercase bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                ID: #{producto.id}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
                {producto.nombre}
              </h1>
            </div>
            <div className="text-left sm:text-right">
              <span className="block text-xs uppercase text-slate-400 font-semibold tracking-wider">
                Precio
              </span>
              <span className="text-3xl font-black text-emerald-600">
                ${producto.precio.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Descripción del Producto
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              {producto.descripcion || 'Sin descripción detallada disponible para este producto.'}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-sm">
              Agregar al carrito
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-3 px-6 rounded-xl transition-all">
              Guardar en favoritos
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}