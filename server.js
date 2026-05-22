require("dotenv").config();

const express = require("express");
const cors = require("cors");

let supabase;
let routes;

try {
  supabase = require("./db/supabase");
  routes = require("./routes");
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "API ChegaAi (Supabase)",
    endpoints: {
      usuarios: "/api/usuarios",
      comunidades: "/api/comunidades",
      membrosComunidade: "/api/membros-comunidade",
      eventos: "/api/eventos",
      participantesEvento: "/api/participantes-evento",
      amizades: "/api/amizades",
      conquistas: "/api/conquistas",
      usuarioConquistas: "/api/usuario-conquistas",
      desafios: "/api/desafios",
      usuarioDesafios: "/api/usuario-desafios",
      mensagens: "/api/mensagens",
    },
  });
});

app.get("/health", async (_req, res) => {
  if (!process.env.SUPABASE_URL) {
    return res.status(503).json({
      status: "erro",
      database: "SUPABASE_URL não configurada no .env",
    });
  }

  const { error } = await supabase.from("usuario").select("id_usuario").limit(1);

  if (error) {
    return res.status(503).json({
      status: "erro",
      database: error.message,
      dica: "Execute ChegaAi_bd.sql/chegaAIDB.sql no SQL Editor do Supabase",
    });
  }

  const { count } = await supabase
    .from("usuario")
    .select("*", { count: "exact", head: true });

  const aviso =
    count === 0 && process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_publishable_")
      ? "Chave publishable detectada: use service_role no .env ou rode ChegaAi_bd.sql/supabase_rls_dev.sql"
      : null;

  res.json({
    status: "ok",
    database: "supabase conectado",
    usuarios_no_banco: count,
    ...(aviso && { aviso }),
  });
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
