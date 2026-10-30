import { enqueueSnackbar } from "notistack";

// Errores de acciones (iniciar sesión, registrarse, capturar, liberar) que no
// tienen un sitio fijo en la pantalla, como no poder conectar con el servidor.
// Los errores de carga (con "Reintentar") y los de formulario se muestran en
// su lugar, junto a lo que afectan
export function showErrorToast(message: string) {
  enqueueSnackbar(message, { variant: "error" });
}
