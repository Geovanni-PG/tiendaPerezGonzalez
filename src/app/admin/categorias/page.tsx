"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  IconButton,
  Select,
  MenuItem,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useProducts } from "@/hooks/useProducts";
import CategoryRenameDialog from "@/components/admin/CategoryRenameDialog";

export default function CategoriesPage() {
  const { productos } = useProducts();

  const categories = Array.from(new Set(productos.map((p) => p.categoria))).sort();
  const productCountByCategory = (name: string) => productos.filter((p) => p.categoria === name).length;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const paginatedCategories = categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function openDeleteDialog(name: string) {
    setDeletingCategory(name);
    const others = categories.filter((c) => c !== name);
    setMoveTarget(others[0] ?? "");
    setDeleteError("");
  }

  async function confirmDelete() {
    if (!deletingCategory || !moveTarget) return;

    setDeleting(true);
    setDeleteError("");
    try {
      const q = query(collection(db, "productos"), where("categoria", "==", deletingCategory));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => batch.update(docSnap.ref, { categoria: moveTarget }));
      await batch.commit();
      setDeletingCategory(null);
    } catch {
      setDeleteError("Hubo un error al eliminar la categoría");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Categorías
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {categories.length} categoría(s) registradas
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell align="right">Productos</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedCategories.map((name) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell align="right">{productCountByCategory(name)}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => setRenamingCategory(name)} aria-label="Renombrar">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => openDeleteDialog(name)}
                  disabled={categories.length <= 1}
                  aria-label="Eliminar"
                >
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={categories.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Categorías por página"
      />

      <CategoryRenameDialog
        currentName={renamingCategory}
        existingCategories={categories}
        onClose={() => setRenamingCategory(null)}
        onRenamed={() => {}}
      />

      <Dialog open={!!deletingCategory} onClose={() => setDeletingCategory(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar categoría &quot;{deletingCategory}&quot;</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <Typography sx={{ mb: 2 }}>
            Elige a qué categoría se moverán los productos de esta categoría:
          </Typography>
          <Select value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)} fullWidth>
            {categories.filter((c) => c !== deletingCategory).map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingCategory(null)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}