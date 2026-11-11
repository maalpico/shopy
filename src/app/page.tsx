import Link from 'next/link';
import { Producto } from '@/types';
import { TENANT_CONFIG } from '@/config/tenant';
// Slug predeterminado para pruebas (ej. el tenant creado en el backend)
const TENANT_SLUG = 'mftzone';
export const dynamic = 'force-dynamic';

async function obtenerProductos(): Promise<Producto[]> {
  try {
    const res = await fetch(`${TENANT_CONFIG.apiUrl}/tiendas/${TENANT_CONFIG.slug}/productos`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error al consultar productos:', error);
    return []; // Retorna un arreglo vacío para que la página no rompa si el backend tarda en despertar
  }
}

// async function obtenerProductos(): Promise<Producto[]> {
//   try {
//     const res = await fetch(`${TENANT_CONFIG.apiUrl}/tiendas/${TENANT_CONFIG.slug}/productos`, {
//       cache: 'no-store',
//     });

//     if (!res.ok) return [];
//     return await res.json();
//   } catch (error) {
//     console.error('Error al consultar productos:', error);
//     return [];
//   }
// }

export default async function HomePage() {
  const productos = await obtenerProductos();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Portada / Banner de cabecera */}
      <section className="bg-linear-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 mb-10 text-white shadow-sm flex flex-col justify-center">
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
          Tienda Oficial: {TENANT_SLUG}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Novedades y Productos Destacados
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
          Explora nuestra selección directa desde la base de datos de la tienda con variantes de tallas y colores.
        </p>
      </section>

      {/* Grid del Catálogo */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Catálogo Completo</h2>
        <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
          {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {productos.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
          <p className="text-slate-600 font-semibold">No hay productos disponibles por el momento.</p>
          <p className="text-slate-400 text-sm mt-1">
            Los productos creados para el tenant <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{TENANT_SLUG}</code> aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((prod) => {
            const varianteBase = prod.variantes[0];
            const imagenPrincipal = varianteBase?.imagenes?.[0]?.imagen?.url || null;
            const tieneDescuento = Boolean(varianteBase?.precioPromocional && Number(varianteBase.precioPromocional) > 0);

            return (
              <article
                key={prod.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Contenedor de Imagen */}
                  <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {imagenPrincipal ? (
                      <img
                        src={imagenPrincipal}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        Sin Imagen
                      </div>
                    )}

                    {tieneDescuento && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">
                        Oferta
                      </span>
                    )}
                  </div>

                  {/* Datos del producto */}
                  <div className="p-5">
                    {prod.marca && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                        {prod.marca.nombre}
                      </span>
                    )}

                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      <Link href={`/productos/${prod.slug}`}>
                        {prod.nombre}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {prod.descripcionCorta || 'Sin descripción corta.'}
                    </p>
                  </div>
                </div>

                {/* Precios y Botón */}
                <div className="p-5 pt-0">
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div>
                      {tieneDescuento ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 line-through">
                            ${Number(varianteBase.precio).toFixed(2)}
                          </span>
                          <span className="text-lg font-black text-rose-600">
                            ${Number(varianteBase.precioPromocional).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-black text-slate-900">
                          {varianteBase ? `$${Number(varianteBase.precio).toFixed(2)}` : 'N/D'}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/productos/${prod.slug}`}
                      className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
                    >
                      Ver Detalle
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}