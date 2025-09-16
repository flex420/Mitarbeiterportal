export type ActionResult =
  | { success: true; message?: string; token?: string }
  | { success: false; error: string };

export function FormResult({ result }: { result?: ActionResult | null }) {
  if (!result) return null;
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        result.success ? "border-green-300 bg-green-50 text-green-700" : "border-red-300 bg-red-50 text-red-700"
      }`}
    >
      {result.success ? result.message ?? "Aktion erfolgreich" : result.error}
    </div>
  );
}
