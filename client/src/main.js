import './styles/globals.css';

const API_URL = 'http://localhost:3001/productos';

const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const inventoryList = document.getElementById('inventory-list');
const btnCancel = document.getElementById('btn-cancel');
const inputNombre = document.getElementById('nombre');
const inputPrecio = document.getElementById('precio');
const inputStock = document.getElementById('stock');
const inputDescripcion = document.getElementById('descripcion');
const searchInput = document.getElementById('search-input');
const btnSearch = document.getElementById('btn-search');
const statTotal = document.getElementById('stat-total');
const statValue = document.getElementById('stat-value');
const statLow = document.getElementById('stat-low');

const modalConfirmacion = document.getElementById('modal-confirmacion');
const btnModalConfirmar = document.getElementById('modal-confirmar');
const btnModalCancelar = document.getElementById('modal-cancelar');

let productosCache = [];

let editingProductId = null;
let idProductoAEliminar = null;

async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error en la API:', error);
    alert('Error en la solicitud. Verifique que el servidor esté corriendo.');
    throw error;
  }
}

function limpiarFormulario() {
  productForm.reset();
  editingProductId = null;
  formTitle.textContent = 'Detalles del Producto';
  productForm.querySelector('button[type="submit"]').textContent = 'Guardar Producto';
}

function validarFormulario() {
  if (!inputNombre.value.trim()) return alert('El nombre del producto es requerido') || false;
  if (!inputPrecio.value || parseFloat(inputPrecio.value) <= 0) return alert('El precio debe ser mayor a 0') || false;
  if (!inputStock.value || parseInt(inputStock.value) < 0) return alert('El stock no puede ser negativo') || false;
  if (!inputDescripcion.value.trim()) return alert('La descripción es requerida') || false;
  return true;
}

function obtenerDatosFormulario() {
  return {
    nombre: inputNombre.value.trim(),
    precio: parseFloat(inputPrecio.value),
    stock: parseInt(inputStock.value),
    descripcion: inputDescripcion.value.trim()
  };
}

function formatearPesos(monto) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(monto).replace(/[$\s]/g, '') + ' COP';
}

function calcularEstadisticas(productos) {
  const totalSKU = productos.length;
  const valorTotal = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  const stockCritico = productos.filter(p => p.stock < 5).length;

  statTotal.textContent = totalSKU;
  statValue.textContent = formatearPesos(valorTotal);
  statLow.textContent = stockCritico;
}

function renderProductos(productos) {
  inventoryList.innerHTML = '';
  if (productos.length === 0) {
    inventoryList.innerHTML = `
      <tr>
        <td colspan="4" class="px-8 py-6 text-center text-slate-500 italic">No se encontraron productos que coincidan con la búsqueda.</td>
      </tr>
    `;
    calcularEstadisticas([]);
    return;
  }

  productos.forEach(producto => {
    inventoryList.innerHTML += crearFilaProducto(producto);
  });
  calcularEstadisticas(productos);
}

function aplicarBusqueda() {
  const termino = searchInput.value.trim().toLowerCase();
  if (!termino) {
    renderProductos(productosCache);
    return;
  }

  const productosFiltrados = productosCache.filter(producto => {
    return producto.nombre.toLowerCase().includes(termino)
      || producto.descripcion.toLowerCase().includes(termino);
  });

  renderProductos(productosFiltrados);
}

