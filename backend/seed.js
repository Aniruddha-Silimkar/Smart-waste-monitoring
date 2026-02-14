const mongoose = require("mongoose");
const Dustbin = require("./models/Dustbin");

mongoose.connect(
  "mongodb+srv://admin:1234@cluster0.3cniunt.mongodb.net/smartbin?retryWrites=true&w=majority"
);

const seedData = [
  { id: 1, lat: 19.0222, lng: 72.8561 },
  { id: 2, lat: 19.0217, lng: 72.8556 },
  { id: 3, lat: 19.0197, lng: 72.8559 },
  { id: 4, lat: 19.0209, lng: 72.8560 },
  { id: 5, lat: 19.0226, lng: 72.8564 },
  { id: 6, lat: 19.0239, lng: 72.8568 },
];

async function seed() {
  await Dustbin.deleteMany(); // clear old data
  await Dustbin.insertMany(seedData);
  console.log("Dustbins inserted");
  mongoose.connection.close();
}

seed();
