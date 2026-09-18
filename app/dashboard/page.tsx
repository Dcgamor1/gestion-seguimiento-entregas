"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();

const [userName, setUserName] = useState("Administrador");
const [loading, setLoading] = useState(true);

const [totalPackages, setTotalPackages] = useState(0);
const [inTransitPackages, setInTransitPackages] = useState(0);
const [deliveredPackages, setDeliveredPackages] = useState(0);
const [totalIncidents, setTotalIncidents] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: packages } = await supabase
  .from("packages")
  .select("status");

const { data: incidents } = await supabase
  .from("incidents")
  .select("id");

setTotalPackages(packages?.length || 0);

setInTransitPackages(
  packages?.filter((pkg) => pkg.status === "En tránsito").length || 0
);

setDeliveredPackages(
  packages?.filter((pkg) => pkg.status === "Entregado").length || 0
);

setTotalIncidents(incidents?.length || 0);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-2xl">
            📦
          </div>

          <p className="text-slate-600">
            Cargando EntregaYa...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* BARRA SUPERIOR */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-xl shadow-sm">
              📦
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                EntregaYa
              </h1>

              <p className="text-xs text-slate-500">
                Gestión y seguimiento de entregas
              </p>
            </div>
          </div>

          {/* USUARIO */}
          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {userName}
              </p>

              <p className="text-xs text-green-600">
                Administrador
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>


      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* BIENVENIDA */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold text-green-600">
            PANEL DE ADMINISTRACIÓN
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Bienvenido a EntregaYa
          </h2>

          <p className="mt-2 text-slate-600">
            Gestiona los paquetes, realiza seguimiento y controla las
            entregas desde un solo lugar.
          </p>
        </section>


        {/* TARJETAS DE RESUMEN */}
        <section className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
              📦
            </div>

            <p className="text-sm text-slate-500">
              Paquetes registrados
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {totalPackages}
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
              🚚
            </div>

            <p className="text-sm text-slate-500">
              En tránsito
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {inTransitPackages}
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl">
              ✅
            </div>

            <p className="text-sm text-slate-500">
              Entregados
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {deliveredPackages}
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl">
              ⚠️
            </div>

            <p className="text-sm text-slate-500">
              Incidencias
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {totalIncidents}
            </p>
          </div>

        </section>


        {/* ACCIONES PRINCIPALES */}
        <section className="mb-8">

          <h3 className="mb-4 text-xl font-bold text-slate-900">
            Gestión de entregas
          </h3>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* REGISTRAR */}
            <button
              onClick={() => router.push("/dashboard/paquetes/registrar")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                📝
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Registrar paquete
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registra un nuevo envío y genera automáticamente su
                código de seguimiento.
              </p>

              <p className="mt-4 text-sm font-semibold text-green-600">
                Registrar paquete →
              </p>
            </button>


            {/* PAQUETES */}
            <button
              onClick={() => router.push("/dashboard/paquetes")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                📋
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Ver paquetes
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Consulta los paquetes registrados y revisa su estado
                actual.
              </p>

              <p className="mt-4 text-sm font-semibold text-blue-600">
                Ver paquetes →
              </p>
            </button>


            {/* SEGUIMIENTO */}
            <button
             onClick={() => router.push("/dashboard/seguimiento")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-purple-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                🔎
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Consultar seguimiento
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Consulta el estado de cualquier paquete mediante su
                código de seguimiento.
              </p>

              <p className="mt-4 text-sm font-semibold text-purple-600">
                Consultar paquete →
              </p>
            </button>


            {/* HISTORIAL */}
            <button
              onClick={() => router.push("/dashboard/historial")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                🕒
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Historial
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Revisa los cambios de estado realizados durante el
                proceso de entrega.
              </p>

              <p className="mt-4 text-sm font-semibold text-orange-600">
                Ver historial →
              </p>
            </button>


            {/* INCIDENCIAS */}
            <button
              onClick={() => router.push("/dashboard/incidencias")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-red-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl">
                ⚠️
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Incidencias
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registra y consulta problemas relacionados con los
                paquetes.
              </p>

              <p className="mt-4 text-sm font-semibold text-red-600">
                Gestionar incidencias →
              </p>
            </button>


            {/* ENTREGAS */}
            <button
              onClick={() => router.push("/dashboard/entregas")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
                🚚
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Entregas
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Gestiona las asignaciones y registra las entregas
                realizadas.
              </p>

              <p className="mt-4 text-sm font-semibold text-cyan-600">
                Gestionar entregas →
              </p>
            </button>

          </div>
        </section>


        {/* PAQUETE DE PRUEBA */}
        <section className="rounded-2xl border border-green-200 bg-green-50 p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-semibold text-green-700">
                PAQUETE DE PRUEBA
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-900">
                PKG-22E40846
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Este paquete ya está registrado en Supabase y puede
                utilizarse para comprobar el seguimiento.
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/seguimiento")}
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Ver seguimiento
            </button>

          </div>

        </section>

      </div>


      {/* PIE DE PÁGINA */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center">

        <div className="mb-2 flex items-center justify-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-sm">
            📦
          </div>

          <span className="font-bold text-slate-900">
            EntregaYa
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Sistema de Gestión y Seguimiento de Entregas
        </p>

        <p className="mt-1 text-xs text-slate-400">
          © 2026 EntregaYa
        </p>

      </footer>

    </main>
  );
}