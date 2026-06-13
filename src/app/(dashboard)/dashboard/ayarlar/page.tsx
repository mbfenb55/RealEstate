"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HexColorPicker } from "react-colorful";
import { useDropzone } from "react-dropzone";
import { BellRing, Building2, KeyRound, ShieldAlert, Trash2, UploadCloud, User2 } from "lucide-react";

import { getAuthErrorMessage } from "@/lib/auth-errors";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const tabs = [
  { id: "account", label: "Hesap", icon: User2 },
  { id: "company", label: "Firma", icon: Building2 },
  { id: "security", label: "Güvenlik", icon: KeyRound },
  { id: "notifications", label: "Bildirimler", icon: BellRing },
  { id: "danger", label: "Tehlike Bölgesi", icon: ShieldAlert }
] as const;

type TabId = (typeof tabs)[number]["id"];
type NotificationSettings = {
  readyEmail: boolean;
  paymentEmail: boolean;
  marketingEmail: boolean;
};

function splitFullName(value?: string | null) {
  const parts = (value ?? "").trim().split(" ").filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ")
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { profile, user, syncProfile, signOut, deleteAccount } = useAuth();
  const supabase = useMemo(() => (hasPublicSupabaseEnv() ? createClient() : null), []);
  const [activeTab, setActiveTab] = useState<TabId>("account");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#1E3A8A");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    readyEmail: true,
    paymentEmail: true,
    marketingEmail: false
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const nameParts = splitFullName(profile?.fullName);
    setFirstName(nameParts.firstName);
    setLastName(nameParts.lastName);
    setEmail(profile?.email ?? user?.email ?? "");
    setPhone(profile?.phone ?? "");
    setCompanyName(profile?.companyName ?? "");
    setLogoUrl(profile?.logoUrl ?? "");
    setBrandColor(profile?.brandColor ?? "#1E3A8A");

    const storedNotifications = user?.user_metadata?.notifications as NotificationSettings | undefined;
    if (storedNotifications) {
      setNotifications({
        readyEmail: Boolean(storedNotifications.readyEmail),
        paymentEmail: Boolean(storedNotifications.paymentEmail),
        marketingEmail: Boolean(storedNotifications.marketingEmail)
      });
    }
  }, [profile, user]);

  const uploadLogo = async (file: File) => {
    setSaving("company");
    setError(null);

    try {
      if (!supabase) {
        throw new Error("Supabase yapılandırması eksik.");
      }

      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "branding-assets";
      const filePath = `logos/${crypto.randomUUID()}-${file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type
      });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      setLogoUrl(data.publicUrl);
      setMessage("Logo yüklendi. Kaydettiğinizde profilinize işlenecek.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Logo yüklenemedi.");
    } finally {
      setSaving(null);
    }
  };

  const dropzone = useDropzone({
    multiple: false,
    maxSize: 2 * 1024 * 1024,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/svg+xml": [".svg"]
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        void uploadLogo(file);
      }
    }
  });

  const saveAccount = async () => {
    setSaving("account");
    setError(null);
    setMessage(null);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName.length < 2) {
        throw new Error("Ad ve soyad alanlarını doldurun.");
      }

      const syncedProfile = await syncProfile({
        fullName,
        phone
      });

      if (!syncedProfile) {
        throw new Error("Hesap bilgileri kaydedilemedi.");
      }

      if (email.trim() && email.trim() !== user?.email) {
        if (!supabase) {
          throw new Error("Supabase yapılandırması eksik.");
        }

        const { error: updateError } = await supabase.auth.updateUser({
          email: email.trim()
        });

        if (updateError) {
          throw updateError;
        }

        setMessage("Profil güncellendi. E-posta değişikliği için doğrulama mesajı gönderildi.");
      } else {
        setMessage("Hesap bilgileriniz güncellendi.");
      }
    } catch (saveError) {
      setError(getAuthErrorMessage(saveError));
    } finally {
      setSaving(null);
    }
  };

  const saveCompany = async () => {
    setSaving("company");
    setError(null);
    setMessage(null);

    try {
      const syncedProfile = await syncProfile({
        companyName,
        logoUrl,
        brandColor
      });

      if (!syncedProfile) {
        throw new Error("Firma bilgileri kaydedilemedi.");
      }

      if (!supabase) {
        throw new Error("Supabase yapılandırması eksik.");
      }

      await supabase.auth.updateUser({
        data: {
          company_name: companyName,
          logo_url: logoUrl,
          brand_color: brandColor
        }
      });

      setMessage("Firma bilgileri güncellendi.");
    } catch (saveError) {
      setError(getAuthErrorMessage(saveError));
    } finally {
      setSaving(null);
    }
  };

  const savePassword = async () => {
    setSaving("security");
    setError(null);
    setMessage(null);

    try {
      if (newPassword.length < 6) {
        throw new Error("Yeni şifre en az 6 karakter olmalıdır.");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Yeni şifre ve tekrar alanı eşleşmiyor.");
      }

      if (currentPassword && user?.email) {
        if (!supabase) {
          throw new Error("Supabase yapılandırması eksik.");
        }

        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        });

        if (verifyError) {
          throw verifyError;
        }
      }

      if (!supabase) {
        throw new Error("Supabase yapılandırması eksik.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Şifreniz güncellendi.");
    } catch (saveError) {
      setError(getAuthErrorMessage(saveError));
    } finally {
      setSaving(null);
    }
  };

  const saveNotifications = async () => {
    setSaving("notifications");
    setError(null);
    setMessage(null);

    try {
      if (!supabase) {
        throw new Error("Supabase yapılandırması eksik.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          notifications
        }
      });

      if (updateError) {
        throw updateError;
      }

      setMessage("Bildirim tercihleri kaydedildi.");
    } catch (saveError) {
      setError(getAuthErrorMessage(saveError));
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving("danger");
    setError(null);
    setMessage(null);

    try {
      if (deleteConfirmation.trim().toUpperCase() !== "SIL") {
        throw new Error("Hesabı silmek için SIL yazın.");
      }

      const result = await deleteAccount();

      if (result.error) {
        throw result.error;
      }

      await signOut();
      router.push("/");
      router.refresh();
    } catch (deleteError) {
      setError(getAuthErrorMessage(deleteError));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Ayarlar</p>
        <h1 className="text-3xl font-semibold text-slate-900">Hesap, firma ve güvenlik ayarları</h1>
      </div>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[240px_1fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardContent className="space-y-2 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardContent className="p-6">
            {activeTab === "account" ? (
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Input placeholder="Ad" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
                  <Input placeholder="Soyad" value={lastName} onChange={(event) => setLastName(event.target.value)} />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Input placeholder="E-posta" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <Input placeholder="Telefon" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </div>
                <Button type="button" loading={saving === "account"} loadingText="Kaydediliyor" onClick={() => void saveAccount()}>
                  Kaydet
                </Button>
              </div>
            ) : null}

            {activeTab === "company" ? (
              <div className="space-y-6">
                <Input placeholder="Firma adı" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />

                <div
                  {...dropzone.getRootProps()}
                  className="cursor-pointer rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-all duration-300 hover:border-primary/40"
                >
                  <input {...dropzone.getInputProps()} />
                  <UploadCloud className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-3 text-sm font-medium text-slate-900">Firma logosunu yükleyin</p>
                  <p className="mt-1 text-sm text-slate-500">PNG, JPG, SVG • Maksimum 2 MB</p>
                </div>

                {logoUrl ? (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <Image src={logoUrl} alt="Firma logosu" width={200} height={80} unoptimized className="h-20 w-auto object-contain" />
                  </div>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                  <HexColorPicker color={brandColor} onChange={setBrandColor} />
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Marka rengi</p>
                    <div className="mt-3 h-16 rounded-2xl" style={{ backgroundColor: brandColor }} />
                    <p className="mt-3 text-sm font-medium text-slate-900">{brandColor}</p>
                  </div>
                </div>

                <Button type="button" loading={saving === "company"} loadingText="Kaydediliyor" onClick={() => void saveCompany()}>
                  Kaydet
                </Button>
              </div>
            ) : null}

            {activeTab === "security" ? (
              <div className="space-y-5">
                <Input
                  type="password"
                  placeholder="Mevcut şifre"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    type="password"
                    placeholder="Yeni şifre"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Yeni şifre tekrar"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
                <Button type="button" loading={saving === "security"} loadingText="Güncelleniyor" onClick={() => void savePassword()}>
                  Şifreyi Değiştir
                </Button>
              </div>
            ) : null}

            {activeTab === "notifications" ? (
              <div className="space-y-4">
                {[
                  { key: "readyEmail", label: "Çekim hazır olduğunda e-posta gönder" },
                  { key: "paymentEmail", label: "Ödeme ve fatura e-postaları al" },
                  { key: "marketingEmail", label: "Kampanya ve ürün güncellemeleri al" }
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between rounded-[1.5rem] border border-slate-200 p-4">
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof NotificationSettings]}
                      onChange={(event) =>
                        setNotifications((current) => ({
                          ...current,
                          [item.key]: event.target.checked
                        }))
                      }
                      className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </label>
                ))}
                <Button
                  type="button"
                  loading={saving === "notifications"}
                  loadingText="Kaydediliyor"
                  onClick={() => void saveNotifications()}
                >
                  Tercihleri Kaydet
                </Button>
              </div>
            ) : null}

            {activeTab === "danger" ? (
              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                  Hesabınızı sildiğinizde çekimleriniz, faturalarınız ve kredi kayıtlarınız geri alınamaz şekilde kaldırılır.
                </div>
                <Input
                  placeholder="Onay için SIL yazın"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  loading={saving === "danger"}
                  loadingText="Hesap siliniyor"
                  onClick={() => void handleDeleteAccount()}
                >
                  <Trash2 className="h-4 w-4" />
                  Hesabı Sil
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
