const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let communities = [
  {
    id: 1,
    name: "Gamers Fortaleza 🎮",
    members: "1.2k membros",
    desc: "campeonatos e gameplay",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420",
  },
];

// READ
app.get("/communities", (req, res) => {
  res.json(communities);
});

// CREATE
app.post("/communities", (req, res) => {
  const newCommunity = {
    id: Date.now(),
    ...req.body,
  };

  communities.push(newCommunity);

  res.status(201).json(newCommunity);
});

// UPDATE
app.put("/communities/:id", (req, res) => {
  const id = Number(req.params.id);

  communities = communities.map((community) =>
    community.id === id
      ? { ...community, ...req.body }
      : community
  );

  res.json({ message: "Comunidade atualizada" });
});

// DELETE
app.delete("/communities/:id", (req, res) => {
  const id = Number(req.params.id);

  communities = communities.filter(
    (community) => community.id !== id
  );

  res.json({ message: "Comunidade removida" });
});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});