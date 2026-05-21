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
const paginationLabel = document.getElementById('pagination-label');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const statTotal = document.getElementById('stat-total');
const statValue = document.getElementById('stat-value');
const statLow = document.getElementById('stat-low');

const modalConfirmacion = document.getElementById('modal-confirmacion');
const btnModalConfirmar = document.getElementById('modal-confirmar');
const btnModalCancelar = document.getElementById('modal-cancelar');

let productosCache = [];
let filteredProducts = [];
let currentPage = 1;
const PAGE_SIZE = 3;

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
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
  }).format(monto);
}

function calcularEstadisticas(productos) {
  const totalSKU = productos.length;
  const valorTotal = productos.reduce((sum, p) => {
    const precio = Number(p.precio) || 0;
    const stock = Number(p.stock) || 0;
    return sum + (precio * stock);
  }, 0);
  const stockCritico = productos.filter(p => Number(p.stock) <= 5).length;

  statTotal.textContent = totalSKU;
  statValue.textContent = formatearPesos(valorTotal);
  statLow.textContent = stockCritico;
}

function actualizarPaginacion(totalProductos, inicio, fin, totalPaginas) {
  const mostrarInicio = totalProductos === 0 ? 0 : inicio;
  paginationLabel.textContent = `Mostrando ${mostrarInicio} a ${fin} de ${totalProductos} productos`;
  btnPrev.disabled = currentPage <= 1;
  btnNext.disabled = currentPage >= totalPaginas;
  btnPrev.classList.toggle('cursor-not-allowed', btnPrev.disabled);
  btnNext.classList.toggle('cursor-not-allowed', btnNext.disabled);
}

function renderProductos(productos) {
  const totalProductos = productos.length;
  const totalPaginas = Math.max(1, Math.ceil(totalProductos / PAGE_SIZE));
  if (currentPage > totalPaginas) currentPage = totalPaginas;

  const inicioIndice = (currentPage - 1) * PAGE_SIZE;
  const finIndice = Math.min(inicioIndice + PAGE_SIZE, totalProductos);
  const productosPagina = productos.slice(inicioIndice, finIndice);

  inventoryList.innerHTML = '';
  if (productosPagina.length === 0) {
    inventoryList.innerHTML = `
      <tr>
        <td colspan="4" class="px-8 py-6 text-center text-slate-500 italic">No se encontraron productos que coincidan con la búsqueda.</td>
      </tr>
    `;
  } else {
    productosPagina.forEach(producto => {
      inventoryList.innerHTML += crearFilaProducto(producto);
    });
  }

  calcularEstadisticas(productos);
  actualizarPaginacion(totalProductos, inicioIndice + 1, finIndice, totalPaginas);
}

function aplicarBusqueda() {
  const termino = searchInput.value.trim().toLowerCase();
  currentPage = 1;

  filteredProducts = productosCache.filter(producto => {
    return producto.nombre.toLowerCase().includes(termino)
      || producto.descripcion.toLowerCase().includes(termino);
  });

  if (!termino) {
    filteredProducts = [...productosCache];
  }

  renderProductos(filteredProducts);
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
        <div class="inline-flex items-center justify-end gap-2">
          <button type="button" class="w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 btn-editar" data-id="${producto.id}" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button type="button" class="w-10 h-10 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 btn-eliminar" data-id="${producto.id}" title="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function obtenerProductos() {
  try {
    const productos = await fetchAPI(API_URL);
    productosCache = productos;
    filteredProducts = [...productosCache];
    currentPage = 1;
    renderProductos(filteredProducts);
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
    aplicarBusqueda();
  }
});

btnPrev.addEventListener('click', (e) => {
  e.preventDefault();
  if (currentPage > 1) {
    currentPage -= 1;
    renderProductos(filteredProducts);
  }
});

btnNext.addEventListener('click', (e) => {
  e.preventDefault();
  const totalPaginas = Math.ceil(filteredProducts.length / PAGE_SIZE);
  if (currentPage < totalPaginas) {
    currentPage += 1;
    renderProductos(filteredProducts);
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

