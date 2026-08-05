import { useState } from "react";
import { getFunctionsURL } from "@/services/functions";

export interface ContactFormState {
  name: string;
  email: string;
  message: string;
}

export function useContactForm() {
  const [form, setForm] = useState<ContactFormState>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const endpoint = getFunctionsURL("contactForm");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as {
        message?: string;
        error?: string;
      };

      if (res.ok) {
        setStatus("✓ Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus(`❌ ${data.error || "Failed to send message. Try again later."}`);
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("❌ Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    status,
    loading,
    handleChange,
    handleSubmit,
  };
}
