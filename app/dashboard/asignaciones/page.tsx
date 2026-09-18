"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PackageRecord = {
  id: string;
  tracking_code: string;
  recipient_name: string;
};

type Assignment = {
  package_id: string;
  courier_id: string;
  assigned_at: string;
  completed_at?: string | null;
  tracking_code?: string;
  recipient_name?: string;
  courier_name?: string;
};

export default function AsignacionesPage() {
  const router = useRouter();

  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [selectedPackage, setSelectedPackage] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

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

        const { data: assignmentsData, error: assignmentsError } =
  await supabase
    .from("assignments")
    .select("package_id, courier_id, assigned_at, completed_at")
    .order("assigned_at", { ascending: false });

    
        if (assignmentsError) {
          console.error(assignmentsError);
          setError("No fue posible cargar las asignaciones.");
          return;
        }

        const packageMap = new Map(
  (packagesData || []).map((pkg) => [pkg.id, pkg])
);

const completeAssignments = (assignmentsData || []).map(
  (assignment) => {
    const pkg = packageMap.get(assignment.package_id);

    return {
      ...assignment,
      tracking_code: pkg?.tracking_code,
      recipient_name: pkg?.recipient_name,
      courier_name:
        assignment.courier_id === user.id
          ? user.user_metadata?.full_name || user.email || "Usuario"
          : "Responsable no disponible",
    };
  }
);

setAssignments(completeAssignments);

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

    if (!assignedTo.trim()) {
      setError("Indica el responsable de la entrega.");
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
  .from("assignments")
  .insert({
    package_id: selectedPackage,
    courier_id: user.id,
  })
  .select("package_id, courier_id, assigned_at, completed_at")
  .single();

      if (insertError) {
        console.error(insertError);
        setError("No fue posible registrar la asignación.");
        return;
      }

      const pkg = packages.find(
        (item) => item.id === selectedPackage
      );

     const newAssignment: Assignment = {
  ...data,
  tracking_code: pkg?.tracking_code,
  recipient_name: pkg?.recipient_name,
  courier_name:
    user.user_metadata?.full_name ||
    user.email ||
    "Usuario",
};

      setAssignments((current) => [
        newAssignment,
        ...current,
      ]);

      setSelectedPackage("");
      setAssignedTo("");

      setMessage("Asignación registrada correctamente.");
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error al registrar la asignación.");
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

          <p className="mb-2 text-sm font-semibold text-blue-600">
            GESTIÓN DE ASIGNACIONES
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Asignaciones
          </h2>

          <p className="mt-2 text-slate-600">
            Asigna un paquete a la persona responsable de su entrega.
          </p>

        </div>

        {/* FORMULARIO */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="mb-6">

            <h3 className="text-xl font-bold text-slate-900">
              Nueva asignación
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Selecciona el paquete e indica el responsable.
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

            {/* RESPONSABLE */}
            <div>

              <label
                htmlFor="assignedTo"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Responsable de la entrega
              </label>

              <input
                id="assignedTo"
                type="text"
                value={assignedTo}
                onChange={(event) =>
                  setAssignedTo(event.target.value)
                }
                placeholder="Ej. Carlos Pérez"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

            </div>

            {/* MENSAJE */}
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
              className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Registrando asignación..."
                : "Registrar asignación"}
            </button>

          </form>

        </section>

        {/* LISTADO */}
        <section>

          <div className="mb-4">

            <h3 className="text-xl font-bold text-slate-900">
              Asignaciones registradas
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Paquetes asignados a responsables de entrega.
            </p>

          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-600">
                Cargando asignaciones...
              </p>
            </div>
          )}

          {!loading && assignments.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                👤
              </div>

              <h4 className="font-bold text-slate-900">
                No hay asignaciones registradas
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Las asignaciones que registres aparecerán aquí.
              </p>

            </div>
          )}

          {!loading && assignments.length > 0 && (
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
                        Responsable
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Fecha
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {assignments.map((assignment) => (

                      <tr
                       key={`${assignment.package_id}-${assignment.assigned_at}`}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">
                          <span className="font-bold text-green-700">
                            {assignment.tracking_code ||
                              "Sin código"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {assignment.recipient_name ||
                            "No disponible"}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {assignment.courier_name || "Responsable no disponible"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {new Date(
                            assignment.assigned_at
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