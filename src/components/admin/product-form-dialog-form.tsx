"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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


const OPCION_NUEVA_CATEGORIA = "__nueva__";


export default function ProductFormDialogForm({manejarSubmit, nombre, setNombre, precio, setPrecio, precioOriginal, setPrecioOriginal, categoria, manejarCambioCategoria, todasLasCategorias, modoNuevaCategoria, nuevaCategoriaInput, setNuevaCategoriaInput, confirmarNuevaCategoria, cantidadDisponible, setCantidadDisponible, insignia, setInsignia, destacado, setDestacado, imagenPrincipalUrl, manejarImagenPrincipal, subiendoPrincipal, imagenesAdicionalesUrls, manejarImagenesAdicionales, subiendoAdicionales, quitarImagenAdicional, descripcion, setDescripcion, detalles, setDetalles}: any) {
    return (
        <Box
                  component="form"
                  id="form-producto"
                  onSubmit={manejarSubmit}
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <TextField
                    label="Nombre del producto"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    fullWidth
                  />
        
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Precio"
                      type="number"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      onWheel={(e) => (e.target as HTMLElement).blur()}
                      required
                      fullWidth
                      slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                    />
                    <TextField
                      label="Precio original (opcional)"
                      type="number"
                      value={precioOriginal}
                      onChange={(e) => setPrecioOriginal(e.target.value)}
                      onWheel={(e) => (e.target as HTMLElement).blur()}
                      fullWidth
                      helperText="Si el producto está en oferta"
                      slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                    />
                  </Stack>
        
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Categoría
                    </Typography>
                    <Select
                      value={categoria}
                      onChange={(e) => manejarCambioCategoria(e.target.value)}
                      displayEmpty
                      fullWidth
                    >
                      <MenuItem value="" disabled>
                        Selecciona una categoría
                      </MenuItem>
                      {todasLasCategorias.map(({cat}: {cat: any}) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                      <Divider />
                      <MenuItem value={OPCION_NUEVA_CATEGORIA} sx={{ fontWeight: 700, color: "primary.main" }}>
                        + Nueva categoría
                      </MenuItem>
                    </Select>
        
                    {modoNuevaCategoria && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <TextField
                          placeholder="Nombre de la nueva categoría"
                          value={nuevaCategoriaInput}
                          onChange={(e) => setNuevaCategoriaInput(e.target.value)}
                          size="small"
                          fullWidth
                          autoFocus
                        />
                        <Button variant="contained" onClick={confirmarNuevaCategoria}>
                          Agregar
                        </Button>
                      </Stack>
                    )}
                  </Box>
        
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Cantidad disponible"
                      type="number"
                      value={cantidadDisponible}
                      onChange={(e) => setCantidadDisponible(e.target.value)}
                      onWheel={(e) => (e.target as HTMLElement).blur()}
                      required
                      fullWidth
                      slotProps={{ htmlInput: { min: 0, step: "1" } }}
                    />
                    <Box sx={{ width: "100%" }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Insignia
                      </Typography>
                      <Select
                        value={insignia}
                        onChange={(e) => setInsignia(e.target.value)}
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="">Ninguna</MenuItem>
                        <MenuItem value="Nuevo">Nuevo</MenuItem>
                        <MenuItem value="Oferta">Oferta</MenuItem>
                        <MenuItem value="Popular">Popular</MenuItem>
                      </Select>
                    </Box>
                  </Stack>
        
                  <FormControlLabel
                    control={
                      <Switch checked={destacado} onChange={(e) => setDestacado(e.target.checked)} />
                    }
                    label="Mostrar en la página de inicio (destacado)"
                  />
        
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Imagen principal
                    </Typography>
        
                    {imagenPrincipalUrl && (
                      <Box
                        sx={{
                          position: "relative",
                          width: 120,
                          height: 120,
                          borderRadius: 2,
                          overflow: "hidden",
                          mb: 1,
                        }}
                      >
                        <Image
                          src={imagenPrincipalUrl}
                          alt="Imagen principal"
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </Box>
                    )}
        
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={
                        subiendoPrincipal ? <CircularProgress size={18} /> : <CloudUploadIcon />
                      }
                      disabled={subiendoPrincipal}
                    >
                      {imagenPrincipalUrl ? "Cambiar imagen" : "Subir imagen"}
                      <input type="file" accept="image/*" hidden onChange={manejarImagenPrincipal} />
                    </Button>
                  </Box>
        
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Imágenes adicionales (opcional)
                    </Typography>
        
                    {imagenesAdicionalesUrls.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                        {imagenesAdicionalesUrls.map((url: string) => (
                          <Box
                            key={url}
                            sx={{
                              position: "relative",
                              width: 72,
                              height: 72,
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <Image src={url} alt="Imagen adicional" fill style={{ objectFit: "cover" }} />
                            <IconButton
                              size="small"
                              onClick={() => quitarImagenAdicional(url)}
                              sx={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                bgcolor: "background.paper",
                                "&:hover": { bgcolor: "background.paper" },
                              }}
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
                      startIcon={
                        subiendoAdicionales ? <CircularProgress size={18} /> : <CloudUploadIcon />
                      }
                      disabled={subiendoAdicionales}
                    >
                      Agregar imágenes
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        multiple
                        onChange={manejarImagenesAdicionales}
                      />
                    </Button>
                  </Box>
        
                  <TextField
                    label="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    fullWidth
                    multiline
                    rows={3}
                  />
        
                  <TextField
                    label="Detalles / especificaciones"
                    value={detalles}
                    onChange={(e) => setDetalles(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    helperText="Uno por línea, ej: Material: Algodón"
                  />
                </Box>
    )
}