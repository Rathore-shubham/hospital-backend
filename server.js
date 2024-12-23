const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;


app.use(cors());
app.use(bodyParser.json());


mongoose.connect("mongodb://localhost:27017/hospital", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  condition: String,
  bedNumber: Number,
  status: { type: String, default: "admitted" }
});

const Patient = mongoose.model("Patient", patientSchema);


const bedSchema = new mongoose.Schema({
  bedNumber: Number,
  isOccupied: { type: Boolean, default: false }
});

const Bed = mongoose.model("Bed", bedSchema);


app.get("/patients", async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

app.post("/patients", async (req, res) => {
  const availableBed = await Bed.findOne({ isOccupied: false });
  if (!availableBed) {
    return res.status(400).json({ message: "No beds available" });
  }

  const { name, age, condition } = req.body;
  const newPatient = new Patient({
    name,
    age,
    condition,
    bedNumber: availableBed.bedNumber,
  });

  availableBed.isOccupied = true;
  await availableBed.save();
  await newPatient.save();
  res.json(newPatient);
});

app.put("/patients/:id/discharge", async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  res.json(patient);
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
