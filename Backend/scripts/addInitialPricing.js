import mongoose from 'mongoose';
import hospitalPricingModel from '../models/hospitalPricing.js';
import dotenv from 'dotenv';

dotenv.config();

const initialPricing = [
  {
    specialty: 'Cardiology',
    consultationFee: 800,
    description: 'Heart and cardiovascular system specialist',
  },
  {
    specialty: 'Neurology',
    consultationFee: 750,
    description: 'Brain and nervous system specialist',
  },
  {
    specialty: 'Dermatology',
    consultationFee: 500,
    description: 'Skin, hair, and nail specialist',
  },
  {
    specialty: 'Pediatrics',
    consultationFee: 450,
    description: 'Children and adolescent specialist',
  },
  {
    specialty: 'Gynecology',
    consultationFee: 600,
    description: 'Women\'s reproductive health specialist',
  },
  {
    specialty: 'Orthopedics',
    consultationFee: 700,
    description: 'Bones, joints, and muscles specialist',
  },
  {
    specialty: 'General Physician',
    consultationFee: 400,
    description: 'General medical care and primary healthcare',
  },
  {
    specialty: 'Psychiatry',
    consultationFee: 650,
    description: 'Mental health and behavioral specialist',
  },
  {
    specialty: 'Ophthalmology',
    consultationFee: 550,
    description: 'Eye and vision specialist',
  },
  {
    specialty: 'ENT',
    consultationFee: 500,
    description: 'Ear, nose, and throat specialist',
  },
];

const addInitialPricing = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/pharmacy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing pricing data
    await hospitalPricingModel.deleteMany({});
    console.log('Cleared existing pricing data');

    // Add initial pricing data
    const pricingData = await hospitalPricingModel.insertMany(initialPricing);
    console.log(`Added ${pricingData.length} pricing configurations`);

    console.log('Initial pricing data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding initial pricing data:', error);
    process.exit(1);
  }
};

addInitialPricing(); 