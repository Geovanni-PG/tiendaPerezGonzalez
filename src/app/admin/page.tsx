"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useProducts } from "@/hooks/useProducts";
import { Producto } from "@/types/Product";
import TablePagination from "@mui/material/TablePagination";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ProductDetailDialog from "@/components/admin/ProductDetailDialog";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import Skeleton from "@mui/material/Skeleton";
import CategoryIcon from "@mui/icons-material/Category";


export default function AdminDashboard() {
  const { productos, cargando } = useProducts();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewingProduct, setViewingProduct] = useState<Producto | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | undefined>(undefined);

  const categorias = ["Todos", ...Array.from(new Set(productos.map((p) => p.categoria)))];

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaSeleccionada === "Todos" || producto.categoria === categoriaSeleccionada;
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const paginatedProducts = productosFiltrados.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage);

  function abrirModalNuevo() {
    setProductoEditando(undefined);
    setModalAbierto(true);
  }

  function abrirModalEditar(producto: Producto) {
    setProductoEditando(producto);
    setModalAbierto(true);
  }

  async function confirmarEliminacion() {
    if (!productoAEliminar) return;
    setEliminando(true);
    setError("");
    try {
      await deleteDoc(doc(db, "productos", productoAEliminar.id));
      setProductoAEliminar(null);
    } catch {
      setError("Hubo un error al eliminar el producto");
    } finally {
      setEliminando(false);
    }
  }

  const colorInsignia: Record<string, "success" | "secondary" | "info"> = {
    Nuevo: "success",
    Oferta: "secondary",
    Popular: "info",
  };

  if (cargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Productos
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {productos.length} productos en catálogo · {categorias.length - 1} categorías activas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          placeholder="Buscar producto por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {categorias.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirModalNuevo}
          sx={{ whiteSpace: "nowrap" }}
        >
          Agregar producto
        </Button>
      </Box>

      {productosFiltrados.length === 0 ? (
        <Typography color="text.secondary">
          {productos.length === 0
            ? 'Todavía no hay productos. Usa el botón "Agregar producto" para crear el primero.'
            : "No se encontraron productos con esos filtros."}
        </Typography>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Insignia</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {cargando
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 1 }} /></TableCell>
                    <TableCell><Skeleton width="70%" /></TableCell>
                    <TableCell><Skeleton width="50%" /></TableCell>
                    <TableCell><Skeleton width="40%" /></TableCell>
                    <TableCell><Skeleton width="30%" /></TableCell>
                    <TableCell><Skeleton width="50%" /></TableCell>
                    <TableCell align="right"><Skeleton width="60%" sx={{ ml: "auto" }} /></TableCell>
                  </TableRow>
                ))
              : paginatedProducts.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          position: "relative",
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={producto.imagenPrincipal}
                          alt={producto.nombre}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </Box>
                      <Typography variant="body2">{producto.nombre}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{producto.categoria}</TableCell>
                  <TableCell>
                    ${producto.precio.toFixed(2)}
                    {producto.precioOriginal && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ textDecoration: "line-through", ml: 1 }}
                      >
                        ${producto.precioOriginal.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{producto.cantidadDisponible}</TableCell>
                  <TableCell>
                    {producto.insignia && (
                      <Chip
                        label={producto.insignia}
                        size="small"
                        color={colorInsignia[producto.insignia] ?? "default"}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => setViewingProduct(producto)} aria-label="Ver detalle">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => abrirModalEditar(producto)} aria-label="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setProductoAEliminar(producto)}
                      aria-label="Eliminar"
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={productosFiltrados.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Productos por página"
          />
        </Box>
      )}
      
      <ProductDetailDialog product={viewingProduct} onClose={() => setViewingProduct(null)} />

      <ProductFormDialog
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        existingProduct={productoEditando}
        existingCategories={Array.from(new Set(productos.map((p) => p.categoria)))}
      />

      <Dialog open={!!productoAEliminar} onClose={() => setProductoAEliminar(null)}>
        <DialogTitle>¿Eliminar producto?</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción eliminará permanentemente &quot;{productoAEliminar?.nombre}&quot; del
            catálogo. No se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductoAEliminar(null)}>Cancelar</Button>
          <Button
            onClick={confirmarEliminacion}
            color="error"
            variant="contained"
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}