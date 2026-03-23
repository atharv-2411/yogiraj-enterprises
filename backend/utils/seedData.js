require("dotenv").config();
const mongoose = require("mongoose");

// ─── Seed Data ────────────────────────────────────────────────────────────────

const productsSeed = [
  {
    name: "Spur Gear Assembly",
    category: "Gears",
    material: "Steel",
    dimensions: "Ø120 × 25mm",
    tolerance: "±0.005mm",
    description:
      "High-precision spur gear for power transmission systems. Heat-treated 4140 steel with ground tooth profiles ensures consistent meshing and minimal backlash. Suitable for industrial gearboxes, conveyor drives, and automation equipment.",
    isActive: true,
  },
  {
    name: "Drive Shaft",
    category: "Shafts",
    material: "Steel",
    dimensions: "Ø45 × 380mm",
    tolerance: "±0.002mm",
    description:
      "Precision-ground drive shaft with keyway. Chrome-vanadium steel, hardened to 58 HRC for maximum wear resistance. Designed for high-torque applications in industrial machinery and automotive drivetrains.",
    isActive: true,
  },
  {
    name: "Radial Ball Bearing",
    category: "Bearings",
    material: "Steel",
    dimensions: "Ø62 × Ø30 × 16mm",
    tolerance: "±0.001mm",
    description:
      "Deep groove ball bearing with sealed design. ABEC-7 precision class for low noise and vibration. Pre-lubricated with high-temperature grease. Ideal for electric motors, pumps, and precision instruments.",
    isActive: true,
  },
  {
    name: "Motor Housing",
    category: "Housings",
    material: "Aluminum",
    dimensions: "180 × 180 × 220mm",
    tolerance: "±0.01mm",
    description:
      "CNC machined motor housing with integrated cooling fins. 6061-T6 aluminum alloy for excellent strength-to-weight ratio. Anodized finish for corrosion resistance. Compatible with NEMA 56 frame motors.",
    isActive: true,
  },
  {
    name: "L-Bracket Heavy Duty",
    category: "Brackets",
    material: "Steel",
    dimensions: "150 × 100 × 8mm",
    tolerance: "±0.05mm",
    description:
      "Structural mounting bracket for industrial equipment. A36 steel with zinc plating for corrosion protection. Pre-drilled mounting holes with countersinks. Load rated to 2,500 kg static load.",
    isActive: true,
  },
  {
    name: "Helical Gear",
    category: "Gears",
    material: "Steel",
    dimensions: "Ø95 × 30mm",
    tolerance: "±0.003mm",
    description:
      "Precision helical gear with 20° helix angle for smooth, quiet operation. Case-hardened 8620 steel with carburized tooth flanks. Reduced noise and vibration compared to spur gears. Suitable for high-speed power transmission.",
    isActive: true,
  },
  {
    name: "Titanium Coupling",
    category: "Shafts",
    material: "Titanium",
    dimensions: "Ø50 × 65mm",
    tolerance: "±0.005mm",
    description:
      "Flexible coupling for high-temperature applications up to 600°C. Grade 5 titanium (Ti-6Al-4V) for exceptional strength and corrosion resistance. Jaw-type design accommodates angular and parallel misalignment.",
    isActive: true,
  },
  {
    name: "Valve Housing",
    category: "Housings",
    material: "Aluminum",
    dimensions: "120 × 80 × 95mm",
    tolerance: "±0.008mm",
    description:
      "Precision valve body with multi-port configuration. 7075-T6 aluminum for high-pressure applications up to 350 bar. Hard anodized internal bores for wear resistance. Threaded ports to SAE J1926 standard.",
    isActive: true,
  },
];

