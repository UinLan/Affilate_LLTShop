// app/auth/unauthorized/page.tsx
export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">401 - Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    </div>
  );
}