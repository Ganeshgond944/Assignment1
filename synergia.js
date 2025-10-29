
import express from "express";

const app = express();
app.use(express.json()); 

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body. Check syntax." });
  }
  next(err);
});

let bookings = [];
let nextId = 1; 


function validateBookingPayload(payload, forCreate = true) {
  const errors = [];
  if (forCreate && !payload.name) errors.push("name is required");
  if (forCreate && !payload.email) errors.push("email is required");
  if ("email" in payload && typeof payload.email === "string") {

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.push("email is not valid");
  }
  if ("tickets" in payload) {
    const t = payload.tickets;
    if (!Number.isInteger(t) || t <= 0) errors.push("tickets must be a positive integer");
  }
  return errors;
}


app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});


app.post("/api/bookings", (req, res) => {
  const payload = req.body || {};
  const errors = validateBookingPayload(payload, true);
  if (errors.length) return res.status(400).json({ errors });

  const newBooking = {
    id: nextId++,
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    organization: payload.organization || null,
    tickets: payload.tickets ? Number(payload.tickets) : 1,
    notes: payload.notes || null,
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);
  res.status(201).json({ message: "Booking created", booking: newBooking });
});

app.get("/api/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const booking = bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  res.json(booking);
});

app.put("/api/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const bookingIndex = bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) return res.status(404).json({ error: "Booking not found" });

  const payload = req.body || {};
  const errors = validateBookingPayload(payload, false);
  if (errors.length) return res.status(400).json({ errors });

  const allowed = ["name", "email", "phone", "organization", "tickets", "notes"];
  for (const key of allowed) {
    if (key in payload) {
      bookings[bookingIndex][key] = key === "tickets" ? Number(payload[key]) : payload[key];
    }
  }
  bookings[bookingIndex].updatedAt = new Date().toISOString();

  res.json({ message: "Booking updated", booking: bookings[bookingIndex] });
});


app.delete("/api/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const bookingIndex = bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) return res.status(404).json({ error: "Booking not found" });

  const removed = bookings.splice(bookingIndex, 1)[0];
  res.json({ message: "Booking cancelled", booking: removed });
});


bookings.push(
  {
    id: nextId++,
    name: "Asha Patel",
    email: "asha@example.com",
    phone: "9876543210",
    organization: "Synergia College",
    tickets: 2,
    notes: null,
    createdAt: new Date().toISOString()
  },
  {
    id: nextId++,
    name: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    phone: null,
    organization: null,
    tickets: 1,
    notes: "Vegetarian",
    createdAt: new Date().toISOString()
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Synergia Booking API running at http://localhost:${PORT}`));
