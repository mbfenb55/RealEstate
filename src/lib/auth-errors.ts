export function getAuthErrorMessage(error: unknown) {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Beklenmeyen bir hata oluştu.";

  const message = rawMessage.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }

  if (message.includes("email not confirmed")) {
    return "E-posta adresinizi doğruladıktan sonra giriş yapabilirsiniz.";
  }

  if (message.includes("user already registered")) {
    return "Bu e-posta adresiyle daha önce hesap oluşturulmuş.";
  }

  if (message.includes("password should be at least")) {
    return "Şifreniz en az 6 karakter olmalıdır.";
  }

  if (message.includes("signup is disabled")) {
    return "Yeni üyelikler şu anda devre dışı.";
  }

  if (message.includes("supabase environment variables are missing")) {
    return "Supabase yapılandırması eksik. Ortam değişkenlerini kontrol edin.";
  }

  if (message.includes("fetch failed") || message.includes("network")) {
    return "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.";
  }

  return rawMessage;
}