function crearFilaProducto(producto) {
  let colorStock;

  if (producto.stock <= 5) {
    colorStock = 'bg-rose-50 text-rose-600 border-rose-100';
  } else if (producto.stock <= 10) {
    colorStock = 'bg-yellow-50 text-yellow-600 border-yellow-100';
  } else {
    colorStock = 'bg-emerald-50 text-emerald-600 border-emerald-100';
  }

  return `
    <tr class="hover:bg-slate-50/30 transition-colors group">
      <td class="px-8 py-6">
        <div class="flex flex-col">
          <span class="font-bold text-slate-900">${producto.nombre}</span>
          <span class="text-xs text-slate-400 mt-1">${producto.descripcion}</span>
        </div>
      </td>
      <td class="px-8 py-6 text-center">
        <span class="px-4 py-1.5 ${colorStock} rounded-xl text-[10px] font-black uppercase tracking-tight border">
          ${producto.stock} unidades
        </span>
      </td>
      <td class="px-8 py-6 text-center font-bold text-slate-900">
        ${formatearPesos(producto.precio)}
      </td>
      <td class="px-8 py-6 text-right">
        <button class="btn-editar" data-id="${producto.id}" style="cursor: pointer; background: none; border: none; font-size: 18px;">✏️</button>
        <button class="btn-eliminar" data-id="${producto.id}" style="cursor: pointer; background: none; border: none; font-size: 18px;">🗑️</button>
      </td>
    </tr>
  `;
}

async function obtenerProductos() {
  try {
    const productos = await fetchAPI(API_URL);
    productosCache = productos;
    renderProductos(productosCache);
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
}

async function crearProducto(datos) {
  try {
    const productosActuales = await fetchAPI(API_URL);

    // Calcular el siguiente ID numérico
    const ids = productosActuales.map(p => {
      let id = p.id;
      if (typeof id === 'string') {
        id = parseInt(id);
      }
      return !isNaN(id) ? id : 0;
    });

    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const nuevoId = maxId + 1;

    datos.id = nuevoId;

    console.log('Creando producto con ID:', datos.id, 'tipo:', typeof datos.id);

    await fetchAPI(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    limpiarFormulario();
    await obtenerProductos();
    alert('Producto creado exitosamente');
  } catch (error) {
    console.error('Error al crear producto:', error);
  }
}

async function actualizarProducto(id, datos) {
  try {
    await fetchAPI(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    limpiarFormulario();
    await obtenerProductos();
    alert('Producto actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar producto:', error);
  }
}

async function eliminarProducto(id) {
  idProductoAEliminar = id;
  modalConfirmacion.classList.remove('hidden');
}

async function cargarProductoParaEditar(id) {
  try {
    const producto = await fetchAPI(`${API_URL}/${id}`);
    inputNombre.value = producto.nombre;
    inputPrecio.value = producto.precio;
    inputStock.value = producto.stock;
    inputDescripcion.value = producto.descripcion;
    editingProductId = id;
    formTitle.textContent = 'Editar Producto';
    productForm.querySelector('button[type="submit"]').textContent = 'Actualizar Producto';
    inputNombre.focus();
  } catch (error) {
    console.error('Error al cargar producto:', error);
  }
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validarFormulario()) return;
  const datos = obtenerDatosFormulario();
  editingProductId ? await actualizarProducto(editingProductId, datos) : await crearProducto(datos);
});

btnCancel.addEventListener('click', limpiarFormulario);
btnSearch.addEventListener('click', (e) => {
  e.preventDefault();
  aplicarBusqueda();
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    aplicarBusqueda();
  }
});

searchInput.addEventListener('input', () => {
  if (!searchInput.value.trim()) {
    renderProductos(productosCache);
  }
});

document.addEventListener('click', (e) => {
  const btnEditar = e.target.closest('.btn-editar');
  const btnEliminar = e.target.closest('.btn-eliminar');

  if (btnEditar) {
    e.preventDefault();
    cargarProductoParaEditar(btnEditar.dataset.id);
  }

  if (btnEliminar) {
    e.preventDefault();
    eliminarProducto(btnEliminar.dataset.id);
  }
});


btnModalConfirmar.addEventListener('click', async () => {
  if (idProductoAEliminar) {
    try {
      const url = `${API_URL}/${idProductoAEliminar}`;
      const response = await fetch(url, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      modalConfirmacion.classList.add('hidden');
      idProductoAEliminar = null;
      await obtenerProductos();
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar: ' + error.message);
      modalConfirmacion.classList.add('hidden');
    }
  }
});

btnModalCancelar.addEventListener('click', () => {
  modalConfirmacion.classList.add('hidden');
  idProductoAEliminar = null;
});

obtenerProductos();

