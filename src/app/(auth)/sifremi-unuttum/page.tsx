"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getAuthErrorMessage } from "@/lib/auth-errors";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta adresi girin.")
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    const { error: resetError } = await resetPassword(values.email.trim());

    if (resetError) {
      setError(getAuthErrorMessage(resetError));
      return;
    }

    setError(null);
    setMessage("Şifre yenileme bağlantısı e-posta adresinize gönderildi.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Şifremi Unuttum</h1>
        <p className="mt-2 text-sm text-slate-300">
          Kayıtlı e-posta adresinizi girin, yenileme bağlantısını hemen gönderelim.
        </p>
      </div>

      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" {...form.register("email")} />
          <p className="text-sm text-rose-300">{form.formState.errors.email?.message}</p>
        </div>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        <Button
          type="submit"
          className="w-full"
          loading={form.formState.isSubmitting}
          loadingText="Bağlantı gönderiliyor"
        >
          Bağlantı Gönder
        </Button>
      </form>

      <Link href="/giris" className="text-sm text-slate-300">
        Giriş sayfasına dön
      </Link>
    </div>
  );
}
