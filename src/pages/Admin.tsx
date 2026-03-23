import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Wrench, Users, MessageSquare, LogOut, Settings,
  Plus, Pencil, Trash2, Eye, Download, Filter, Search, ChevronRight,
  Loader2, ImageOff, Mail, X, CheckCircle, AlertCircle, FileText,
  Image, File
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  productsAPI, servicesAPI, clientsAPI,
  enquiriesAPI, contactAPI
} from "@/lib/api";

// ==================== TYPES ====================
interface Product {
  _id: string;
  name: string;
  category: string;
  material: string;
  dimensions: string;
  tolerance: string;
  description: string;
  image?: { url: string; publicId: string };
  gallery?: { url: string; publicId: string }[];
  specSheetUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface Service {
  _id: string;
  title: string;
  description: string;
  benefits: string[];
  caseStudy?: { client: string; result: string };
  image?: { url: string; publicId: string };
  isActive: boolean;
  createdAt: string;
}

interface Client {
  _id: string;
  name: string;
  industry: string;
  logo?: { url: string; publicId: string };
  testimonial?: { quote: string; authorName: string; authorRole: string };
  isActive: boolean;
  createdAt: string;
}

interface Enquiry {
  _id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  partsDescription: string;
  quantity: number;
  material: string;
  deadline: string;
  dimensions?: { length: number; width: number; height: number; unit: string };
  tolerance: string;
  status: string;
  attachments?: { url: string; publicId: string; filename: string; resourceType: string }[];
  adminNotes: string;
  quotedPrice: number;
  createdAt: string;
}

interface ContactMessage {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ==================== STATUS COLORS ====================
const statusColors: Record<string, string> = {
  Pending: "bg-tungsten/10 text-tungsten",
  "In Review": "bg-blueprint/10 text-blueprint",
  Quoted: "bg-primary/10 text-primary",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

// ==================== SHARED HELPERS ====================
const handleImageChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setPreview: (url: string) => void,
  setFile: (file: File) => void
) => {
  const file = e.target.files?.[0];
  if (file) {
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }
};

const inputClass =
  "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

const labelClass = "text-xs font-mono text-muted-foreground block mb-2";

// ==================== SHARED COMPONENTS ====================
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 size={32} className="animate-spin text-primary" />
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-border">
    {[1, 2, 3, 4, 5].map((i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-muted animate-pulse rounded-md" />
      </td>
    ))}
  </tr>
);

const SkeletonCard = () => (
  <div className="machined-block p-5 animate-pulse">
    <div className="h-4 bg-muted rounded-md mb-2 w-3/4" />
    <div className="h-3 bg-muted rounded-md w-1/2" />
  </div>
);

const ConfirmDialog = ({
  isOpen, onConfirm, onCancel, title, message,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="machined-block p-6 max-w-sm w-full"
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle size={20} className="text-destructive" />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-border rounded-md text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-destructive text-white rounded-md hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==================== ADMIN LOGIN ====================
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("admin@yogiraj.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      onLogin();
      toast.success("Logged in successfully");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="machined-block p-8 w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-6">
          <Settings size={24} className="text-primary" />
          <h1 className="text-xl font-bold">
            <span className="text-primary">Yogiraj</span> Admin Panel
          </h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {error && (
            <p className="text-xs text-destructive font-mono">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="primary-button w-full flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <Link
          to="/"
          className="block text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
        >
          ← Back to website
        </Link>
      </motion.div>
    </div>
  );
};

// ==================== DASHBOARD TAB ====================
const DashboardTab = () => {
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    pendingEnquiries: 0,
    activeProducts: 0,
    unreadMessages: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [enquiriesRes, productsRes, messagesRes] = await Promise.all([
          enquiriesAPI.getAll(),
          productsAPI.getAll(),
          contactAPI.getAll(),
        ]);
        const enquiries: Enquiry[] = enquiriesRes.data.data;
        const products: Product[] = productsRes.data.data;
        const messages: ContactMessage[] = messagesRes.data.data;

        setStats({
          totalEnquiries: enquiries.length,
          pendingEnquiries: enquiries.filter((e) => e.status === "Pending").length,
          activeProducts: products.filter((p) => p.isActive).length,
          unreadMessages: messages.filter((m) => !m.isRead).length,
        });
        setRecentEnquiries(enquiries.slice(0, 5));
        setRecentProducts(products.slice(0, 5));
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Enquiries", value: stats.totalEnquiries, change: "All time" },
          { label: "Pending Review", value: stats.pendingEnquiries, change: "Need attention" },
          { label: "Active Products", value: stats.activeProducts, change: "In catalog" },
          { label: "Unread Messages", value: stats.unreadMessages, change: "Contact form" },
        ].map((stat) => (
          <div key={stat.label} className="machined-block p-5">
            <p className="text-xs text-muted-foreground font-mono mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-accent mt-1">{stat.change}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="machined-block p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Enquiries</h3>
          <div className="space-y-3">
            {recentEnquiries.length === 0 && (
              <p className="text-sm text-muted-foreground">No enquiries yet.</p>
            )}
            {recentEnquiries.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{e.company}</p>
                  <p className="text-xs text-muted-foreground">{e.partsDescription?.slice(0, 40)}...</p>
                </div>
                <span className={`text-xs font-mono px-2 py-1 rounded-md ${statusColors[e.status]}`}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="machined-block p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Products</h3>
          <div className="space-y-3">
            {recentProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">No products yet.</p>
            )}
            {recentProducts.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  {p.image?.url ? (
                    <img
                      src={p.image.url}
                      alt={p.name}
                      className="w-8 h-8 rounded-md object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                      <ImageOff size={14} className="text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category} · {p.material}</p>
                  </div>
                </div>
                <span className={`text-xs font-mono ${p.isActive ? "text-accent" : "text-muted-foreground"}`}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== ENQUIRIES TAB ====================
const EnquiriesTab = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "All" ? { status: statusFilter } : {};
      const res = await enquiriesAPI.getAll(params);
      setEnquiries(res.data.data);
    } catch (err) {
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnquiries(); }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await enquiriesAPI.update(id, { status: newStatus });
      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await enquiriesAPI.delete(id);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      toast.success("Enquiry deleted");
    } catch {
      toast.error("Failed to delete enquiry");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setSavingNotes(true);
    try {
      await enquiriesAPI.update(selectedEnquiry._id, {
        adminNotes,
        quotedPrice: Number(quotedPrice),
      });
      toast.success("Notes saved");
      setEnquiries((prev) =>
        prev.map((e) =>
          e._id === selectedEnquiry._id
            ? { ...e, adminNotes, quotedPrice: Number(quotedPrice) }
            : e
        )
      );
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Company", "Contact", "Email", "Phone", "Parts", "Material", "Quantity", "Status", "Date"];
    const rows = enquiries.map((e) => [
      e.company, e.contactName, e.email, e.phone,
      e.partsDescription, e.material, e.quantity, e.status,
      new Date(e.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enquiries.csv";
    a.click();
  };

  const filtered = enquiries.filter(
    (e) =>
      searchQuery === "" ||
      e.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (resourceType: string, filename: string) => {
    if (resourceType === "image") return <Image size={14} className="text-blueprint" />;
    if (filename?.endsWith(".pdf")) return <FileText size={14} className="text-destructive" />;
    return <File size={14} className="text-muted-foreground" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
        <button
          onClick={exportCSV}
          className="primary-button text-sm inline-flex items-center gap-2"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company or contact..."
            className="w-full bg-secondary border border-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Filter size={16} className="text-muted-foreground" />
          {["All", "Pending", "In Review", "Quoted", "Completed", "Cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                statusFilter === s
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="machined-block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Company</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Contact</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Parts</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Date</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Status</th>
              <th className="text-right text-xs font-mono text-muted-foreground px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && [1, 2, 3].map((i) => <SkeletonRow key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  No enquiries found.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((e) => (
                <tr
                  key={e._id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{e.company}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{e.contactName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate">
                    {e.partsDescription}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={e.status}
                      onChange={(ev) => handleStatusChange(e._id, ev.target.value)}
                      className={`text-xs font-mono px-2 py-1 rounded-md border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${statusColors[e.status]}`}
                    >
                      {["Pending", "In Review", "Quoted", "Completed", "Cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      onClick={() => {
                        setSelectedEnquiry(e);
                        setAdminNotes(e.adminNotes || "");
                        setQuotedPrice(e.quotedPrice ? String(e.quotedPrice) : "");
                      }}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(e._id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Enquiry Detail Modal */}
      <AnimatePresence>
        {selectedEnquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedEnquiry(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="machined-block max-w-2xl w-full p-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-mono text-blueprint uppercase mb-1">Enquiry Detail</p>
                  <h2 className="text-xl font-bold text-foreground">{selectedEnquiry.company}</h2>
                </div>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  ["Contact", selectedEnquiry.contactName],
                  ["Email", selectedEnquiry.email],
                  ["Phone", selectedEnquiry.phone || "—"],
                  ["Material", selectedEnquiry.material || "—"],
                  ["Quantity", String(selectedEnquiry.quantity || "—")],
                  ["Deadline", selectedEnquiry.deadline ? new Date(selectedEnquiry.deadline).toLocaleDateString() : "—"],
                  ["Tolerance", selectedEnquiry.tolerance || "—"],
                  ["Status", selectedEnquiry.status],
                ].map(([label, value]) => (
                  <div key={label} className="bg-secondary rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-sm font-mono text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {selectedEnquiry.dimensions && (
                <div className="bg-secondary rounded-md p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Dimensions</p>
                  <p className="text-sm font-mono text-foreground">
                    {selectedEnquiry.dimensions.length} × {selectedEnquiry.dimensions.width} × {selectedEnquiry.dimensions.height} {selectedEnquiry.dimensions.unit}
                  </p>
                </div>
              )}

              <div className="bg-secondary rounded-md p-3 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Parts Description</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedEnquiry.partsDescription}</p>
              </div>

              {selectedEnquiry.attachments && selectedEnquiry.attachments.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-mono text-muted-foreground mb-2">Attachments ({selectedEnquiry.attachments.length})</p>
                  <div className="space-y-2">
                    {selectedEnquiry.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline bg-secondary rounded-md px-3 py-2"
                      >
                        {getFileIcon(att.resourceType, att.filename)}
                        {att.filename || `Attachment ${i + 1}`}
                        <Download size={12} className="ml-auto text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div>
                  <label className={labelClass}>Admin Notes</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Internal notes about this enquiry..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Quoted Price (USD)</label>
                  <input
                    type="number"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="primary-button text-sm inline-flex items-center gap-2"
                >
                  {savingNotes && <Loader2 size={14} className="animate-spin" />}
                  Save Notes
                </button>
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Re: Your Yogiraj Enquiry`}
                  className="cta-button text-sm inline-flex items-center gap-2"
                >
                  <Mail size={14} /> Reply by Email
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
};

// ==================== PRODUCTS TAB ====================
const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "", category: "Gears", material: "Steel",
    dimensions: "", tolerance: "", description: "", isActive: true,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = categoryFilter !== "All" ? { category: categoryFilter } : {};
      const res = await productsAPI.getAll(params);
      setProducts(res.data.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [categoryFilter]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: "", category: "Gears", material: "Steel", dimensions: "", tolerance: "", description: "", isActive: true });
    setImagePreview("");
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, category: product.category, material: product.material,
      dimensions: product.dimensions || "", tolerance: product.tolerance || "",
      description: product.description || "", isActive: product.isActive,
    });
    setImagePreview(product.image?.url || "");
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
      if (imageFile) formData.append("image", imageFile);

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, formData);
        toast.success("Product updated successfully");
      } else {
        await productsAPI.create(formData);
        toast.success("Product created successfully");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const formData = new FormData();
      formData.append("isActive", String(!product.isActive));
      await productsAPI.update(product._id, formData);
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: !p.isActive } : p))
      );
      toast.success(`Product ${!product.isActive ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setConfirmDelete(null);
    }
  };

  const categories = ["All", "Gears", "Shafts", "Bearings", "Housings", "Brackets"];

  const filtered = products.filter(
    (p) =>
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <button onClick={openAdd} className="cta-button text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-secondary border border-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                categoryFilter === c
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="machined-block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Image</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Name</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Category</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Material</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Tolerance</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Status</th>
              <th className="text-right text-xs font-mono text-muted-foreground px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && [1, 2, 3].map((i) => <SkeletonRow key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                  No products found.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    {p.image?.url ? (
                      <img
                        src={p.image.url}
                        alt={p.name}
                        className="w-10 h-10 rounded-md object-cover border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                        <ImageOff size={16} className="text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{p.material}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{p.tolerance}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`text-xs font-mono ${p.isActive ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(p._id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="machined-block max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-foreground">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                      {["Gears", "Shafts", "Bearings", "Housings", "Brackets"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Material</label>
                    <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className={inputClass}>
                      {["Steel", "Aluminum", "Titanium", "Custom"].map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Dimensions</label>
                    <input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} className={inputClass} placeholder="e.g. Ø120×25mm" />
                  </div>
                  <div>
                    <label className={labelClass}>Tolerance</label>
                    <input value={form.tolerance} onChange={(e) => setForm({ ...form, tolerance: e.target.value })} className={inputClass} placeholder="e.g. ±0.005mm" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>Product Image</label>
                  <input
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageChange(e, setImagePreview, setImageFile)}
                    className="w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2 relative w-24 h-24">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md border border-border" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(""); setImageFile(null); }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="isActive" className="text-sm text-foreground">Active (visible in catalog)</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="primary-button flex-1 inline-flex items-center justify-center gap-2">
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
};

// ==================== SERVICES TAB ====================
const ServicesTab = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [benefitInput, setBenefitInput] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", benefits: [] as string[],
    caseStudyClient: "", caseStudyResult: "", isActive: true,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await servicesAPI.getAll();
      setServices(res.data.data);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => {
    setEditingService(null);
    setForm({ title: "", description: "", benefits: [], caseStudyClient: "", caseStudyResult: "", isActive: true });
    setImagePreview("");
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      title: service.title, description: service.description,
      benefits: service.benefits || [],
      caseStudyClient: service.caseStudy?.client || "",
      caseStudyResult: service.caseStudy?.result || "",
      isActive: service.isActive,
    });
    setImagePreview(service.image?.url || "");
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("caseStudy[client]", form.caseStudyClient);
      formData.append("caseStudy[result]", form.caseStudyResult);
      formData.append("isActive", String(form.isActive));
      form.benefits.forEach((b) => formData.append("benefits[]", b));
      if (imageFile) formData.append("image", imageFile);

      if (editingService) {
        await servicesAPI.update(editingService._id, formData);
        toast.success("Service updated successfully");
      } else {
        await servicesAPI.create(formData);
        toast.success("Service created successfully");
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await servicesAPI.delete(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success("Service deleted");
    } catch {
      toast.error("Failed to delete service");
    } finally {
      setConfirmDelete(null);
    }
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setForm({ ...form, benefits: [...form.benefits, benefitInput.trim()] });
      setBenefitInput("");
    }
  };

  const removeBenefit = (i: number) => {
    setForm({ ...form, benefits: form.benefits.filter((_, idx) => idx !== i) });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Services</h1>
        <button onClick={openAdd} className="cta-button text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}</div>}

      {!loading && services.length === 0 && (
        <p className="text-center py-20 text-muted-foreground">No services found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s._id} className="machined-block p-5">
            <div className="flex items-start gap-3 mb-3">
              {s.image?.url ? (
                <img src={s.image.url} alt={s.title} className="w-12 h-12 rounded-md object-cover border border-border" />
              ) : (
                <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center">
                  <Wrench size={20} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <span className={`text-xs font-mono ${s.isActive ? "text-accent" : "text-muted-foreground"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => openEdit(s)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Pencil size={16} /></button>
              <button onClick={() => setConfirmDelete(s._id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="machined-block max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-foreground">
                  {editingService ? "Edit Service" : "Add Service"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description *</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>Benefits</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                      placeholder="Add a benefit..."
                      className={`${inputClass} flex-1`}
                    />
                    <button type="button" onClick={addBenefit} className="primary-button text-xs px-3">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.benefits.map((b, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {b}
                        <button type="button" onClick={() => removeBenefit(i)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Case Study Client</label>
                  <input value={form.caseStudyClient} onChange={(e) => setForm({ ...form, caseStudyClient: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Case Study Result</label>
                  <textarea rows={2} value={form.caseStudyResult} onChange={(e) => setForm({ ...form, caseStudyResult: e.target.value })} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>Service Image</label>
                  <input
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageChange(e, setImagePreview, setImageFile)}
                    className="w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2 relative w-24 h-24">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md border border-border" />
                      <button type="button" onClick={() => { setImagePreview(""); setImageFile(null); }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center">
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="serviceActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <label htmlFor="serviceActive" className="text-sm text-foreground">Active</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="primary-button flex-1 inline-flex items-center justify-center gap-2">
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? "Saving..." : editingService ? "Update Service" : "Create Service"}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service?"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
};

// ==================== CLIENTS TAB ====================
const ClientsTab = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "", industry: "", quote: "",
    authorName: "", authorRole: "", isActive: true,
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await clientsAPI.getAll();
      setClients(res.data.data);
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const openAdd = () => {
    setEditingClient(null);
    setForm({ name: "", industry: "", quote: "", authorName: "", authorRole: "", isActive: true });
    setLogoPreview("");
    setLogoFile(null);
    setShowModal(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name, industry: client.industry || "",
      quote: client.testimonial?.quote || "",
      authorName: client.testimonial?.authorName || "",
      authorRole: client.testimonial?.authorRole || "",
      isActive: client.isActive,
    });
    setLogoPreview(client.logo?.url || "");
    setLogoFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("industry", form.industry);
      formData.append("testimonial[quote]", form.quote);
      formData.append("testimonial[authorName]", form.authorName);
      formData.append("testimonial[authorRole]", form.authorRole);
      formData.append("isActive", String(form.isActive));
      if (logoFile) formData.append("logo", logoFile);

      if (editingClient) {
        await clientsAPI.update(editingClient._id, formData);
        toast.success("Client updated successfully");
      } else {
        await clientsAPI.create(formData);
        toast.success("Client created successfully");
      }
      setShowModal(false);
      fetchClients();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await clientsAPI.delete(id);
      setClients((prev) => prev.filter((c) => c._id !== id));
      toast.success("Client deleted");
    } catch {
      toast.error("Failed to delete client");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Clients</h1>
        <button onClick={openAdd} className="cta-button text-sm inline-flex items-center gap-2">
          <Plus size={16} /> Add Client
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && clients.length === 0 && (
        <p className="text-center py-20 text-muted-foreground">No clients found.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {clients.map((c) => (
          <div key={c._id} className="machined-block p-4">
            <div className="flex flex-col items-center text-center mb-3">
              {c.logo?.url ? (
                <img src={c.logo.url} alt={c.name} className="w-16 h-16 object-contain rounded-md border border-border mb-2" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary font-bold text-xl">
                  {c.name[0]}
                </div>
              )}
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              {c.industry && <p className="text-xs text-muted-foreground">{c.industry}</p>}
              {c.testimonial?.quote && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">"{c.testimonial.quote}"</p>
              )}
            </div>
            <div className="flex gap-1 justify-center">
              <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
              <button onClick={() => setConfirmDelete(c._id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="machined-block max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-foreground">
                  {editingClient ? "Edit Client" : "Add Client"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Company Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Industry</label>
                  <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={inputClass} placeholder="e.g. Aerospace" />
                </div>
                <div>
                  <label className={labelClass}>Logo</label>
                  <input
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) => handleImageChange(e, setLogoPreview, setLogoFile)}
                    className="w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground cursor-pointer"
                  />
                  {logoPreview && (
                    <div className="mt-2 relative w-24 h-24">
                      <img src={logoPreview} alt="Logo preview" className="w-24 h-24 object-contain rounded-md border border-border" />
                      <button type="button" onClick={() => { setLogoPreview(""); setLogoFile(null); }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center">
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Testimonial Quote</label>
                  <textarea rows={3} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className={`${inputClass} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Author Name</label>
                    <input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Author Role</label>
                    <input value={form.authorRole} onChange={(e) => setForm({ ...form, authorRole: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="clientActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <label htmlFor="clientActive" className="text-sm text-foreground">Active</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="primary-button flex-1 inline-flex items-center justify-center gap-2">
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? "Saving..." : editingClient ? "Update Client" : "Add Client"}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client?"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
};

// ==================== CONTACT MESSAGES TAB ====================
const ContactMessagesTab = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await contactAPI.getAll();
      setMessages(res.data.data);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleOpen = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await contactAPI.markAsRead(msg._id);
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
        );
      } catch {
        // silent fail
      }
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Contact Messages</h1>
          {unreadCount > 0 && (
            <span className="bg-tungsten/10 text-tungsten text-xs font-mono px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      <div className="machined-block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Name</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Company</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Email</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Date</th>
              <th className="text-left text-xs font-mono text-muted-foreground px-4 py-3">Status</th>
              <th className="text-right text-xs font-mono text-muted-foreground px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && [1, 2, 3].map((i) => <SkeletonRow key={i} />)}
            {!loading && messages.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  No messages yet.
                </td>
              </tr>
            )}
            {!loading &&
              messages.map((m) => (
                <tr
                  key={m._id}
                  className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${!m.isRead ? "bg-primary/5" : ""}`}
                >
                  <td className={`px-4 py-3 text-sm ${!m.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                    {m.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{m.company || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono px-2 py-1 rounded-md ${
                      !m.isRead ? "bg-tungsten/10 text-tungsten" : "text-muted-foreground"
                    }`}>
                      {m.isRead ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpen(m)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="machined-block max-w-lg w-full p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs font-mono text-blueprint uppercase mb-1">Contact Message</p>
                  <h2 className="text-xl font-bold text-foreground">{selectedMessage.name}</h2>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  ["Email", selectedMessage.email],
                  ["Phone", selectedMessage.phone || "—"],
                  ["Company", selectedMessage.company || "—"],
                  ["Date", new Date(selectedMessage.createdAt).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className="bg-secondary rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="text-sm font-mono text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-secondary rounded-md p-4 mb-5">
                <p className="text-xs text-muted-foreground mb-2">Message</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedMessage.message}</p>
              </div>

              <a
                href={`mailto:${selectedMessage.email}?subject=Re: Your Yogiraj Enquiry`}
                className="cta-button text-sm inline-flex items-center gap-2 w-full justify-center"
              >
                <Mail size={16} /> Reply by Email
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== MAIN ADMIN DASHBOARD ====================
const sidebarItems = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "enquiries", icon: MessageSquare, label: "Enquiries" },
  { key: "products", icon: Package, label: "Products" },
  { key: "services", icon: Wrench, label: "Services" },
  { key: "clients", icon: Users, label: "Clients" },
  { key: "messages", icon: Mail, label: "Messages" },
];

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 bg-card border-r border-border flex flex-col fixed top-0 bottom-0 z-40">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Settings size={20} className="text-primary" />
          <span className="font-bold text-sm">
            <span className="text-primary">Yogiraj</span> Admin
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            <ChevronRight size={18} /> View Website
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-60 p-8 min-h-screen overflow-y-auto">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "enquiries" && <EnquiriesTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "clients" && <ClientsTab />}
        {activeTab === "messages" && <ContactMessagesTab />}
      </div>
    </div>
  );
};

// ==================== ROOT ADMIN COMPONENT ====================
const Admin = () => {
  const { isLoggedIn, loading, logout } = useAuth();
  const [localLoggedIn, setLocalLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) setLocalLoggedIn(true);
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!localLoggedIn && !isLoggedIn) {
    return <AdminLogin onLogin={() => setLocalLoggedIn(true)} />;
  }

  return (
    <AdminDashboard
      onLogout={() => {
        logout();
        setLocalLoggedIn(false);
      }}
    />
  );
};

export default Admin;