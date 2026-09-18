"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TrackingRecord = {
  tracking_code: string;
  recipient_name: string;
  current_status: string;
  delivery_address: string;
  history_status: string | null;
  notes: string | null;
  history_created_at: string | null;
};

export default function SeguimientoPage() {
  const router = useRouter();

  const [trackingCode, setTrackingCode] = useState("");
  const [tracking, setTracking] = useState<TrackingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchTracking = async () => {
    const code = trackingCode.trim();

    if (!code) {
      setError("Ingresa un código de seguimiento.");
      setTracking([]);
      return;
    }

    setLoading(true);
    setError("");
    setTracking([]);

    try {
      const supabase = createClient();

      const { data, error: rpcError } = await supabase.rpc(
        "get_package_tracking_history",
        {
          p_tracking_code: code,
        }
      );

      if (rpcError) {
        console.error(rpcError);
        setError("No fue posible consultar el seguimiento.");
        return;
      }

      if (!data || data.length === 0) {
        setError(
          "No encontramos ningún paquete con ese código de seguimiento."
        );
        return;
      }

      setTracking(data);
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al consultar el seguimiento.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Registrado":
        return "bg-slate-100 text-slate-700";
      case "En preparación":
        return "bg-yellow-100 text-yellow-700";
      case "Preparado":
        return "bg-blue-100 text-blue-700";
      case "Despachado":
        return "bg-purple-100 text-purple-700";
      case "En tránsito":
        return "bg-cyan-100 text-cyan-700";
      case "Entregado":
        return "bg-green-100 text-green-700";
      case "Incidencia":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("es-VE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const packageInfo = tracking[0];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-xl">
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

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Volver al panel
          </button>
        </div>
      </header>

      {/* Contenido */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
          CONTROL DE PROCESOS
        </p>

        <h2 className="mt-2 text-4xl font-bold text-slate-900">
          Seguimiento de paquete
        </h2>

        <p className="mt-2 text-slate-600">
          Consulta el estado actual y el historial de movimientos de un
          paquete.
        </p>

        {/* Buscador */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Código de seguimiento
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchTracking();
                }
              }}
              placeholder="Ej. PKG-BFFAB46A"
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />

            <button
              onClick={searchTracking}
              disabled={loading}
              className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Consultando..." : "Consultar seguimiento"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Resultado */}
        {packageInfo && (
          <div className="mt-8 space-y-6">
            {/* Información del paquete */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Código
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-700">
                    {packageInfo.tracking_code}
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    Destinatario
                  </p>

                  <p className="font-semibold text-slate-800">
                    {packageInfo.recipient_name}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                    Estado actual
                  </p>

                  <span
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(
                      packageInfo.current_status
                    )}`}
                  >
                    {packageInfo.current_status}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Dirección de entrega
                </p>

                <p className="mt-1 text-slate-700">
                  {packageInfo.delivery_address}
                </p>
              </div>
            </div>

            {/* Historial */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">
                Historial de movimientos
              </h3>

              <div className="mt-6 space-y-5">
                {tracking.map((item, index) => (
                  <div
                    key={`${item.history_created_at}-${index}`}
                    className="relative flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${getStatusClass(
                          item.history_status || ""
                        )}`}
                      >
                        ✓
                      </div>

                      {index < tracking.length - 1 && (
                        <div className="mt-2 h-full min-h-8 w-px bg-slate-200" />
                      )}
                    </div>

                    <div className="pb-4">
                      <p className="font-semibold text-slate-900">
                        {item.history_status || "Sin estado"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(item.history_created_at)}
                      </p>

                      {item.notes && (
                        <p className="mt-2 text-sm text-slate-600">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white py-8">
        <div className="text-center">
          <p className="font-semibold text-slate-800">📦 EntregaYa</p>
          <p className="mt-1 text-sm text-slate-500">
            Sistema de Gestión y Seguimiento de Entregas
          </p>
        </div>
      </footer>
    </main>
  );
}