"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type PackageTracking = {
  tracking_code: string;
  recipient_name: string;
  status: string;
  delivery_address: string;
  created_at: string;
  updated_at: string;
};

export default function Home() {
  const [trackingCode, setTrackingCode] = useState("");
  const [packageData, setPackageData] = useState<PackageTracking | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const searchPackage = async () => {
    if (!trackingCode.trim()) {
      setMessage("Por favor, introduce un código de seguimiento.");
      setPackageData(null);
      return;
    }

    setLoading(true);
    setMessage("");
    setPackageData(null);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "get_package_tracking",
        {
          p_tracking_code: trackingCode.trim(),
        }
      );

      if (error) {
        console.error(error);
        setMessage("Ocurrió un error al consultar el paquete.");
        return;
      }

      if (!data || data.length === 0) {
        setMessage(
          "No encontramos ningún paquete con ese código de seguimiento."
        );
        return;
      }

      setPackageData(data[0]);
    } catch (error) {
      console.error(error);
      setMessage("No fue posible realizar la consulta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navegación */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white">
              📦
            </div>

            <div>
              <h1 className="text-lg font-bold">EntregaYa</h1>
              <p className="text-xs text-slate-500">
                Gestión y seguimiento de entregas
              </p>
            </div>
          </div>

          <Link
  href="/login"
  className="rounded-xl border border-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
>
  Iniciar sesión
</Link>
        </div>
      </header>

      {/* Principal */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
              Gestión inteligente de envíos
            </div>

            <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Gestiona tus entregas de forma
              <span className="text-emerald-600">
                {" "}
                sencilla y segura.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Registra, consulta y realiza seguimiento de tus paquetes
              en un solo lugar, manteniendo la información organizada
              durante todo el proceso de entrega.
            </p>

            <div className="mt-8">
              <button
                onClick={() =>
                  document
                    .getElementById("tracking")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Consultar mi envío
              </button>
            </div>
          </div>

          {/* Seguimiento */}
          <div
            id="tracking"
            className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                🔎
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Seguimiento rápido
                </h3>
                <p className="text-sm text-slate-500">
                  Consulta el estado de tu paquete
                </p>
              </div>
            </div>

            <label
              htmlFor="tracking-code"
              className="mb-2 block text-sm font-medium"
            >
              Código de seguimiento
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="tracking-code"
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchPackage();
                  }
                }}
                placeholder="Ej. PKG-A1B2C3D4"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <button
                onClick={searchPackage}
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {/* Mensaje */}
            {message && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                {message}
              </div>
            )}

            {/* Resultado */}
            {packageData && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Código de seguimiento
                    </p>
                    <p className="font-bold text-slate-900">
                      {packageData.tracking_code}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    {packageData.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Destinatario:</strong>{" "}
                    {packageData.recipient_name}
                  </p>

                  <p>
                    <strong>Dirección:</strong>{" "}
                    {packageData.delivery_address}
                  </p>

                  <p>
                    <strong>Registrado:</strong>{" "}
                    {new Date(packageData.created_at).toLocaleString()}
                  </p>

                  <p>
                    <strong>Última actualización:</strong>{" "}
                    {new Date(packageData.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold">
              Todo el proceso en un solo lugar
            </h3>

            <p className="mt-2 text-slate-600">
              Controla la información de tus paquetes desde su registro
              hasta la entrega.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-6 transition hover:shadow-md">
              <div className="mb-4 text-3xl">📋</div>
              <h4 className="font-bold">Registro de paquetes</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registra la información necesaria de cada envío y genera
                su código de seguimiento.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 transition hover:shadow-md">
              <div className="mb-4 text-3xl">📍</div>
              <h4 className="font-bold">Seguimiento</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Consulta el estado del paquete y conoce en qué etapa
                del proceso se encuentra.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 transition hover:shadow-md">
              <div className="mb-4 text-3xl">📝</div>
              <h4 className="font-bold">Historial e incidencias</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Mantén un registro de los cambios de estado y de las
                incidencias relacionadas con cada envío.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
          © 2026 EntregaYa — Sistema de Gestión y Seguimiento de EnFtregas
        </div>
      </footer>
    </main>
  );
}