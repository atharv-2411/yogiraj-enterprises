import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MapPin, Phone, Mail, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { contactAPI } from "@/lib/api";

const Contact = () => {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.send(form);
      toast.success("Message sent! We'll respond within 24 hours.");
      setForm({ name: "", company: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-2">Get In Touch</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Contact Us</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
              className="lg:col-span-2 machined-block p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { key: "name", label: "Name", type: "text", required: true },
                  { key: "company", label: "Company", type: "text", required: false },
                  { key: "email", label: "Email", type: "email", required: true },
                  { key: "phone", label: "Phone", type: "tel", required: false },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-mono text-muted-foreground block mb-2">
                      {field.label}{field.required && <span className="text-accent"> *</span>}
                    </label>
                    <input type={field.type} required={field.required}
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-2">
                  Message<span className="text-accent"> *</span>
                </label>
                <textarea required rows={5} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="cta-button inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                <Send size={16} /> {loading ? "Sending..." : "Send Message"}
              </button>
            </motion.form>

            <div className="space-y-4">
              {[
                { icon: MapPin, label: "Address", value: "N 42 JC-2, 9/7, Raigad Chowk, Pawan Nagar, Cidco, Nashik Maharashtra\n Works:- B12, MIDC Ambad, Nashik" },
                { icon: Phone, label: "Phone", value: "8007459311" },
                { icon: Mail, label: "Email", value: "yogirajenterprises2018@gmail.com" },
                { icon: Clock, label: "Hours", value: "Mon–Fri: 8:00 AM – 5:00 PM EST" },
              ].map((item) => (
                <div key={item.label} className="machined-block p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-sm text-foreground whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="machined-block overflow-hidden rounded-lg">
                <iframe
                  title="Yogiraj Enterprises Location"
                  src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d14999.323880889087!2d73.75200306537388!3d19.973609559909413!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sN%2042%20JC-2%2C%209%2F7%2C%20Raigad%20Chowk%2C%20Pawan%20Nagar%2C%20Cidco%2C%20Nashik%20Maharashtra!5e0!3m2!1sen!2sin!4v1776012451462!5m2!1sen!2sin"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
