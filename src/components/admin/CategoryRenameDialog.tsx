"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from "@mui/material";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RenameFormValues {
  name: string;
}

interface CategoryRenameDialogProps {
  currentName: string | null;
  existingCategories: string[];
  onClose: () => void;
  onRenamed: () => void;
}

export default function CategoryRenameDialog({
  currentName,
  existingCategories,
  onClose,
  onRenamed,
}: CategoryRenameDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RenameFormValues>({ defaultValues: { name: "" } });

  useEffect(() => {
    if (currentName) reset({ name: currentName });
  }, [currentName, reset]);

  async function onSubmit(values: RenameFormValues) {
    const newName = values.name.trim();
    if (!currentName) return;

    if (newName === currentName) {
      onClose();
      return;
    }
    if (existingCategories.includes(newName)) {
      setError("name", { message: "Ya existe una categoría con ese nombre" });
      return;
    }

    try {
      const q = query(collection(db, "productos"), where("categoria", "==", currentName));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => batch.update(docSnap.ref, { categoria: newName }));
      await batch.commit();
      onRenamed();
      onClose();
    } catch {
      setError("name", { message: "Hubo un error al renombrar la categoría" });
    }
  }

  return (
    <Dialog open={!!currentName} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Renombrar categoría</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {errors.name && <Alert severity="error" sx={{ mb: 2 }}>{errors.name.message}</Alert>}
          <TextField
            label="Nombre de la categoría"
            fullWidth
            autoFocus
            {...register("name", { required: "El nombre es obligatorio" })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}