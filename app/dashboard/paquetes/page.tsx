"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Package = {
  id: string;
  tracking_code: string;
  sender_name: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_address: string;
  description: string;
  status: string;
  created_at: string;
};

const statusOptions = [
  "Registrado",
  "En preparación",
  "Preparado",
  "Despachado",
  "En tránsito",
  "Entregado",
  "Incidencia",
];

export default function PaquetesPage() {
  const router = useRouter();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("packages")
          .select(
            "id, tracking_code, sender_name, recipient_name, recipient_phone, delivery_address, description, status, created_at"
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          setMessage("No fue posible cargar los paquetes.");
          return;
        }

        setPackages(data || []);
      } catch (error) {
        console.error(error);
        setMessage("Ocurrió un error al consultar los paquetes.");
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [router]);

  const updateStatus = async (packageId: string, newStatus: string) => {
    setUpdatingId(packageId);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("packages")
        .update({
          status: newStatus,
        })
        .eq("id", packageId);

      if (error) {
        console.error(error);
        setMessage("No fue posible actualizar el estado.");
        return;
      }

      setPackages((currentPackages) =>
        currentPackages.map((pkg) =>
          pkg.id === packageId
            ? { ...pkg, status: newStatus }
            : pkg
        )
      );

      setMessage("Estado actualizado correctamente.");
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error al actualizar el estado.");
    } finally {
      setUpdatingId(null);
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

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="mb-2 text-sm font-semibold text-green-600">
              GESTIÓN DE ENTREGAS
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Paquetes registrados
            </h2>

            <p className="mt-2 text-slate-600">
              Consulta los envíos y actualiza su estado.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/registrar")}
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            + Registrar paquete
          </button>

        </div>


        {/* MENSAJE */}
        {message && (
          <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}


        {/* CARGANDO */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">
              Cargando paquetes...
            </p>
          </div>
        )}


        {/* SIN PAQUETES */}
        {!loading && packages.length === 0 && !message && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📦
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              No hay paquetes registrados
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Registra el primer paquete para comenzar.
            </p>

          </div>
        )}


        {/* TABLA */}
        {!loading && packages.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Código
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Remitente
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Destinatario
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Dirección
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Fecha
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {packages.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* CÓDIGO */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-green-700">
                          {pkg.tracking_code}
                        </span>
                      </td>


                      {/* REMITENTE */}
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {pkg.sender_name}
                      </td>


                      {/* DESTINATARIO */}
                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-slate-900">
                          {pkg.recipient_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {pkg.recipient_phone}
                        </p>

                      </td>


                      {/* DIRECCIÓN */}
                      <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                        {pkg.delivery_address}
                      </td>


                      {/* ESTADO */}
                      <td className="px-5 py-4">

                        <div className="flex flex-col gap-2">

                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              pkg.status
                            )}`}
                          >
                            {pkg.status}
                          </span>

                          <select
                            value={pkg.status}
                            disabled={updatingId === pkg.id}
                            onChange={(event) =>
                              updateStatus(
                                pkg.id,
                                event.target.value
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          {updatingId === pkg.id && (
                            <span className="text-xs text-slate-500">
                              Actualizando...
                            </span>
                          )}

                        </div>

                      </td>


                      {/* FECHA */}
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(pkg.created_at).toLocaleDateString(
                          "es-VE"
                        )}
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