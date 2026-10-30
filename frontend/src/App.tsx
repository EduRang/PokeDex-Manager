import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./context/AuthProvider";
import { ErrorToast } from "./components/ErrorToast";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { PokemonListPage } from "./pages/PokemonListPage";
import { PokemonDetailPage } from "./pages/PokemonDetailPage";
import { CollectionPage } from "./pages/CollectionPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

// ScrollRestoration solo funciona con un "data router" (createBrowserRouter)
function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<PokemonListPage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
          <Route path="/collection" element={<CollectionPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ),
);

// Sin animación de entrada/salida si el sistema pide reducir movimiento
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      {/* Avisos de error abajo en el centro: como mucho 3 a la vez y sin
          repetir el mismo mensaje si ya está visible */}
      <SnackbarProvider
        Components={{ error: ErrorToast }}
        maxSnack={3}
        preventDuplicate
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transitionDuration={reduceMotion ? { enter: 0, exit: 0 } : undefined}
      />
    </AuthProvider>
  );
}

export default App;
