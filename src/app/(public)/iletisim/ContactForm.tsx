"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "Ad gerekli."),
  email: z.string().email("Geçerli e-posta girin."),
  company: z.string().min(2, "Şirket adı gerekli."),
  message: z.string().min(10, "Mesajınızı biraz daha detaylandırın.")
});

type FormValues = z.infer<typeof schema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: ""
    }
  });

  const onSubmit = async () => {
    setSubmitted(true);
  };

  return (
    <form className="space-y-5 rounded-[2rem] border bg-card p-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Ad soyad</Label>
          <Input id="name" {...form.register("name")} />
          <p className="text-sm text-destructive">{form.formState.errors.name?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" {...form.register("email")} />
          <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Şirket</Label>
        <Input id="company" {...form.register("company")} />
        <p className="text-sm text-destructive">{form.formState.errors.company?.message}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Mesaj</Label>
        <Textarea id="message" {...form.register("message")} />
        <p className="text-sm text-destructive">{form.formState.errors.message?.message}</p>
      </div>
      {submitted ? <p className="text-sm text-primary">Mesajınız alındı. Ekibimiz sizinle iletişime geçecek.</p> : null}
      <Button type="submit">Talep gönder</Button>
    </form>
  );
}
