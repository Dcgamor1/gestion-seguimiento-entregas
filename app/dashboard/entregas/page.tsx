"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PackageRecord = {
  id: string;
  tracking_code: string;
  recipient_name: string;
};

type Delivery = {
  id: string;
  package_id: string;
  result: string;
  recipient_name: string;
  observations: string | null;
  delivered_at: string;
  delivered_by: string;
  tracking_code?: string;
};

const deliveryResults = [
  "Entregado",
  "No entregado",
  "Reprogramado",
];

export default function EntregasPage() {
  const router = useRouter();

  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  const [selectedPackage, setSelectedPackage] = useState("");
  const [result, setResult] = useState("Entregado");
  const [observations, setObservations] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
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
            .select("id, tracking_code, recipient_name")
            .order("created_at", { ascending: false });

        if (packagesError) {
          console.error(packagesError);
          setError("No fue posible cargar los paquetes.");
          return;
        }

        setPackages(packagesData || []);

        const { data: deliveriesData, error: deliveriesError } =
          await supabase
            .from("deliveries")
            .select(
              "id, package_id, result, recipient_name, observations, delivered_at, delivered_by"
            )
            .order("delivered_at", { ascending: false });

        if (deliveriesError) {
          console.error(deliveriesError);
          setError("No fue posible cargar las entregas.");
          return;
        }

        const packageMap = new Map(
          (packagesData || []).map((pkg) => [pkg.id, pkg])
        );

        const completeDeliveries = (deliveriesData || []).map(
          (delivery) => {
            const pkg = packageMap.get(delivery.package_id);

            return {
              ...delivery,
              tracking_code: pkg?.tracking_code,
            };
          }
        );

        setDeliveries(completeDeliveries);
      } catch (error) {
        console.error(error);
        setError("Ocurrió un error al cargar la información.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedPackage) {
      setError("Selecciona un paquete.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const selectedPkg = packages.find(
        (pkg) => pkg.id === selectedPackage
      );

      if (!selectedPkg) {
        setError("No fue posible encontrar el paquete seleccionado.");
        return;
      }

      const { data, error: insertError } = await supabase
        .from("deliveries")
        .insert({
          package_id: selectedPackage,
          result,
          recipient_name: selectedPkg.recipient_name,
          observations: observations.trim() || null,
          delivered_by: user.id,
        })
        .select(
          "id, package_id, result, recipient_name, observations, delivered_at, delivered_by"
        )
        .single();

      if (insertError) {
        console.error(insertError);
        setError("No fue posible registrar la entrega.");
        return;
      }

if (result === "Entregado") {
  const { error: packageUpdateError } = await supabase
    .from("packages")
    .update({
      status: "Entregado",
    })
    .eq("id", selectedPackage);

  if (packageUpdateError) {
    console.error(packageUpdateError);
    setError(
      "La entrega se registró, pero no fue posible actualizar el estado del paquete."
    );
    return;
  }
}

      const newDelivery: Delivery = {
        ...data,
        tracking_code: selectedPkg.tracking_code,
      };

      setDeliveries((current) => [
        newDelivery,
        ...current,
      ]);

      setSelectedPackage("");
      setResult("Entregado");
      setObservations("");

      setMessage("Entrega registrada correctamente.");
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al registrar la entrega.");
    } finally {
      setSaving(false);
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
      <div className="mx-auto max-w-6xl px-6 py-8">

        <div className="mb-8">

          <p className="mb-2 text-sm font-semibold text-green-600">
            GESTIÓN DE ENTREGAS
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Entregas
          </h2>

          <p className="mt-2 text-slate-600">
            Registra el resultado de la entrega de cada paquete.
          </p>

        </div>

        {/* FORMULARIO */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="mb-6">

            <h3 className="text-xl font-bold text-slate-900">
              Registrar entrega
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Selecciona el paquete e indica el resultado.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* PAQUETE */}
            <div>

              <label
                htmlFor="package"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Paquete
              </label>

              <select
                id="package"
                value={selectedPackage}
                onChange={(event) =>
                  setSelectedPackage(event.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >

                <option value="">
                  Selecciona un paquete
                </option>

                {packages.map((pkg) => (
                  <option
                    key={pkg.id}
                    value={pkg.id}
                  >
                    {pkg.tracking_code} — {pkg.recipient_name}
                  </option>
                ))}

              </select>

            </div>

            {/* RESULTADO */}
            <div>

              <label
                htmlFor="result"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Resultado de la entrega
              </label>

              <select
                id="result"
                value={result}
                onChange={(event) =>
                  setResult(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >

                {deliveryResults.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

            </div>

            {/* OBSERVACIONES */}
            <div>

              <label
                htmlFor="observations"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Observaciones
              </label>

              <textarea
                id="observations"
                value={observations}
                onChange={(event) =>
                  setObservations(event.target.value)
                }
                placeholder="Agrega alguna observación sobre la entrega..."
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

            </div>

            {/* MENSAJES */}
            {message && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={saving || loading}
              className="w-full rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Registrando entrega..."
                : "Registrar entrega"}
            </button>

          </form>

        </section>

        {/* LISTADO */}
        <section>

          <div className="mb-4">

            <h3 className="text-xl font-bold text-slate-900">
              Entregas registradas
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Historial de resultados de entrega.
            </p>

          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-600">
                Cargando entregas...
              </p>
            </div>
          )}

          {!loading && deliveries.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🚚
              </div>

              <h4 className="font-bold text-slate-900">
                No hay entregas registradas
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Las entregas que registres aparecerán aquí.
              </p>

            </div>
          )}

          {!loading && deliveries.length > 0 && (
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
                        Resultado
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Observaciones
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Fecha
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {deliveries.map((delivery) => (

                      <tr
                        key={delivery.id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">
                          <span className="font-bold text-green-700">
                            {delivery.tracking_code ||
                              "Sin código"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {delivery.recipient_name}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {delivery.result}
                          </span>
                        </td>

                        <td className="max-w-md px-5 py-4 text-sm text-slate-600">
                          {delivery.observations ||
                            "Sin observaciones"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {new Date(
                            delivery.delivered_at
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

        </section>

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