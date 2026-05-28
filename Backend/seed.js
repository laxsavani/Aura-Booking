require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/category");

const mainCategories = [
  {
    name: "Massage Therapies",
    type: "Massage Therapies",
    description: "Massage therapy is the hands-on manipulation of the body's soft tissues—including muscles, tendons, ligaments, and fascia—using varying degrees of pressure to release tension and promote complete mind-body relaxation."
  },
  {
    name: "Facials & Skincare",
    type: "Facials & Skincare",
    description: "Rejuvenating skin treatments, deep cleansing facials, and advanced peels designed to restore hydration, target skin concerns, and reveal a radiant, glowing complexion."
  },
  {
    name: "Body Treatments",
    type: "Body Treatments",
    description: "Hydrating body scrubs, detoxifying seaweed wraps, and exfoliating therapies that nourish the skin, stimulate circulation, and renew the body from head to toe."
  },
  {
    name: "Nail Care",
    type: "Nail Care",
    description: "Deluxe manicures and pedicures featuring aromatic soaks, therapeutic scrubs, detailed nail shaping, cuticle care, relaxing massages, and high-shine polish."
  },
  {
    name: "Salon & Waxing",
    type: "Salon & Waxing",
    description: "Precision hair styling, professional blowouts, and gentle wax treatments designed to leave your skin ultra-smooth and silky with long-lasting premium care."
  },
  {
    name: "Spa Packages",
    type: "Spa Packages",
    description: "Curated full-day escapes and signature spa rituals combining multiple luxury treatments for the ultimate, immersive mind-and-body wellness experience."
  },
  {
    name: "Specialty/Med-Spa Treatments",
    type: "Specialty/Med-Spa Treatments",
    description: "Advanced, non-invasive therapeutic treatments using modern technology and clinical-grade formulations to lift, contour, and deliver transformative skincare results."
  }
];

const seedCategoriesOnly = async () => {
  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      family: 4
    };

    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI, opts);
    console.log("✅ Connected to MongoDB.");

    console.log("\nSeeding categories only...");
    let createdCount = 0;
    let updatedCount = 0;

    for (const cat of mainCategories) {
      let doc = await Category.findOne({ name: cat.name });
      if (doc) {
        doc.type = cat.type;
        doc.description = cat.description;
        await doc.save();
        console.log(`Updated category: "${cat.name}"`);
        updatedCount++;
      } else {
        await Category.create(cat);
        console.log(`Created category: "${cat.name}" [${cat.type}]`);
        createdCount++;
      }
    }

    // Clean up any outdated categories not part of the main classifications
    const mainCategoryNames = mainCategories.map(c => c.name);
    const deleteCatRes = await Category.deleteMany({ name: { $nin: mainCategoryNames } });
    if (deleteCatRes.deletedCount > 0) {
      console.log(`Removed ${deleteCatRes.deletedCount} outdated categories.`);
    }

    console.log(`\n🎉 Category Seeding Completed!`);
    console.log(`Successfully created: ${createdCount}`);
    console.log(`Successfully updated: ${updatedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Category seeding failed:", error);
    process.exit(1);
  }
};

seedCategoriesOnly();
