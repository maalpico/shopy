export interface Imagen {
  id: number;
  url: string;
  textoAlternativo?: string | null;
}

export interface ProductoVarianteImagen {
  id: number;
  esPrincipal: boolean;
  imagen: Imagen;
}

export interface ProductoVariante {
  id: number;
  sku: string;
  precio: number;
  precioPromocional?: number | null;
  stock: number;
  atributos: Record<string, string>;
  imagenes?: ProductoVarianteImagen[];
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

export interface Marca {
  id: number;
  nombre: string;
  slug: string;
}

export interface Producto {
  id: number;
  nombre: string;
  slug: string;
  descripcionCorta?: string | null;
  categoria?: Categoria | null;
  marca?: Marca | null;
  variantes: ProductoVariante[];
}