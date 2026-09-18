"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PackageRecord = {
  id: string;
  tracking_code: string;
  recipient_name: string;
};

type Incident = {
  id: string;
  package_id: string;
  type: string;
  description: string;
  created_at: string;
  tracking_code?: string;
  recipient_name?: string;
  ai_category?: string;
  ai_priority?: string;
  ai_recommendation?: string;
  ai_customer_message?: string;
  ai_processed_at?: string;
};

const incidentTypes = [
  "Retraso",
  "Dirección incorrecta",
  "Destinatario ausente",
  "Paquete dañado",
  "Paquete extraviado",
  "Problema de transporte",
  "Otro",
];

export default function IncidenciasPage() {
  const router = useRouter();

  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [selectedPackage, setSelectedPackage] = useState("");
  const [incidentType, setIncidentType] = useState("Retraso");
  const [description, setDescription] = useState("");

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

        // Cargar paquetes
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

        // Cargar incidencias
        const { data: incidentsData, error: incidentsError } =
          await supabase
            .from("incidents")
           .select(`
  id,
  package_id,
  type,
  description,
  created_at,
  ai_category,
  ai_priority,
  ai_recommendation,
  ai_customer_message,
  ai_processed_at
`)
            .order("created_at", { ascending: false });

        if (incidentsError) {
          console.error(incidentsError);
          setError("No fue posible cargar las incidencias.");
          return;
        }

        const packageMap = new Map(
          (packagesData || []).map((pkg) => [pkg.id, pkg])
        );

        const completeIncidents = (incidentsData || []).map(
          (incident) => {
            const pkg = packageMap.get(incident.package_id);

            return {
              ...incident,
              tracking_code: pkg?.tracking_code,
              recipient_name: pkg?.recipient_name,
            };
          }
        );

        setIncidents(completeIncidents);
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

    if (!description.trim()) {
      setError("Describe la incidencia.");
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

      const { data, error: insertError } = await supabase
        .from("incidents")
        .insert({
          package_id: selectedPackage,
          type: incidentType,
          description: description.trim(),
          created_by: user.id,
        })
       .select(`
  id,
  package_id,
  type,
  description,
  created_at,
  ai_category,
  ai_priority,
  ai_recommendation,
  ai_customer_message,
  ai_processed_at
`)
.single();

      if (insertError) {
        console.error(insertError);
        setError(
          "No fue posible registrar la incidencia."
        );
        return;
      }

      const pkg = packages.find(
        (item) => item.id === selectedPackage
      );

      const newIncident: Incident = {
        ...data,
        tracking_code: pkg?.tracking_code,
        recipient_name: pkg?.recipient_name,
      };

      setIncidents((current) => [
        newIncident,
        ...current,
      ]);

      setSelectedPackage("");
      setIncidentType("Retraso");
      setDescription("");

      setMessage("Incidencia registrada correctamente.");
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al registrar la incidencia.");
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

          <p className="mb-2 text-sm font-semibold text-red-600">
            GESTIÓN DE INCIDENCIAS
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Incidencias
          </h2>

          <p className="mt-2 text-slate-600">
            Registra y consulta problemas relacionados con los
            paquetes.
          </p>

        </div>


        {/* FORMULARIO */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="mb-6">

            <h3 className="text-xl font-bold text-slate-900">
              Registrar incidencia
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Selecciona el paquete y describe el problema.
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


            {/* TIPO */}
            <div>

              <label
                htmlFor="type"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Tipo de incidencia
              </label>

              <select
                id="type"
                value={incidentType}
                onChange={(event) =>
                  setIncidentType(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >

                {incidentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}

              </select>

            </div>


            {/* DESCRIPCIÓN */}
            <div>

              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Descripción
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe lo ocurrido con el paquete..."
                rows={5}
                required
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

            </div>


            {/* MENSAJE ÉXITO */}
            {message && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {message}
              </div>
            )}


            {/* MENSAJE ERROR */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}


            {/* BOTÓN */}
            <button
              type="submit"
              disabled={saving || loading}
              className="w-full rounded-xl bg-red-600 px-5 py-3.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Registrando incidencia..."
                : "Registrar incidencia"}
            </button>

          </form>

        </section>


        {/* LISTADO */}
        <section>

          <div className="mb-4">

            <h3 className="text-xl font-bold text-slate-900">
              Incidencias registradas
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Historial de problemas registrados en los envíos.
            </p>

          </div>


          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-600">
                Cargando incidencias...
              </p>
            </div>
          )}


          {!loading && incidents.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                ⚠️
              </div>

              <h4 className="font-bold text-slate-900">
                No hay incidencias registradas
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Las incidencias que registres aparecerán aquí.
              </p>

            </div>
          )}


          {!loading && incidents.length > 0 && (
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
                        Tipo
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Descripción

                      </th>
<th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
  Prioridad IA
</th>

<th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
  Categoría IA
</th>

<th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
  Recomendación IA
</th>

<th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
  Mensaje al cliente
</th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Fecha
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {incidents.map((incident) => (

                      <tr
                        key={incident.id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <span className="font-bold text-green-700">
                            {incident.tracking_code ||
                              "Sin código"}
                          </span>

                        </td>


                        <td className="px-5 py-4 text-sm text-slate-700">
                          {incident.recipient_name ||
                            "No disponible"}
                        </td>


                        <td className="px-5 py-4">

                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            {incident.type}
                          </span>

                        </td>


                        <td className="max-w-md px-5 py-4 text-sm text-slate-600">
                          {incident.description}
                        </td>

<td className="px-5 py-4">
  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
    {incident.ai_priority || "Pendiente"}
  </span>
</td>

<td className="px-5 py-4">
  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
    {incident.ai_category || "Pendiente"}
  </span>
</td>

<td className="max-w-md px-5 py-4 text-sm text-slate-600">
  {incident.ai_recommendation || "Pendiente"}
</td>

<td className="max-w-md px-5 py-4 text-sm text-slate-600">
  {incident.ai_customer_message || "Pendiente"}
</td>



                      <td className="px-5 py-4 text-sm text-slate-500">
  {new Date(
    incident.created_at
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