const servicesSeed = [
  {
    title: "CNC Machining",
    description:
      "Multi-axis CNC machining for complex geometries with tolerances to ±0.001mm. Our fleet of 5-axis machines handles everything from one-off prototypes to production runs of 100,000+ units. We operate 24/7 with unmanned overnight runs to meet tight deadlines.",
    benefits: [
      "5-axis simultaneous machining",
      "Tolerances to ±0.001mm",
      "Production volumes up to 100K+",
      "24/7 unmanned operation",
    ],
    caseStudy: {
      client: "Global Aerospace Co.",
      result:
        "Reduced part rejection rate from 3.2% to 0.1% across 50,000-unit annual production run, saving $420,000 in rework costs.",
    },
    icon: "Cpu",
    order: 1,
    isActive: true,
  },
  {
    title: "Rapid Prototyping",
    description:
      "From CAD to functional prototype in 48 hours. We bridge the gap between design intent and physical validation. Our engineering team reviews designs for manufacturability before cutting metal, saving you costly redesign cycles.",
    benefits: [
      "48-hour turnaround",
      "Functional metal prototypes",
      "Design for manufacturability review",
      "Multiple iteration support",
    ],
    caseStudy: {
      client: "Medical Device Startup",
      result:
        "Delivered 12 prototype iterations in 6 weeks, accelerating FDA submission by 4 months and reducing time-to-market by 30%.",
    },
    icon: "Target",
    order: 2,
    isActive: true,
  },
  {
    title: "Custom Fabrication",
    description:
      "End-to-end custom manufacturing for parts that don't exist in any catalog. Our engineering team optimizes designs for manufacturability, reducing cost without compromising performance. We handle everything from raw material sourcing to final inspection.",
    benefits: [
      "Complete DFM analysis",
      "Material selection guidance",
      "Assembly integration support",
      "Volume scalability",
    ],
    caseStudy: {
      client: "Industrial Automation Corp.",
      result:
        "Consolidated a 7-part assembly into a single machined component, reducing assembly time by 60% and part cost by 35%.",
    },
    icon: "Zap",
    order: 3,
    isActive: true,
  },
  {
    title: "Quality Assurance",
    description:
      "ISO 9001:2015 certified quality management system with full CMM inspection, first article reports, and material traceability from mill certificate to finished part. Every batch ships with a full inspection report.",
    benefits: [
      "ISO 9001:2015 certified",
      "Full CMM inspection",
      "Material traceability",
      "First article inspection reports",
    ],
    caseStudy: {
      client: "Defense Contractor",
      result:
        "Maintained 99.97% quality acceptance rate across a 3-year contract with zero field failures, supporting mission-critical applications.",
    },
    icon: "Shield",
    order: 4,
    isActive: true,
  },
];

const defaultAdmin = {
  email: "admin@yogiraj.com",
  password: "Admin@123",
  name: "Yogiraj Admin",
  role: "admin",
};

// ─── Core seed logic (no DB connect / no process.exit) ───────────────────────

const seedCollections = async () => {
  const Product = require("../models/Product");
  const Service = require("../models/Service");
  const Admin = require("../models/Admin");

  // Seed admin
  const existingAdmin = await Admin.findOne({ email: defaultAdmin.email });
  if (!existingAdmin) {
    await Admin.create(defaultAdmin);
    console.log(`[Seed] Default admin created: ${defaultAdmin.email}`);
  } else {
    console.log("[Seed] Admin already exists, skipping");
  }

  // Seed products
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(productsSeed);
    console.log(`[Seed] Inserted ${productsSeed.length} products`);
  } else {
    console.log(`[Seed] Products already exist (${productCount}), skipping`);
  }

  // Seed services
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(servicesSeed);
    console.log(`[Seed] Inserted ${servicesSeed.length} services`);
  } else {
    console.log(`[Seed] Services already exist (${serviceCount}), skipping`);
  }

  console.log("[Seed] Seeding complete");
};

// ─── Seed Runner (standalone execution) ───────────────────────────────────────

const runSeed = async () => {
  // When called from server.js, DB is already connected — skip reconnect
  if (mongoose.connection.readyState === 1) {
    return seedCollections();
  }

  // Standalone: connect, seed, then exit
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[Seed] MongoDB connected");
    await seedCollections();
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Error:", error.message);
    process.exit(1);
  }
};

// Run directly: node utils/seedData.js
if (require.main === module) {
  runSeed();
}

module.exports = { productsSeed, servicesSeed, defaultAdmin, runSeed };
