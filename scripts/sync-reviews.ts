import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define minimal schemas for the script to use
const reviewSchema = new mongoose.Schema({
  stylistId: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true },
  isDeleted: { type: Boolean, default: false },
});

const serviceSchema = new mongoose.Schema({
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

const stylistSchema = new mongoose.Schema({
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

async function syncRatings() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/saloon';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
    const Stylist = mongoose.models.Stylist || mongoose.model('Stylist', stylistSchema);
    const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

    // Aggregate reviews by stylist
    const aggregations = await Review.aggregate([
      { $match: { isDeleted: false } }, // Ensure we only count active reviews
      {
        $group: {
          _id: '$stylistId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    console.log(`Found ${aggregations.length} stylists with reviews to sync.`);

    // Update each stylist
    for (const agg of aggregations) {
      if (!agg._id) continue;

      const roundedRating = Math.round(agg.averageRating * 10) / 10;

      await Stylist.findByIdAndUpdate(agg._id, {
        rating: roundedRating,
        reviewCount: agg.totalReviews,
      });

      console.log(
        `Updated stylist ${agg._id} - Rating: ${roundedRating}, Reviews: ${agg.totalReviews}`,
      );
    }

    // Also reset anyone without reviews to 0
    const stylistIdsWithReviews = aggregations.map((a) => a._id);
    const resetResult = await Stylist.updateMany(
      { _id: { $nin: stylistIdsWithReviews } },
      { $set: { rating: 0, reviewCount: 0 } },
    );
    console.log(`Reset ${resetResult.modifiedCount} stylists with 0 reviews.`);

    // Aggregate reviews by service
    const serviceAggregations = await Review.aggregate([
      { $match: { isDeleted: false, serviceId: { $ne: null } } },
      {
        $group: {
          _id: '$serviceId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    console.log(`Found ${serviceAggregations.length} services with reviews to sync.`);

    // Update each service
    for (const agg of serviceAggregations) {
      if (!agg._id) continue;

      const roundedRating = Math.round(agg.averageRating * 10) / 10;

      await Service.findByIdAndUpdate(agg._id, {
        rating: roundedRating,
        reviewCount: agg.totalReviews,
      });

      console.log(
        `Updated service ${agg._id} - Rating: ${roundedRating}, Reviews: ${agg.totalReviews}`,
      );
    }

    const serviceIdsWithReviews = serviceAggregations.map((a) => a._id);
    const serviceResetResult = await Service.updateMany(
      { _id: { $nin: serviceIdsWithReviews } },
      { $set: { rating: 0, reviewCount: 0 } },
    );
    console.log(`Reset ${serviceResetResult.modifiedCount} services with 0 reviews.`);

    console.log('Sync complete.');
  } catch (error) {
    console.error('Error syncing ratings:', error);
  } finally {
    await mongoose.disconnect();
  }
}

syncRatings();
