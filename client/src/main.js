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
const statTotal = document.getElementById('stat-total');
const statValue = document.getElementById('stat-value');
const statLow = document.getElementById('stat-low');

let editingProductId = null;

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

function crearFilaProducto(producto) {
  const esStockBajo = producto.stock < 5;
  const colorStock = esStockBajo ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100';
  
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
    inventoryList.innerHTML = '';
    productos.forEach(producto => {
      inventoryList.innerHTML += crearFilaProducto(producto);
    });
    calcularEstadisticas(productos);
    agregarEventosAcciones();
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
}

async function crearProducto(datos) {
  try {
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
  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
  try {
    await fetchAPI(`${API_URL}/${id}`, { method: 'DELETE' });
    await obtenerProductos();
    alert('Producto eliminado exitosamente');
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
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

function agregarEventosAcciones() {
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => cargarProductoParaEditar(btn.dataset.id));
  });
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => eliminarProducto(btn.dataset.id));
  });
}

obtenerProductos();