const express = require("express");
const supabase = require("../db/supabase");
const { createSerialCrudRouter } = require("../utils/serialCrud");
const { createCompositeCrudRouter } = require("../utils/compositeCrud");

const router = express.Router();

router.use(
  "/usuarios",
  createSerialCrudRouter(supabase, {
    table: "usuario",
    idColumn: "id_usuario",
    allowedFields: [
      "nome_usuario",
      "apelido_usuario",
      "email_usuario",
      "senha_usuario",
      "bio_usuario",
      "fotoperfil_url",
      "fotocapa_url",
      "nivelsocial",
      "xpatual",
      "xpmaximo",
      "latitude",
      "longitude",
      "ultimavezonline",
    ],
  })
);

router.use(
  "/comunidades",
  createSerialCrudRouter(supabase, {
    table: "comunidade",
    idColumn: "id_comunidade",
    allowedFields: [
      "id_usuario_dono",
      "nome_comunidade",
      "descricao",
      "fotocomunidade_url",
      "temacor",
    ],
  })
);

router.use(
  "/membros-comunidade",
  createCompositeCrudRouter(supabase, {
    table: "membros_da_comunidade",
    keyColumns: ["id_usuario_membro", "id_comunidade"],
    allowedFields: ["funcao_membro", "dataentrada"],
  })
);

router.use(
  "/eventos",
  createSerialCrudRouter(supabase, {
    table: "evento",
    idColumn: "id_evento",
    allowedFields: [
      "id_comunidade",
      "id_criador",
      "titulo",
      "descricao",
      "nome_local",
      "latitude",
      "longitude",
      "horario_inicio",
      "horario_termino",
      "tipo_evento",
    ],
  })
);

router.use(
  "/participantes-evento",
  createCompositeCrudRouter(supabase, {
    table: "participantes_do_evento",
    keyColumns: ["id_participante", "id_evento"],
    allowedFields: ["status", "ultima_atualizacao"],
  })
);

router.use(
  "/amizades",
  createCompositeCrudRouter(supabase, {
    table: "amizade",
    keyColumns: ["id_usuario", "id_amigo"],
    allowedFields: ["status"],
  })
);

router.use(
  "/conquistas",
  createSerialCrudRouter(supabase, {
    table: "conquista",
    idColumn: "id_conquista",
    allowedFields: ["nome", "descricao", "simbolo_icone", "recompensa_xp"],
  })
);

router.use(
  "/usuario-conquistas",
  createCompositeCrudRouter(supabase, {
    table: "usuario_conquistas",
    keyColumns: ["id_usuario", "id_conquista"],
    allowedFields: ["conquistado_em"],
  })
);

router.use(
  "/desafios",
  createSerialCrudRouter(supabase, {
    table: "desafios",
    idColumn: "id_desafio",
    allowedFields: [
      "titulo",
      "descricao",
      "recompensa_xp",
      "data_inicio",
      "data_fim",
    ],
  })
);

router.use(
  "/usuario-desafios",
  createCompositeCrudRouter(supabase, {
    table: "usuario_desafios",
    keyColumns: ["id_usuario", "id_desafio"],
    allowedFields: ["progresso", "status", "atualizado_em"],
  })
);

router.use(
  "/mensagens",
  createSerialCrudRouter(supabase, {
    table: "mensagens",
    idColumn: "id_mensagem",
    allowedFields: [
      "id_remetente",
      "id_destinatario",
      "conteudo",
      "enviado_em",
      "lido_em",
    ],
  })
);

module.exports = router;
