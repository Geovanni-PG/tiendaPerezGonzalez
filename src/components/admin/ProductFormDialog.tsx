"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subirImagen, subirVariasImagenes } from "@/lib/cloudinary";
import { Producto } from "@/types/Product";

const NEW_CATEGORY_OPTION = "__new__";

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  originalPrice: number | "";
  costPrice: number;
  category: string;
  quantity: number;
  badge: string;
  featured: boolean;
  details: string;
}

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  existingProduct?: Producto;
  existingCategories: string[];
}

export default function ProductFormDialog({
  open,
  onClose,
  existingProduct,
  existingCategories,
}: ProductFormDialogProps) {
  const isEditing = !!existingProduct;

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      originalPrice: "",
      costPrice: 0,
      category: "",
      quantity: 0,
      badge: "",
      featured: false,
      details: "",
    },
  });

  // Estos NO son campos de formulario tradicionales (imágenes, categoría nueva) — se quedan como useState
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [mainImageUrl, setMainImageUrl] = useState("");
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>([]);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (existingProduct) {
      reset({
        name: existingProduct.nombre,
        description: existingProduct.descripcion,
        price: existingProduct.precio,
        originalPrice: existingProduct.precioOriginal ?? "",
        costPrice: existingProduct.costPrice ?? 0,
        category: existingProduct.categoria,
        quantity: existingProduct.cantidadDisponible,
        badge: existingProduct.insignia ?? "",
        featured: existingProduct.destacado,
        details: (existingProduct.detalles ?? []).join("\n"),
      });
      setSelectedCategory(existingProduct.categoria);
      setMainImageUrl(existingProduct.imagenPrincipal);
      setAdditionalImageUrls(existingProduct.imagenesAdicionales ?? []);
    } else {
      reset();
      setSelectedCategory("");
      setMainImageUrl("");
      setAdditionalImageUrls([]);
    }

    setIsCreatingCategory(false);
    setNewCategoryInput("");
    setLocalCategories([]);
    setImageError("");
    setSubmitError("");
  }, [open, existingProduct, reset]);

  const allCategories = Array.from(new Set([...existingCategories, ...localCategories]));

  function handleCategoryChange(value: string) {
    if (value === NEW_CATEGORY_OPTION) {
      setIsCreatingCategory(true);
      return;
    }
    setSelectedCategory(value);
  }

  function confirmNewCategory() {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;

    setLocalCategories((prev) => Array.from(new Set([...prev, trimmed])));
    setSelectedCategory(trimmed);
    setIsCreatingCategory(false);
    setNewCategoryInput("");
  }

  async function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMain(true);
    setImageError("");
    try {
      const url = await subirImagen(file);
      setMainImageUrl(url);
    } catch {
      setImageError("Error al subir la imagen principal");
    } finally {
      setUploadingMain(false);
    }
  }

  async function handleAdditionalImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploadingAdditional(true);
    setImageError("");
    try {
      const urls = await subirVariasImagenes(files);
      setAdditionalImageUrls((prev) => [...prev, ...urls]);
    } catch {
      setImageError("Error al subir las imágenes adicionales");
    } finally {
      setUploadingAdditional(false);
    }
  }

  function removeAdditionalImage(url: string) {
    setAdditionalImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function onSubmit(values: ProductFormValues) {
    setSubmitError("");

    if (!mainImageUrl) {
      setImageError("Debes subir una imagen principal");
      return;
    }
    if (!selectedCategory) {
      setSubmitError("Debes seleccionar o crear una categoría");
      return;
    }
    setImageError("");

    const productData = {
      nombre: values.name.trim(),
      descripcion: values.description.trim(),
      precio: Number(values.price),
      precioOriginal: values.originalPrice === "" ? null : Number(values.originalPrice),
      costPrice: Number(values.costPrice),
      categoria: selectedCategory,
      cantidadDisponible: Number(values.quantity),
      insignia: values.badge || null,
      destacado: values.featured,
      imagenPrincipal: mainImageUrl,
      imagenesAdicionales: additionalImageUrls,
      detalles: values.details
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    };

    try {
      if (isEditing && existingProduct) {
        await updateDoc(doc(db, "productos", existingProduct.id), productData);
      } else {
        await addDoc(collection(db, "productos"), {
          ...productData,
          fechaCreacion: new Date().toISOString(),
        });
      }
      onClose();
    } catch {
      setSubmitError("Hubo un error al guardar el producto");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="body">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {isEditing ? "Editar producto" : "Agregar producto"}
        <IconButton onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        {imageError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {imageError}
          </Alert>
        )}

        <Box
          component="form"
          id="product-form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            label="Nombre del producto"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name", { required: "El nombre es obligatorio" })}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Precio de compra"
              type="number"
              fullWidth
              error={!!errors.costPrice}
              helperText={errors.costPrice?.message}
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
              {...register("costPrice", {
                required: "Requerido",
                valueAsNumber: true,
                min: { value: 0, message: "No puede ser negativo" },
              })}
            />
            <TextField
              label="Precio de venta"
              type="number"
              fullWidth
              error={!!errors.price}
              helperText={errors.price?.message}
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
              {...register("price", {
                required: "Requerido",
                valueAsNumber: true,
                validate: (value, formValues) =>
                  value > formValues.costPrice || "Debe ser mayor al precio de compra",
              })}
            />
          </Stack>

          <TextField
            label="Precio original (opcional, si está en oferta)"
            type="number"
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            {...register("originalPrice", { valueAsNumber: false })}
          />

          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            {...register("description", { required: "La descripción es obligatoria" })}
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Categoría
            </Typography>
            <Select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>
                Selecciona una categoría
              </MenuItem>
              {allCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
              <Divider />
              <MenuItem value={NEW_CATEGORY_OPTION} sx={{ fontWeight: 700, color: "primary.main" }}>
                + Nueva categoría
              </MenuItem>
            </Select>

            {isCreatingCategory && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                  placeholder="Nombre de la nueva categoría"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  size="small"
                  fullWidth
                  autoFocus
                />
                <Button variant="contained" onClick={confirmNewCategory}>
                  Agregar
                </Button>
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Cantidad disponible"
              type="number"
              fullWidth
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              slotProps={{ htmlInput: { min: 0, step: "1" } }}
              {...register("quantity", {
                required: "Requerido",
                valueAsNumber: true,
                min: { value: 0, message: "No puede ser negativo" },
              })}
            />

            <Box sx={{ width: "100%" }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Insignia
              </Typography>
              <Select defaultValue="" displayEmpty fullWidth {...register("badge")}>
                <MenuItem value="">Ninguna</MenuItem>
                <MenuItem value="Nuevo">Nuevo</MenuItem>
                <MenuItem value="Oferta">Oferta</MenuItem>
                <MenuItem value="Popular">Popular</MenuItem>
              </Select>
            </Box>
          </Stack>

          <FormControlLabel
            control={<Switch defaultChecked={false} {...register("featured")} />}
            label="Mostrar en la página de inicio (destacado)"
          />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Imagen principal
            </Typography>

            {mainImageUrl && (
              <Box sx={{ position: "relative", width: 120, height: 120, borderRadius: 2, overflow: "hidden", mb: 1 }}>
                <Image src={mainImageUrl} alt="Imagen principal" fill style={{ objectFit: "cover" }} />
              </Box>
            )}

            <Button
              component="label"
              variant="outlined"
              startIcon={uploadingMain ? <CircularProgress size={18} /> : <CloudUploadIcon />}
              disabled={uploadingMain}
            >
              {mainImageUrl ? "Cambiar imagen" : "Subir imagen"}
              <input type="file" accept="image/*" hidden onChange={handleMainImageChange} />
            </Button>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Imágenes adicionales (opcional)
            </Typography>

            {additionalImageUrls.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                {additionalImageUrls.map((url) => (
                  <Box key={url} sx={{ position: "relative", width: 72, height: 72, borderRadius: 2, overflow: "hidden" }}>
                    <Image src={url} alt="Imagen adicional" fill style={{ objectFit: "cover" }} />
                    <IconButton
                      size="small"
                      onClick={() => removeAdditionalImage(url)}
                      sx={{ position: "absolute", top: 2, right: 2, bgcolor: "background.paper", "&:hover": { bgcolor: "background.paper" } }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

            <Button
              component="label"
              variant="outlined"
              startIcon={uploadingAdditional ? <CircularProgress size={18} /> : <CloudUploadIcon />}
              disabled={uploadingAdditional}
            >
              Agregar imágenes
              <input type="file" accept="image/*" hidden multiple onChange={handleAdditionalImagesChange} />
            </Button>
          </Box>

          <TextField
            label="Detalles / especificaciones"
            fullWidth
            multiline
            rows={4}
            helperText="Uno por línea, ej: Material: Algodón"
            {...register("details")}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="product-form" variant="contained" disabled={isSubmitting || uploadingMain || uploadingAdditional}>
          {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar producto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}