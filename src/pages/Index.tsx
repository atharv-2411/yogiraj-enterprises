import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Cpu, Shield, Zap, Target, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import StatCounter from "@/components/StatCounter";
import heroParts from "@/assets/hero-parts.jpg";
import heroVideo from "@/assets/hero-video.mp4";
import { clientsAPI } from "@/lib/api";

const services = [
  { icon: Cpu, title: "CNC Machining", desc: "5-axis precision machining with tolerances to ±0.001mm" },
  { icon: Target, title: "Prototyping", desc: "Rapid prototyping from concept to functional part in 48 hours" },
  { icon: Zap, title: "Custom Fabrication", desc: "End-to-end custom manufacturing for complex geometries" },
  { icon: Shield, title: "Quality Assurance", desc: "ISO 9001 certified with full CMM inspection reporting" },
];

const Index = () => {
  const { data } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await clientsAPI.getAll();
      return res.data.data;
    },
  });

  const clients = data || [];

  return (
  <Layout>
    {/* Hero */}
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-foreground">
      <div className="absolute inset-0">
        <img src={heroParts} alt="Precision engineered mechanical parts" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/40" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-4">
              ISO 9001 Certified Manufacturer
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-background">
              Precision Mechanical Parts for Enterprise B2B
            </h1>
            <p className="text-base lg:text-lg text-steel mb-8 leading-relaxed">
              Engineering excellence at scale. From prototype to production, we deliver parts with tolerances that define industry standards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/request" className="cta-button inline-flex items-center gap-2">
                Request Quote <ArrowRight size={18} />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-steel/30 text-background font-medium hover:bg-background/10 transition-colors"
              >
                View Catalog <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Right: Video Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <video
                src={heroVideo}
                autoPlay
                muted={false}
                loop
                playsInline
                controls
                className="w-full h-auto object-cover max-h-[320px] lg:max-h-none"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-20 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatCounter value={8} suffix="+" label="Years in Business" />
        <StatCounter value={500000} suffix="+" label="Parts Manufactured" />
        <StatCounter value={10} suffix="+" label="Enterprise Clients" />
        <StatCounter value={1} suffix="+" label="Countries Served" />
      </div>
    </section>

    {/* Services */}
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-2">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Engineering Services</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="machined-block p-6 group hover:border-primary/40 transition-colors hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <s.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              <Link to="/services" className="inline-flex items-center gap-1 text-xs text-primary mt-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ChevronRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Client Logos */}
    <section className="py-16 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-8 text-center">Trusted By Industry Leaders</p>
        <div className="flex flex-wrap justify-center gap-6">
          {clients.length === 0
            ? Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="machined-block w-36 h-36 flex items-center justify-center text-xs text-muted-foreground font-mono bg-background">
                  Client {i + 1}
                </div>
              ))
            : clients.map((client: { _id: string; name: string; logo?: { url: string } }, i: number) => (
                <motion.div
                  key={client._id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="machined-block w-36 h-36 flex items-center justify-center p-4 overflow-hidden bg-background"
                >
                  {client.logo?.url ? (
                    <img src={client.logo.url} alt={client.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground font-mono text-center">{client.name}</span>
                  )}
                </motion.div>
              ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-primary">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Need a Custom Mechanical Part?
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
          Submit your specifications and receive a detailed quote within 24 hours from our engineering team.
        </p>
        <Link to="/request" className="cta-button inline-flex items-center gap-2">
          Start Your Request <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  </Layout>
  );
};

export default Index;
