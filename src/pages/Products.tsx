import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Send, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { productsAPI } from "@/lib/api";
import { Link } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  material: string;
  dimensions: string;
  tolerance: string;
  description: string;
  image: { url: string; publicId: string };
  gallery: { url: string; publicId: string }[];
  specSheetUrl: string;
  isActive: boolean;
}

const categories = ["All", "Gears", "Shafts", "Bearings", "Housings", "Brackets"];
const materials = ["All", "Steel", "Aluminum", "Titanium", "Custom"];

const Products = () => {
  const [catFilter, setCatFilter] = useState("All");
  const [matFilter, setMatFilter] = useState("All");
  const [selected, setSelected] = useState<Product | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", catFilter, matFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (catFilter !== "All") params.category = catFilter;
      if (matFilter !== "All") params.material = matFilter;
      const res = await productsAPI.getAll(params);
      return res.data.data as Product[];
    },
  });

  const products = data || [];

  return (
    <Layout>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-sm font-mono text-blueprint tracking-widest uppercase mb-2">Product Catalog</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Precision Components</h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${catFilter === c ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2">Material</label>
              <div className="flex flex-wrap gap-2">
                {materials.map((m) => (
                  <button key={m} onClick={() => setMatFilter(m)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${matFilter === m ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="text-center py-20 text-muted-foreground">
              <p>Failed to load products. Make sure the backend is running.</p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <p className="text-muted-foreground col-span-4 text-center py-12">No products found.</p>
              ) : (
                products.map((product, i) => (
                  <motion.div key={product._id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(product)}
                    className="machined-block p-5 cursor-pointer group hover:border-primary/40 hover:shadow-lg transition-all">
                    <div className="relative aspect-square bg-secondary rounded-md mb-4 flex items-center justify-center overflow-hidden">
                      {product.image?.url ? (
                        <img src={product.image.url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl text-muted-foreground/30 font-mono">{product.category[0]}</span>
                      )}
                      <div className="spec-overlay crosshair-cursor">
                        <div className="text-center">
                          <div className="text-xs font-mono text-blueprint mb-1">{product.dimensions}</div>
                          <div className="text-xs font-mono text-blueprint">{product.tolerance}</div>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-2">{product.name}</h3>
                    <div className="space-y-1 text-xs font-mono text-muted-foreground">
                      <div className="flex justify-between"><span>Material</span><span className="text-primary">{product.material}</span></div>
                      <div className="flex justify-between"><span>Dims</span><span className="text-primary">{product.dimensions}</span></div>
                      <div className="flex justify-between"><span>Tolerance</span><span className="text-primary">{product.tolerance}</span></div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="machined-block max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-mono text-blueprint uppercase mb-1">{selected.category}</p>
                  <h2 className="text-2xl font-bold text-foreground">{selected.name}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1"><X size={20} /></button>
              </div>

              <div className="aspect-video bg-secondary rounded-md mb-6 flex items-center justify-center overflow-hidden">
                {selected.image?.url ? (
                  <img src={selected.image.url} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground/40 font-mono">No Image</span>
                )}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{selected.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[["Material", selected.material], ["Dimensions", selected.dimensions], ["Tolerance", selected.tolerance], ["Category", selected.category]].map(([label, value]) => (
                  <div key={label} className="bg-secondary rounded-md p-3">
                    <div className="text-xs text-muted-foreground mb-1">{label}</div>
                    <div className="text-sm font-mono text-primary">{value}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link to="/request" className="cta-button inline-flex items-center gap-2 text-sm flex-1 justify-center">
                  <Send size={16} /> Request Inquiry
                </Link>
                {selected.specSheetUrl && (
                  <a href={selected.specSheetUrl} target="_blank" rel="noreferrer"
                    className="primary-button inline-flex items-center gap-2 text-sm">
                    <Download size={16} /> Spec Sheet
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Products;
