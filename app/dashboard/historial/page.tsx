"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type HistoryRecord = {
  id: string;
  package_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  tracking_code?: string;
  recipient_name?: string;
};

type PackageRecord = {
  id: string;
  tracking_code: string;
  recipient_name: string;
};

export default function HistorialPage() {
  const router = useRouter();

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: packagesData, error: packagesError } =
          await supabase
            .from("packages")
            .select("id, tracking_code, recipient_name");

        if (packagesError) {
          console.error(packagesError);
          setError("No fue posible cargar los paquetes.");
          return;
        }

        const { data: historyData, error: historyError } =
          await supabase
            .from("package_history")
            .select(
              "id, package_id, status, notes, created_at"
            )
            .order("created_at", { ascending: false });

        if (historyError) {
          console.error(historyError);
          setError("No fue posible cargar el historial.");
          return;
        }

        const packageMap = new Map(
          (packagesData || []).map(
            (pkg: PackageRecord) => [pkg.id, pkg]
          )
        );

        const completeHistory = (historyData || []).map(
          (item) => {
            const pkg = packageMap.get(item.package_id);

            return {
              ...item,
              tracking_code: pkg?.tracking_code,
              recipient_name: pkg?.recipient_name,
            };
          }
        );

        setHistory(completeHistory);
      } catch (error) {
        console.error(error);
        setError("Ocurrió un error al cargar el historial.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [router]);

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

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ENCABEZADO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-xl">
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
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            ← Volver al panel
          </button>

        </div>
      </header>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-8">

          <p className="mb-2 text-sm font-semibold text-orange-600">
            CONTROL DE PROCESOS
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Historial
          </h2>

          <p className="mt-2 text-slate-600">
            Consulta los cambios de estado realizados en los paquetes.
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* CARGANDO */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">
              Cargando historial...
            </p>
          </div>
        )}

        {/* SIN HISTORIAL */}
        {!loading && history.length === 0 && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🕒
            </div>

            <h3 className="font-bold text-slate-900">
              No hay registros en el historial
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Los cambios de estado aparecerán aquí.
            </p>

          </div>
        )}

        {/* TABLA */}
        {!loading && history.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Código
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Destinatario
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Observación
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Fecha
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {history.map((item) => (

                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">
                        <span className="font-bold text-green-700">
                          {item.tracking_code || "Sin código"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {item.recipient_name || "No disponible"}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td className="max-w-md px-5 py-4 text-sm text-slate-600">
                        {item.notes || "Sin observaciones"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(
                          item.created_at
                        ).toLocaleString("es-VE", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

      {/* PIE */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center">

        <div className="flex items-center justify-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-sm">
            📦
          </div>

          <span className="font-bold text-slate-900">
            EntregaYa
          </span>

        </div>

        <p className="mt-2 text-xs text-slate-500">
          Sistema de Gestión y Seguimiento de Entregas
        </p>

      </footer>

    </main>
  );
}