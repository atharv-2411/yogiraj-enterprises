import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingDown, Clock, Target, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { clientsAPI } from "@/lib/api";

interface Client {
  _id: string;
  name: string;
  industry: string;
  logo: { url: string; publicId: string };
  testimonial: { quote: string; authorName: string; authorRole: string };
}

const metrics = [
  { icon: TrendingDown, value: "32%", label: "Average Cost Reduction", desc: "Through DFM optimization and material efficiency improvements" },
  { icon: Clock, value: "48hr", label: "Fastest Prototype Delivery", desc: "From approved drawing to functional metal prototype" },
  { icon: Target, value: "99.97%", label: "Quality Acceptance Rate", desc: "Across all production runs in the last fiscal year" },
];

const Clients = () => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await clientsAPI.getAll();
      return res.data.data as Client[];
    },
  });

  const clients = data || [];
  const testimonials = clients.filter((c) => c.testimonial?.quote);

  return (
    <Layout>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-2">Our Partners</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Enterprise Clients</h1>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          )}

          {/* Client Logo Grid */}
          {!isLoading && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-20">
              {clients.length === 0 ? (
                // Fallback placeholder logos
                Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="machined-block aspect-[3/2] flex items-center justify-center text-xs text-muted-foreground font-mono text-center p-2">
                    Client {i + 1}
                  </div>
                ))
              ) : (
                clients.map((client, i) => (
                  <motion.div key={client._id}
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="machined-block aspect-[3/2] flex items-center justify-center text-xs text-muted-foreground font-mono text-center p-2 overflow-hidden">
                    {client.logo?.url ? (
                      <img src={client.logo.url} alt={client.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span>{client.name}</span>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <div className="mb-20">
              <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-8">Testimonials</p>
              <div className="machined-block p-8 md:p-12">
                <motion.div key={testimonialIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed mb-6 font-light">
                    "{testimonials[testimonialIdx].testimonial.quote}"
                  </blockquote>
                  <p className="font-semibold text-foreground">{testimonials[testimonialIdx].testimonial.authorName}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[testimonialIdx].testimonial.authorRole}</p>
                </motion.div>
                <div className="flex gap-2 mt-6">
                  <button onClick={() => setTestimonialIdx((p) => (p === 0 ? testimonials.length - 1 : p - 1))}
                    className="p-2 border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setTestimonialIdx((p) => (p === testimonials.length - 1 ? 0 : p + 1))}
                    className="p-2 border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Metrics */}
          <div>
            <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-8">Success Metrics</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.map((m, i) => (
                <motion.div key={m.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="machined-block p-6 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                    <m.icon size={20} className="text-accent" />
                  </div>
                  <div className="text-3xl font-bold text-primary font-mono mb-1">{m.value}</div>
                  <div className="text-sm font-semibold text-foreground mb-2">{m.label}</div>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Clients;
