const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");

dotenv.config();

async function testApi() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne();
  if (!user) {
    console.log("No user found");
    return;
  }
  
  const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  const payload = {
    title: "Test Gig",
    description: "Testing API",
    category: "web-development",
    minBudget: 500,
    maxBudget: 1000,
    deadline: new Date(Date.now() + 10000000).toISOString(),
    duration: "2 Weeks",
    budgetType: "fixed",
    experienceLevel: "expert",
    skills: ["React"],
    requirements: "None",
    deliverables: "Code",
    attachments: []
  };

  const res = await fetch("http://localhost:8080/api/gigs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API Error Response:", res.status, text);
  } else {
    const json = await res.json();
    console.log("Success:", json);
  }
  
  mongoose.disconnect();
}

testApi();
