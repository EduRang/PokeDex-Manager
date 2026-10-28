import { useAuth } from "../hooks/useAuth";

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="rounded-2xl bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold text-slate-900">
        ¡Bienvenido, {user?.username}!
      </h1>
      <p className="mt-2 text-slate-600">
        Pronto podrás explorar Pokémon y gestionar tu colección desde aquí.
      </p>
    </section>
  );
}
