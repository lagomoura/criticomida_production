"use client";
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-ghost mr-3"
      onClick={() => router.back()}
    >
      ← Volver
    </button>
  );
} 