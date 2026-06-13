"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { getAuthErrorMessage } from "@/lib/auth-errors";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Ad Soyad alanı zorunludur."),
    email: z.string().trim().email("Geçerli bir e-posta adresi girin."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
    confirmPassword: z.string().min(6, "Şifre tekrar alanı zorunludur."),
    companyName: z.string().trim().optional(),
    phone: z.string().trim().optional()
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M21.8 12.23c0-.72-.06-1.25-.2-1.8H12v3.35h5.63c-.11.83-.69 2.07-1.98 2.91l-.02.11 2.88 2.18.2.02c1.86-1.68 2.94-4.16 2.94-6.77Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.89 6.77-2.41l-3.22-2.46c-.86.59-2.01 1-3.55 1-2.7 0-4.99-1.73-5.8-4.11l-.11.01-3 2.27-.04.1A10.23 10.23 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.2 14.02A6.18 6.18 0 0 1 5.87 12c0-.7.12-1.38.32-2.02l-.01-.13-3.03-2.3-.1.05A9.87 9.87 0 0 0 2 12c0 1.59.38 3.08 1.05 4.4l3.15-2.38Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.87c1.94 0 3.25.82 4 1.5l2.92-2.79C17.07 2.9 14.76 2 12 2a10.23 10.23 0 0 0-8.95 5.6L6.2 9.98C7 7.6 9.3 5.87 12 5.87Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register: registerUser, signInWithGoogle } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      phone: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);

    const result = await registerUser({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
      companyName: values.companyName?.trim() || undefined,
      phone: values.phone?.trim() || undefined
    });

    if (result.error) {
      setError(getAuthErrorMessage(result.error));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setGoogleLoading(true);

    const result = await signInWithGoogle("/dashboard");

    if (result.error) {
      setError(getAuthErrorMessage(result.error));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Badge variant="success" className="inline-flex px-4 py-2 text-sm font-semibold">
          İlk çekim ücretsiz!
        </Badge>
        <div>
          <h1 className="text-3xl font-semibold">Ücretsiz hesabınızı oluşturun</h1>
          <p className="mt-2 text-sm text-slate-300">
            İlk krediniz otomatik tanımlanır. Kaydı tamamlayıp doğrudan panelden çekim başlatabilirsiniz.
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
        loading={googleLoading}
        loadingText="Google yönlendirmesi hazırlanıyor"
        onClick={handleGoogleRegister}
      >
        {!googleLoading ? <GoogleIcon /> : null}
        Google ile devam et
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.24em] text-slate-400">
          <span className="bg-slate-950 px-3">veya e-posta ile</span>
        </div>
      </div>

      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="fullName">Ad Soyad</Label>
          <Input id="fullName" {...form.register("fullName")} />
          <p className="text-sm text-rose-300">{form.formState.errors.fullName?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" {...form.register("email")} />
          <p className="text-sm text-rose-300">{form.formState.errors.email?.message}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" {...form.register("password")} />
            <p className="text-sm text-rose-300">{form.formState.errors.password?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
            <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
            <p className="text-sm text-rose-300">{form.formState.errors.confirmPassword?.message}</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Firma Adı</Label>
            <Input id="companyName" placeholder="İsteğe bağlı" {...form.register("companyName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" placeholder="+90 5xx xxx xx xx" {...form.register("phone")} />
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <p className="font-semibold">1 ücretsiz kredi hesabınıza otomatik yüklenir.</p>
              <p className="mt-1 text-emerald-100/80">
                Kaydı tamamladıktan sonra yeni çekim sihirbazına doğrudan geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <Button
          type="submit"
          className="w-full"
          loading={form.formState.isSubmitting}
          loadingText="Hesabınız oluşturuluyor"
        >
          Hesap Oluştur
          {!form.formState.isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </form>

      <p className="text-sm text-slate-300">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-medium text-white">
          Giriş yapın
        </Link>
      </p>
    </div>
  );
}
