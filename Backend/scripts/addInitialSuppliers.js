import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";
import dotenv from "dotenv";

dotenv.config();

const initialSuppliers = [
  {
    name: "MediCare Pharmaceuticals",
    email: "contact@medicare-pharma.com",
    phone: "+94-11-2345678",
    address: "123 Main Street, Colombo 01, Sri Lanka",
    company: "MediCare Pharmaceuticals Ltd",
    contactPerson: "Dr. Sarah Johnson",
    specialties: ["antibiotics", "pain_relief", "vitamins"],
    rating: 5,
    notes: "Primary supplier for antibiotics and pain relief medications"
  },
  {
    name: "HealthFirst Supplies",
    email: "orders@healthfirst.com",
    phone: "+94-11-3456789",
    address: "456 Business Avenue, Kandy, Sri Lanka",
    company: "HealthFirst Medical Supplies",
    contactPerson: "Mr. Rajesh Kumar",
    specialties: ["surgical_supplies", "equipment", "first_aid"],
    rating: 4,
    notes: "Specialized in surgical supplies and medical equipment"
  },
  {
    name: "VitaMed Solutions",
    email: "info@vitamed.lk",
    phone: "+94-11-4567890",
    address: "789 Health Road, Galle, Sri Lanka",
    company: "VitaMed Healthcare Solutions",
    contactPerson: "Ms. Priya Fernando",
    specialties: ["vitamins", "supplements", "pediatric_medicines"],
    rating: 5,
    notes: "Leading supplier for vitamins and pediatric medicines"
  },
  {
    name: "PharmaTech Industries",
    email: "sales@pharmatech.com",
    phone: "+94-11-5678901",
    address: "321 Industrial Zone, Jaffna, Sri Lanka",
    company: "PharmaTech Industries Pvt Ltd",
    contactPerson: "Dr. Arjun Singh",
    specialties: ["generic_medicines", "diabetes", "cardiology"],
    rating: 4,
    notes: "Specialized in generic medicines and chronic disease medications"
  },
  {
    name: "Global Medical Supplies",
    email: "orders@globalmed.com",
    phone: "+94-11-6789012",
    address: "654 International Drive, Negombo, Sri Lanka",
    company: "Global Medical Supplies Co",
    contactPerson: "Mr. David Wilson",
    specialties: ["specialty_medicines", "oncology", "rare_diseases"],
    rating: 5,
    notes: "International supplier for specialty and rare disease medications"
  }
];

const addInitialSuppliers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/pharmacy", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing suppliers (optional - remove this if you want to keep existing)
    // await Supplier.deleteMany({});
    // console.log("Cleared existing suppliers");

    // Check if suppliers already exist
    const existingSuppliers = await Supplier.find({});
    if (existingSuppliers.length > 0) {
      console.log(`Found ${existingSuppliers.length} existing suppliers. Skipping addition.`);
      console.log("Existing suppliers:");
      existingSuppliers.forEach(supplier => {
        console.log(`- ${supplier.name} (${supplier.email})`);
      });
      return;
    }

    // Add new suppliers
    const addedSuppliers = await Supplier.insertMany(initialSuppliers);
    console.log(`Successfully added ${addedSuppliers.length} suppliers:`);
    
    addedSuppliers.forEach(supplier => {
      console.log(`- ${supplier.name} (${supplier.email})`);
    });

    console.log("Initial suppliers setup completed successfully!");
  } catch (error) {
    console.error("Error adding initial suppliers:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script
addInitialSuppliers(); 