export function CsrfField({ token }: { token: string }) {
  return <input type="hidden" name="csrfToken" value={token} />;
}
