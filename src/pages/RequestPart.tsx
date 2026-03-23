import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { enquiriesAPI } from "@/lib/api";

const steps = ["Upload Files", "Specifications", "Material", "Project Details"];

const RequestPart = () => {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [specs, setSpecs] = useState({ length: "", width: "", height: "", tolerance: "" });
  const [material, setMaterial] = useState("");
  const [details, setDetails] = useState({ quantity: 10, deadline: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Contact info (step 0 also collects this)
  const [contact, setContact] = useState({ company: "", contactName: "", email: "", phone: "" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) => f.size <= 10 * 1024 * 1024);
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!contact.company || !contact.contactName || !contact.email) {
      toast.error("Please fill in company, contact name, and email.");
      setStep(0);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("company", contact.company);
      formData.append("contactName", contact.contactName);
      formData.append("email", contact.email);
      if (contact.phone) formData.append("phone", contact.phone);
      formData.append("partsDescription", details.description || "Custom part request");
      formData.append("quantity", String(details.quantity));
      if (material) formData.append("material", material);
      if (details.deadline) formData.append("deadline", details.deadline);
      formData.append(
        "dimensions",
        JSON.stringify({ length: specs.length, width: specs.width, height: specs.height, unit: "mm" })
      );
      if (specs.tolerance) formData.append("tolerance", specs.tolerance);
      files.forEach((file) => formData.append("attachments", file));

      await enquiriesAPI.create(formData);
      setSubmitted(true);
      toast.success("Request submitted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <section className="py-20 min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="machined-block p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Request Submitted</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Our engineering team will review your specifications and send a detailed quote within 24 hours.
            </p>
            <button onClick={() => { setSubmitted(false); setStep(0); setFiles([]); setContact({ company: "", contactName: "", email: "", phone: "" }); }}
              className="primary-button">
              Submit Another Request
            </button>
          </motion.div>
        </section>
      </Layout>
    );
  }

  const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <Layout>
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-2">Engineering Inquiry</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Request Custom Part</h1>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full mb-2 transition-colors ${i <= step ? "bg-accent" : "bg-border"}`} />
                <p className={`text-xs font-mono ${i <= step ? "text-accent" : "text-muted-foreground"}`}>{s}</p>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="machined-block p-8">

              {/* Step 0: Contact info + file upload */}
              {step === 0 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "company", label: "Company *", required: true },
                      { key: "contactName", label: "Your Name *", required: true },
                      { key: "email", label: "Email *", required: true },
                      { key: "phone", label: "Phone", required: false },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs font-mono text-muted-foreground block mb-2">{f.label}</label>
                        <input type={f.key === "email" ? "email" : "text"} required={f.required}
                          value={contact[f.key as keyof typeof contact]}
                          onChange={(e) => setContact({ ...contact, [f.key]: e.target.value })}
                          className={inputClass} />
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground pt-2">Upload CAD Drawings or Images</h3>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-10 cursor-pointer hover:border-primary/40 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Upload size={24} className="text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground font-mono">Max 10MB per file · Up to 5 files · jpg, png, pdf, dwg, step, stl</p>
                    <input type="file" className="hidden" multiple onChange={handleFileChange} />
                  </label>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-secondary rounded-md border border-border px-4 py-2">
                          <span className="text-foreground font-mono text-xs">{f.name}</span>
                          <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                            className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Specifications */}
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Part Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ key: "length", label: "Length (mm)" }, { key: "width", label: "Width (mm)" }, { key: "height", label: "Height (mm)" }, { key: "tolerance", label: "Tolerance (mm)" }].map((field) => (
                      <div key={field.key}>
                        <label className="text-xs font-mono text-muted-foreground block mb-2">{field.label}</label>
                        <input type="number" step="0.001" value={specs[field.key as keyof typeof specs]}
                          onChange={(e) => setSpecs({ ...specs, [field.key]: e.target.value })} className={inputClass} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Material */}
              {step === 2 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Material Preference</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["Steel", "Aluminum", "Titanium", "Custom"].map((m) => (
                      <button key={m} onClick={() => setMaterial(m)}
                        className={`p-4 rounded-lg border text-left transition-all ${material === m ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/30"}`}>
                        <div className={`font-semibold text-sm ${material === m ? "text-primary" : "text-foreground"}`}>{m}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Project Details */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Project Details</h3>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-2">
                      Quantity: <span className="text-primary font-bold">{details.quantity}</span>
                    </label>
                    <input type="range" min="1" max="10000" value={details.quantity}
                      onChange={(e) => setDetails({ ...details, quantity: Number(e.target.value) })} className="w-full accent-accent" />
                    <div className="flex justify-between text-xs text-muted-foreground font-mono mt-1"><span>1</span><span>10,000</span></div>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-2">Deadline</label>
                    <input type="date" value={details.deadline}
                      onChange={(e) => setDetails({ ...details, deadline: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground block mb-2">Project Description</label>
                    <textarea rows={4} value={details.description}
                      onChange={(e) => setDetails({ ...details, description: e.target.value })}
                      className={`${inputClass} resize-none font-sans`} placeholder="Describe your project requirements..." />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md border border-border transition-colors ${step === 0 ? "opacity-30 cursor-not-allowed" : "text-foreground hover:bg-card"}`}>
              <ArrowLeft size={16} /> Previous
            </button>
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="primary-button inline-flex items-center gap-2 text-sm">
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="cta-button inline-flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "Submitting..." : <><CheckCircle size={16} /> Submit Request</>}
              </button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RequestPart;
