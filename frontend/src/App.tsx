import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { PokemonListPage } from "./pages/PokemonListPage";
import { PokemonDetailPage } from "./pages/PokemonDetailPage";
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
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>,
  ),
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
