"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegistrarPaquetePage() {
  const router = useRouter();

  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setTrackingCode("");

    try {
      const supabase = createClient();

      // Verificar que exista una sesión iniciada
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Registrar el paquete
      const { data, error } = await supabase
        .from("packages")
        .insert({
          sender_name: senderName.trim(),
          recipient_name: recipientName.trim(),
          recipient_phone: recipientPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          description: description.trim(),
          created_by: user.id,
        })
        .select("tracking_code")
        .single();

      if (error) {
        console.error(error);
        setMessage(
          "No fue posible registrar el paquete. Verifica los datos e inténtalo nuevamente."
        );
        return;
      }

      // Mostrar el código generado automáticamente
      setTrackingCode(data.tracking_code);

      // Limpiar formulario
      setSenderName("");
      setRecipientName("");
      setRecipientPhone("");
      setDeliveryAddress("");
      setDescription("");

      setMessage("Paquete registrado correctamente.");
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error al registrar el paquete.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ENCABEZADO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

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
      <div className="mx-auto max-w-4xl px-6 py-8">

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-green-600">
            GESTIÓN DE ENTREGAS
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Registrar paquete
          </h2>

          <p className="mt-2 text-slate-600">
            Introduce la información del envío. El sistema generará
            automáticamente el código de seguimiento.
          </p>
        </div>


        {/* FORMULARIO */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* REMITENTE */}
            <div>
              <label
                htmlFor="senderName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nombre del remitente
              </label>

              <input
                id="senderName"
                type="text"
                value={senderName}
                onChange={(event) => setSenderName(event.target.value)}
                placeholder="Ej. Claudia Gamboa"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>


            {/* DESTINATARIO */}
            <div>
              <label
                htmlFor="recipientName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nombre del destinatario
              </label>

              <input
                id="recipientName"
                type="text"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                placeholder="Ej. María González"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>


            {/* TELÉFONO */}
            <div>
              <label
                htmlFor="recipientPhone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Teléfono del destinatario
              </label>

              <input
                id="recipientPhone"
                type="tel"
                value={recipientPhone}
                onChange={(event) => setRecipientPhone(event.target.value)}
                placeholder="Ej. 0412-1234567"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>


            {/* DIRECCIÓN */}
            <div>
              <label
                htmlFor="deliveryAddress"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Dirección de entrega
              </label>

              <textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                placeholder="Ej. Ciudad Guayana, Estado Bolívar"
                required
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>


            {/* DESCRIPCIÓN */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Descripción del paquete
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ej. Documentos, ropa, artículos personales..."
                required
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>


            {/* MENSAJE */}
            {message && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  trackingCode
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}


            {/* CÓDIGO GENERADO */}
            {trackingCode && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">

                <p className="text-sm font-semibold text-green-700">
                  CÓDIGO DE SEGUIMIENTO GENERADO
                </p>

                <p className="mt-2 text-3xl font-bold tracking-wider text-slate-900">
                  {trackingCode}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Guarda este código para consultar el estado del paquete.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-5 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Consultar seguimiento
                </button>

              </div>
            )}


            {/* BOTÓN */}
            {!trackingCode && (
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Registrando paquete..."
                  : "Registrar paquete"}
              </button>
            )}

          </form>

        </div>

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