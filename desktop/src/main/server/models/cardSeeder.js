const mongoose = require('mongoose');
const bingoCardsData = require('./BingoCardsData');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
// Define the BingoCard schema
const bingoCardSchema = new mongoose.Schema({
  cardId: { type: String, required: true },
  b1: { type: Number, required: true, min: 1, max: 15 },
  b2: { type: Number, required: true, min: 1, max: 15 },
  b3: { type: Number, required: true, min: 1, max: 15 },
  b4: { type: Number, required: true, min: 1, max: 15 },
  b5: { type: Number, required: true, min: 1, max: 15 },
  i1: { type: Number, required: true, min: 16, max: 30 },
  i2: { type: Number, required: true, min: 16, max: 30 },
  i3: { type: Number, required: true, min: 16, max: 30 },
  i4: { type: Number, required: true, min: 16, max: 30 },
  i5: { type: Number, required: true, min: 16, max: 30 },
  n1: { type: Number, required: true, min: 31, max: 45 },
  n2: { type: Number, required: true, min: 31, max: 45 },
  n3: { type: Number, default: 0 },
  n4: { type: Number, required: true, min: 31, max: 45 },
  n5: { type: Number, required: true, min: 31, max: 45 },
  g1: { type: Number, required: true, min: 46, max: 60 },
  g2: { type: Number, required: true, min: 46, max: 60 },
  g3: { type: Number, required: true, min: 46, max: 60 },
  g4: { type: Number, required: true, min: 46, max: 60 },
  g5: { type: Number, required: true, min: 46, max: 60 },
  o1: { type: Number, required: true, min: 61, max: 75 },
  o2: { type: Number, required: true, min: 61, max: 75 },
  o3: { type: Number, required: true, min: 61, max: 75 },
  o4: { type: Number, required: true, min: 61, max: 75 },
  o5: { type: Number, required: true, min: 61, max: 75 },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

// Create the BingoCard model
const BingoCard = mongoose.model('BingoCard', bingoCardSchema);

// Function to connect to MongoDB and insert cards
async function insertBingoCards(userId) {
  try {
    // Connect to MongoDB (replace with your MongoDB connection string)
    console.log('MongoDB connection string:', process.env.MONGOURL);
    await mongoose.connect(process.env.MONGOURL, {
      useNewUrlParser: true,
    });
    console.log('Connected to MongoDB');

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }

    // Iterate through each card and insert it
    for (const card of bingoCardsData.cards) {
      // Create a new card object with userId
      const newCard = {
        cardId: card.cardId,
        b1: card.b1,
        b2: card.b2,
        b3: card.b3,
        b4: card.b4,
        b5: card.b5,
        i1: card.i1,
        i2: card.i2,
        i3: card.i3,
        i4: card.i4,
        i5: card.i5,
        n1: card.n1,
        n2: card.n2,
        n3: card.n3,
        n4: card.n4,
        n5: card.n5,
        g1: card.g1,
        g2: card.g2,
        g3: card.g3,
        g4: card.g4,
        g5: card.g5,
        o1: card.o1,
        o2: card.o2,
        o3: card.o3,
        o4: card.o4,
        o5: card.o5,
        userId: userId,
      };

      // Insert the card into the database
      const bingoCard = new BingoCard(newCard);
      await bingoCard.save();
      console.log(`Inserted card with cardId: ${card.cardId}`);
    }

    console.log('All bingo cards inserted successfully');
  } catch (error) {
    console.error('Error inserting bingo cards:', error.message);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Execute the function with the provided userId
const userId = '680f236699aaeeda959450e3';
insertBingoCards(userId);


// const cardsWithUserId = bingoCardsData.cards.map(card => ({
//     ...card,
//     userId,
//   }));
//   await BingoCard.insertMany(cardsWithUserId);