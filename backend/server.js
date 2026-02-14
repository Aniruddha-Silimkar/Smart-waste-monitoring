// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(
//   "mongodb+srv://admin:1234@cluster0.3cniunt.mongodb.net/smartbin?retryWrites=true&w=majority"
// )
// .then(() => console.log("MongoDB Connected"))
// .catch((err) => console.log(err));

// // Test route
// app.get("/", (req, res) => {
//   res.send("Backend running");
// });

// // Start server
// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });


// const Dustbin = require("./models/Dustbin");

// app.get("/dustbins", async (req, res) => {
//   const bins = await Dustbin.find();
//   res.json(bins);
// });




// app.post("/update-dustbin", async (req, res) => {
//   const { id, level, percentage } = req.body;

//   try {
//     const bin = await Dustbin.findOneAndUpdate(
//       { id: id },
//       {
//         level,
//         percentage,
//         updatedAt: "Just now",
//       },
//       { new: true }
//     );

//     res.json(bin);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



















const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Import Model
const Dustbin = require("./models/Dustbin");

// MongoDB Connection
mongoose.connect(
  "mongodb+srv://admin:1234@cluster0.3cniunt.mongodb.net/smartbin?retryWrites=true&w=majority"
)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));


// ---------------- ROUTES ---------------- //

// Test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// Get all dustbins
app.get("/dustbins", async (req, res) => {
  try {
    const bins = await Dustbin.find();
    res.json(bins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update dustbin status
app.post("/update-dustbin", async (req, res) => {
  const { id, level, percentage } = req.body;

  try {
    const bin = await Dustbin.findOneAndUpdate(
      { id: id },
      {
        level: level,
        percentage: percentage,
        updatedAt: "Just now",
      },
      { new: true }
    );

    if (!bin) {
      return res.status(404).json({ message: "Dustbin not found" });
    }

    res.json(bin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------- START SERVER ---------------- //
app.listen(5000, () => {
  console.log("Server running on port 5000");
});


const uploadRoute = require("./routes/upload");
app.use("/upload", uploadRoute);
