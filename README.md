# StockMaster - Gestión de Inventario 🚀

**StockMaster** es una aplicación premium de gestión de inventarios con una interfaz moderna y totalmente funcional. Ofrece CRUD completo para productos con características como:

✅ Crear, leer, actualizar y eliminar productos  
✅ Gestión de stock con indicadores de nivel crítico  
✅ Estadísticas en tiempo real del inventario  
✅ Interfaz moderna con Tailwind CSS  
✅ IDs secuenciales automáticos  
✅ Modal de confirmación para eliminar productos  

---

## 📂 Estructura del Proyecto

```
Inventario-Stock/
├── api/                          # Backend (API REST con json-server)
│   ├── db.json                   # Base de datos (productos)
│   ├── package.json
│   └── INSTRUCCIONES_BACKEND.txt
├── client/                       # Frontend (Aplicación web)
│   ├── index.html
│   ├── src/
│   │   ├── main.js              # Lógica principal
│   │   └── styles/
│   │       └── globals.css      # Estilos con Tailwind
│   ├── package.json
│   └── vite.config.ts
├── LICENSE
└── README.md
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|----------|
| **HTML5** | Estructura semántica |
| **JavaScript ES6+** | Lógica de la aplicación |
| **Tailwind CSS** | Estilos modernos |
| **Vite** | Herramienta de construcción rápida |
| **json-server** | Servidor API simulado |

---

## 📋 Requisitos Previos

- **Node.js** (v16 o superior)
- **npm** (incluido con Node.js)

Verifica que tengas instalados:
```bash
node --version
npm --version
```

---

## 🚀 Instalación y Ejecución

### 1️⃣ Clonar o descargar el proyecto

```bash
cd Inventario-Stock
```

### 2️⃣ Instalar dependencias del API

```bash
cd api
npm install
```

### 3️⃣ Instalar dependencias del Cliente

```bash
cd ../client
npm install
```

---

## ▶️ Iniciar la Aplicación

### Terminal 1 - Inicia el Servidor API (Puerto 3001)

```bash
cd api
npm run server
```

Verás algo como:
```
  ⌛  Preparing...

  ▌ ░░░░░░░░░░░░░░░░░░ (still preparing...)
  ⌛  Preparing...

  ✓ Cleaned up

  ✓ Routes

  ✓ Render core
  ✓ Static files
  ✓ Other middlewares
  ✓ Routes

  🌐 JSON Server is running
  📢 Listening at http://localhost:3001

  📁 Resources
  http://localhost:3001/productos

  🔗 Home
  http://localhost:3001
```

### Terminal 2 - Inicia el Cliente (Puerto 5173)

```bash
cd client
npm run dev
```

Verás:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 3️⃣ Abre tu navegador

Ve a **`http://localhost:5173`** y ¡comienza a usar StockMaster!

---

## 📱 Funcionalidades

### ➕ Crear Producto
1. Completa el formulario en la parte izquierda
2. Presiona "Guardar Producto"
3. El ID se genera automáticamente

### ✏️ Editar Producto
1. Haz clic en el botón ✏️ en la tabla
2. El formulario se cargará con los datos
3. Modifica lo que necesites
4. Presiona "Actualizar Producto"

### 🗑️ Eliminar Producto
1. Haz clic en el botón 🗑️ en la tabla
2. Confirma en el modal que aparece
3. El producto se eliminará de inmediato

### 📊 Estadísticas
La parte superior muestra:
- **Total SKU**: Cantidad de productos
- **Valor Inventario**: Suma total del inventario
- **Stock Crítico**: Productos con menos de 5 unidades

---

## 🛑 Detener la Aplicación

- En cada terminal, presiona `Ctrl + C`

---

## 🐛 Solución de Problemas

### "Cannot GET /productos"
✅ Asegúrate de que el API esté corriendo en `http://localhost:3001`

### "Connection refused" o errores de red
✅ Verifica que ambos servidores estén activos en las terminales

### Los cambios no se guardan
✅ Revisa que `db.json` en la carpeta `/api` tenga permisos de escritura

### Estilos no se cargan
✅ Recarga la página con `Ctrl+Shift+R` (limpia caché)

---

## 📝 Estructura de Datos (db.json)

```json
{
  "productos": [
    {
      "id": 1,
      "nombre": "Laptop ASUS",
      "precio": 3200000,
      "stock": 6,
      "descripcion": "Laptop gamer Ryzen 7"
    },
    {
      "id": 2,
      "nombre": "Memoria Ram DDR5",
      "precio": 1250000,
      "stock": 12,
      "descripcion": "Memoria RAM DDR5 16GB"
    }
  ]
}
```

**Campos obligatorios:**
- `id`: Número único (se genera automáticamente)
- `nombre`: Nombre del producto
- `precio`: Precio en COP
- `stock`: Cantidad disponible
- `descripcion`: Descripción del producto

---

## 🎨 Características de la Interfaz

- **Modal de Confirmación**: Aparece al eliminar productos
- **Indicadores de Stock**: 
  - 🔴 Rojo: Stock < 5 (Crítico)
  - 🟡 Amarillo: Stock < 10 (Bajo)
  - 🟢 Verde: Stock ≥ 10 (Normal)
- **Actualizaciones en Tiempo Real**: Todo se actualiza sin recargar
- **Responsive**: Funciona en desktop y móvil

---

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

---

## 💡 Tips

- Los IDs se generan automáticamente en secuencia
- Los precios se formatean automáticamente a pesos colombianos
- Todos los campos son requeridos para crear un producto
- El stock no puede ser negativo
- El precio debe ser mayor a 0

---

¡Que disfrutes usando **StockMaster**! 🎉
