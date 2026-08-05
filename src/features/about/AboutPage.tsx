import React from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { useContactForm } from "./useContactForm";

const AboutPage: React.FC = () => {
  const { form, status, loading, handleChange, handleSubmit } = useContactForm();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center bg-black/70 rounded-lg py-2 px-2" style={{opacity:0.95}}>About MapleStory Classic Marketplace</h1>
      <div className="bg-slate-900/90 rounded-xl p-6 mb-8 shadow-lg">
        <p className="text-lg mb-4">
          MapleStory Classic Marketplace is designed to make trading items easier, safer, and more efficient for the community. Instead of relying on OWLs or opening a Free Market store, you can post your listings here and reach everyone instantly. This platform aims to reduce the need for expensive OWLs and even serve as a modern alternative to opening a store in the Free Market!
        </p>
        <p className="mb-2">Key benefits:</p>
        <ul className="list-disc pl-6 mb-4 text-slate-300">
          <li>Post and search items for free</li>
          <li>Contact sellers directly</li>
          <li>Save mesos and time</li>
        </ul>
        <p className="mb-2">Contact us:</p>
        <div className="mb-4">
          <span className="font-semibold">Email:</span> <a href="mailto:msclassicfm@gmail.com" className="text-blue-400 underline">msclassicfm@gmail.com</a>
        </div>
      </div>
      <div className="bg-slate-900/90 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Contact Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Textarea label="Message" name="message" value={form.message} onChange={handleChange} required rows={4} />
          <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Message"}</Button>
        </form>
        {status && <p className="mt-3 text-center text-sm text-slate-400">{status}</p>}
      </div>
    </div>
  );
};

export default AboutPage;
