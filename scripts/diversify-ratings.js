require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/productModel");

const updateRatings = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected Successfully.");

        const products = await Product.find({});
        console.log(`Found ${products.length} products to process.`);

        let count4_0 = 0;
        let count4_5 = 0;
        let count5_0 = 0;

        for (const product of products) {
            // Assign ratings randomly from weighted distribution:
            // 40% get 4.0, 35% get 4.5, 25% get 5.0
            const random = Math.random(); // 0 to 1
            let newRating = "4.0"; // fallback

            if (random < 0.40) {
                newRating = "4.0";
                count4_0++;
            } else if (random < 0.75) {   // 0.40 + 0.35 = 0.75
                newRating = "4.5";
                count4_5++;
            } else {
                newRating = "5.0";
                count5_0++;
            }

            // Randomize review count between 12 and 180 per product
            const randomReviewCount = Math.floor(Math.random() * (180 - 12 + 1)) + 12;

            product.totalrating = newRating;
            product.reviewCount = randomReviewCount;
            
            await product.save();
        }

        console.log("--- Update Complete ---");
        console.log(`Assigned 4.0 to ${count4_0} products.`);
        console.log(`Assigned 4.5 to ${count4_5} products.`);
        console.log(`Assigned 5.0 to ${count5_0} products.`);
        console.log("-----------------------");

        process.exit(0);

    } catch (error) {
        console.error("Error updating ratings", error);
        process.exit(1);
    }
};

updateRatings();
