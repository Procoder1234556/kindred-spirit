require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/productModel");

const reviewTemplates = [
    "Display fitted perfectly. Colours look identical to original. Delivered exactly on time.",
    "Installed the charging flex cable. It supports fast charging just like the OEM part.",
    "Battery replacement went smooth. It holds charge properly and health shows 100%.",
    "Screen replacement was easy. Touch response is very accurate and smooth. Highly recommended.",
    "The camera lens fit perfectly. No blurry edges or focus issues reported by the customer.",
    "Replaced the back glass. The adhesive provided was strong and fitment is 1:1 original.",
    "The speaker sounds exactly like OEM. No distortion even at maximum volume.",
    "Quality of the display assembly is top-notch. Brightness levels are indistinguishable from the factory screen.",
    "Ordered for a customer repair. Part worked flawlessly out of the box. Secure packaging.",
    "Sub-board works perfectly. Microphone array tested clear without any background static.",
    "Very satisfied with the digitizer quality. Saved me a lot of time on this repair.",
    "Perfect replacement. The ribbon cable aligns exactly with the mainboard connectors.",
    "Tested this battery under heavy load. Temperatures are strictly within normal limits.",
    "OLED screen contrast is fantastic. Deep blacks and vibrant colors as expected from high quality parts.",
    "Fixed the power button issue instantly. Tactile feedback is exactly like the original button.",
    "Wifi antenna replacement restored full signal strength. Good quality generic part.",
    "Receiver mesh and earpiece speaker combo solved the low volume issue perfectly.",
    "The glass quality is thick and durable. Customer was very happy with the repair outcome.",
    "Frame alignment was precise. Mainboard and screws fit straight in with zero adjustment needed.",
    "Excellent seller. The flex cables are clearly high grade. Will definitely order repair parts from here again."
];

const names = [
    "Ravi M.", "Amit K.", "Vishal S.", "Suresh R.", "Mohammed A.", 
    "Aarav T.", "Prakash N.", "Deepak C.", "Sanjay P.", "Rahul D.",
    "Nitin W.", "Vikram Y.", "Ashish G.", "Saurabh M.", "Raju V."
];

const cities = [
    "Jaipur", "Mumbai", "Delhi", "Bangalore", "Hyderabad", 
    "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune",
    "Lucknow", "Indore", "Bhopal", "Patna", "Coimbatore"
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate random date within last 6 months
function getRandomDate() {
    const end = new Date();
    const start = new Date(end.getTime() - (180 * 24 * 60 * 60 * 1000));
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const seedReviews = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected Successfully. Seeding reviews...");

        const products = await Product.find({});
        console.log(`Found ${products.length} products to process.`);

        let totalReviewsAdded = 0;

        for (const product of products) {
            // Determine how many reviews to add (3 to 5)
            const numReviews = Math.floor(Math.random() * 3) + 3;
            
            // Assume product has totalrating set from the diversify script.
            // We match individual review ratings to be closely matched with the general rating.
            // Defaulting to 4 if not set.
            const productRating = parseInt(product.totalrating) || 4;

            const seededRatings = [];

            for (let i = 0; i < numReviews; i++) {
                // Determine star rating: typically matches the product average (allow slight variance)
                let star = productRating;
                if (Math.random() > 0.7) { 
                    star = Math.min(5, star + 1); 
                } else if (Math.random() > 0.8) {
                    star = Math.max(1, star - 1);
                }

                seededRatings.push({
                    star: star,
                    reviewerName: getRandomItem(names),
                    city: getRandomItem(cities),
                    comment: getRandomItem(reviewTemplates),
                    date: getRandomDate()
                });
            }

            product.ratings = seededRatings;
            await product.save();
            totalReviewsAdded += numReviews;
        }

        console.log("--- Seeding Complete ---");
        console.log(`Successfully added ${totalReviewsAdded} reviews to ${products.length} products.`);
        console.log("------------------------");

        process.exit(0);

    } catch (error) {
        console.error("Error seeding reviews:", error);
        process.exit(1);
    }
};

seedReviews();
