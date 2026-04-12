import { motion } from "framer-motion";
import { Award, Users, Factory, Shield } from "lucide-react";
import Layout from "@/components/Layout";

const leadership = [
  { name: "Deepak More", role: "CEO & Founder", bio: "20+ years in precision manufacturing. Founded Yogiraj Enterprises in 2017." },
  { name: "Jyoti More", role: "Chief Technology Officer", bio: "PhD in Mechanical Engineering. Leads R&D and advanced manufacturing." },
  { name: "Mahendra Pawar", role: "VP Operations", bio: "20 years operations management. ISO implementation specialist." },
  { name: "Shivaji More", role: "Director of Quality", bio: "15 years in quality assurance. Six Sigma Master Black Belt." },
];

const timeline = [
  { year: "2017", event: "Yogiraj Enterprises founded with 3 CNC machines" },
  { year: "2018", event: "ISO 9001 certification achieved" },
  { year: "2020", event: "Expanded to 50,000 sq ft facility" },
  { year: "2021", event: "Entered aerospace and defense sectors" },
  { year: "2022", event: "Invested in 5-axis machining capability" },
  { year: "2023", event: "Launched rapid prototyping division" },
  { year: "2024", event: "10+ enterprise clients worldwide" },
];

const certs = [
  { icon: Shield, name: "ISO 9001:2015", desc: "Quality Management System" },
  { icon: Award, name: "AS9100D", desc: "Aerospace Quality Standard" },
  { icon: Factory, name: "ITAR Registered", desc: "International Traffic in Arms" },
  { icon: Users, name: "NADCAP", desc: "Special Process Accreditation" },
];

const About = () => (
  <Layout>
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-2">Who We Are</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">About Yogiraj Enterprises</h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Since 2017, we've built our reputation on a single principle: precision is non-negotiable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <div className="machined-block p-8">
            <h3 className="text-accent font-mono text-sm uppercase tracking-widest mb-3">Mission</h3>
            <p className="text-foreground leading-relaxed">To deliver precision mechanical components that exceed specifications, enabling our clients to build products that define their industries.</p>
          </div>
          <div className="machined-block p-8">
            <h3 className="text-accent font-mono text-sm uppercase tracking-widest mb-3">Vision</h3>
            <p className="text-foreground leading-relaxed">To be the most trusted name in precision manufacturing, where every part we produce becomes the standard against which others are measured.</p>
          </div>
        </div>

        <div className="mb-20">
          <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-8">Leadership Team</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((person, i) => (
              <motion.div key={person.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="machined-block p-6 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full mb-4 flex items-center justify-center font-mono text-primary text-lg font-bold">
                  {person.name.split(" ").map(n => n[0]).join("")}
                </div>
                <h4 className="font-semibold text-foreground">{person.name}</h4>
                <p className="text-xs text-accent font-mono mb-2">{person.role}</p>
                <p className="text-sm text-muted-foreground">{person.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-8">Certifications</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certs.map((cert) => (
              <div key={cert.name} className="machined-block p-5 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <cert.icon size={24} className="text-primary" />
                </div>
                <div className="font-semibold text-foreground text-sm">{cert.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{cert.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-8">Company Timeline</p>
          <div className="space-y-3">
            {timeline.map((item, i) => (
              <motion.div key={item.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-6 group">
                <div className="text-xl font-mono font-bold text-primary w-16 shrink-0">{item.year}</div>
                <div className="w-3 h-3 rounded-full bg-accent shrink-0" />
                <div className="machined-block px-5 py-3 flex-1 group-hover:border-primary/40 transition-colors">
                  <p className="text-sm text-foreground">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
