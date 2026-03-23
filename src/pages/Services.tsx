import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Cpu, Target, Zap, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import { servicesAPI } from "@/lib/api";

interface Service {
  _id: string;
  title: string;
  description: string;
  benefits: string[];
  caseStudy: { client: string; result: string };
  image: { url: string; publicId: string };
  icon: string;
  order: number;
}

// Map icon string names to Lucide components
const iconMap: Record<string, React.ElementType> = {
  Cpu, Target, Zap, Shield,
};

const Services = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await servicesAPI.getAll();
      return res.data.data as Service[];
    },
  });

  const services = data || [];

  return (
    <Layout>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-2">What We Do</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Engineering Services</h1>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          )}

          {isError && (
            <div className="text-center py-20 text-muted-foreground">
              Failed to load services. Make sure the backend is running.
            </div>
          )}

          <div className="space-y-8">
            {services.map((service, i) => {
              const IconComponent = iconMap[service.icon] || Cpu;
              return (
                <motion.div key={service._id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="machined-block p-8 hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent size={24} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">{service.title}</h2>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {service.benefits.map((b) => (
                          <div key={b} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle size={14} className="text-accent shrink-0" />{b}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-secondary rounded-lg p-5">
                      <p className="text-xs font-mono text-blueprint uppercase tracking-widest mb-3">Case Study</p>
                      <p className="text-sm font-semibold text-foreground mb-2">{service.caseStudy?.client}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.caseStudy?.result}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
