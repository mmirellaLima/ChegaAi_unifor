const express = require("express");
const supabase = require("../db/supabase");
const { createSerialCrudRouter } = require("../utils/serialCrud");
const { createCompositeCrudRouter } = require("../utils/compositeCrud");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email_usuario, senha_usuario } = req.body;

  if (!email_usuario || !senha_usuario) {
    return res.status(400).json({
      error: "email_usuario e senha_usuario são obrigatórios",
    });
  }

  const { data: usuario, error } = await supabase
    .from("usuario")
    .select(
      [
        "id_usuario",
        "nome_usuario",
        "apelido_usuario",
        "email_usuario",
        "bio_usuario",
        "fotoperfil_url",
        "fotocapa_url",
        "nivelsocial",
        "xpatual",
        "xpmaximo",
        "latitude",
        "longitude",
        "ultimavezonline",
      ].join(",")
    )
    .eq("email_usuario", email_usuario)
    .eq("senha_usuario", senha_usuario)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!usuario) {
    return res.status(401).json({ error: "Email ou senha inválidos" });
  }

  res.json({
    message: "Login realizado com sucesso",
    usuario,
  });
});

// ==========================================
// ROTAS CUSTOMIZADAS DE PERFIL DE USUÁRIO
// ==========================================

// 1. Estatísticas do usuário (eventos, amigos, comunidades)
router.get("/usuarios/:id/stats", async (req, res) => {
  const userId = req.params.id;

  try {
    // Buscar quantidade de comunidades que participa
    const { count: countComunidades, error: errComunidades } = await supabase
      .from("membros_da_comunidade")
      .select("*", { count: "exact", head: true })
      .eq("id_usuario_membro", userId);

    // Buscar quantidade de amigos
    const { count: countAmigos, error: errAmigos } = await supabase
      .from("amizade")
      .select("*", { count: "exact", head: true })
      .eq("id_usuario", userId);

    // Buscar quantidade de eventos que participa
    const { count: countEventos, error: errEventos } = await supabase
      .from("participantes_do_evento")
      .select("*", { count: "exact", head: true })
      .eq("id_participante", userId);

    if (errComunidades || errAmigos || errEventos) {
      return res.status(500).json({
        error: "Erro ao buscar estatísticas do usuário",
        details: {
          comunidades: errComunidades?.message,
          amigos: errAmigos?.message,
          eventos: errEventos?.message,
        },
      });
    }

    res.json({
      quantidade_eventos: countEventos || 0,
      quantidade_amigos: countAmigos || 0,
      quantidade_comunidades: countComunidades || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Comunidades do usuário (com dados da comunidade e contagem total de membros)
router.get("/usuarios/:id/comunidades", async (req, res) => {
  const userId = req.params.id;

  try {
    // Buscar quais comunidades o usuário participa
    const { data: membros, error: errMembros } = await supabase
      .from("membros_da_comunidade")
      .select("id_comunidade, funcao_membro, dataentrada")
      .eq("id_usuario_membro", userId);

    if (errMembros) {
      return res.status(500).json({ error: errMembros.message });
    }

    if (!membros || membros.length === 0) {
      return res.json([]);
    }

    const idComunidades = membros.map((m) => m.id_comunidade);

    // Buscar detalhes das comunidades
    const { data: comunidades, error: errComunidades } = await supabase
      .from("comunidade")
      .select("*")
      .in("id_comunidade", idComunidades);

    if (errComunidades) {
      return res.status(500).json({ error: errComunidades.message });
    }

    // Obter todas as conexões para contar membros por comunidade
    const { data: contagens, error: errContagens } = await supabase
      .from("membros_da_comunidade")
      .select("id_comunidade");

    const membrosPorComunidade = {};
    if (!errContagens && contagens) {
      for (const reg of contagens) {
        membrosPorComunidade[reg.id_comunidade] = (membrosPorComunidade[reg.id_comunidade] || 0) + 1;
      }
    }

    const resultado = comunidades.map((com) => {
      const vinculo = membros.find((m) => m.id_comunidade === com.id_comunidade);
      return {
        ...com,
        funcao_membro: vinculo ? vinculo.funcao_membro : null,
        dataentrada: vinculo ? vinculo.dataentrada : null,
        quantidade_membros: membrosPorComunidade[com.id_comunidade] || 0,
      };
    });

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Conquistas do usuário
router.get("/usuarios/:id/conquistas", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data: usuarioConquistas, error: errUC } = await supabase
      .from("usuario_conquistas")
      .select("id_conquista, conquistado_em")
      .eq("id_usuario", userId);

    if (errUC) {
      return res.status(500).json({ error: errUC.message });
    }

    if (!usuarioConquistas || usuarioConquistas.length === 0) {
      return res.json([]);
    }

    const idConquistas = usuarioConquistas.map((uc) => uc.id_conquista);

    const { data: conquistas, error: errConquistas } = await supabase
      .from("conquista")
      .select("*")
      .in("id_conquista", idConquistas);

    if (errConquistas) {
      return res.status(500).json({ error: errConquistas.message });
    }

    const resultado = conquistas.map((conq) => {
      const uc = usuarioConquistas.find((item) => item.id_conquista === conq.id_conquista);
      return {
        ...conq,
        conquistado_em: uc ? uc.conquistado_em : null,
      };
    });

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Amigos do usuário
router.get("/usuarios/:id/amigos", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data: amizades, error: errAmizades } = await supabase
      .from("amizade")
      .select("id_amigo, status, datacriacao")
      .eq("id_usuario", userId);

    if (errAmizades) {
      return res.status(500).json({ error: errAmizades.message });
    }

    if (!amizades || amizades.length === 0) {
      return res.json([]);
    }

    const idAmigos = amizades.map((a) => a.id_amigo);

    const { data: amigos, error: errAmigos } = await supabase
      .from("usuario")
      .select("id_usuario, nome_usuario, apelido_usuario, bio_usuario, fotoperfil_url, fotocapa_url, nivelsocial")
      .in("id_usuario", idAmigos);

    if (errAmigos) {
      return res.status(500).json({ error: errAmigos.message });
    }

    const resultado = amigos.map((amg) => {
      const amizade = amizades.find((a) => a.id_amigo === amg.id_usuario);
      return {
        ...amg,
        status: amizade ? amizade.status : null,
        datacriacao: amizade ? amizade.datacriacao : null,
      };
    });

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Explorar comunidades (todas as comunidades com quantidade de membros e se o usuário participa)
router.get("/comunidades/explorar/:id_usuario", async (req, res) => {
  const userId = req.params.id_usuario;

  try {
    // Buscar todas as comunidades
    const { data: comunidades, error: errComunidades } = await supabase
      .from("comunidade")
      .select("*");

    if (errComunidades) {
      return res.status(500).json({ error: errComunidades.message });
    }

    if (!comunidades || comunidades.length === 0) {
      return res.json([]);
    }

    // Buscar todas as relações de membros da comunidade
    const { data: todosMembros, error: errMembros } = await supabase
      .from("membros_da_comunidade")
      .select("id_comunidade, id_usuario_membro");

    if (errMembros) {
      return res.status(500).json({ error: errMembros.message });
    }

    // Mapear contagem de membros e verificação de participação
    const membrosPorComunidade = {};
    const comunidadesParticipando = new Set();

    if (todosMembros) {
      for (const registro of todosMembros) {
        const idCom = registro.id_comunidade;
        membrosPorComunidade[idCom] = (membrosPorComunidade[idCom] || 0) + 1;

        if (String(registro.id_usuario_membro) === String(userId)) {
          comunidadesParticipando.add(idCom);
        }
      }
    }

    // Montar o resultado final
    const resultado = comunidades.map((com) => ({
      ...com,
      quantidade_membros: membrosPorComunidade[com.id_comunidade] || 0,
      ja_participo: comunidadesParticipando.has(com.id_comunidade),
    }));

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Detalhes de uma comunidade específica (dados, dono, membros e eventos)
router.get("/comunidades/:id/detalhes/:id_usuario", async (req, res) => {
  const comId = req.params.id;
  const userId = req.params.id_usuario;

  try {
    // 1. Buscar a comunidade
    const { data: comunidade, error: errCom } = await supabase
      .from("comunidade")
      .select("*")
      .eq("id_comunidade", comId)
      .maybeSingle();

    if (errCom) {
      return res.status(500).json({ error: errCom.message });
    }

    if (!comunidade) {
      return res.status(404).json({ error: "Comunidade não encontrada" });
    }

    // 2. Buscar o dono/criador da comunidade
    let dono = null;
    if (comunidade.id_usuario_dono) {
      const { data: dataDono, error: errDono } = await supabase
        .from("usuario")
        .select("id_usuario, nome_usuario, apelido_usuario, fotoperfil_url, bio_usuario, nivelsocial")
        .eq("id_usuario", comunidade.id_usuario_dono)
        .maybeSingle();
      if (!errDono) {
        dono = dataDono;
      }
    }

    // 3. Buscar membros da comunidade (tabela membros_da_comunidade)
    const { data: membrosRel, error: errMembros } = await supabase
      .from("membros_da_comunidade")
      .select("id_usuario_membro, funcao_membro, dataentrada")
      .eq("id_comunidade", comId);

    let membros = [];
    let jaParticipo = false;
    let funcaoMembro = null;
    let quantidadeMembros = 0;

    if (!errMembros && membrosRel) {
      quantidadeMembros = membrosRel.length;
      
      // Verificar se o usuário em questão já participa
      const vinculo = membrosRel.find((m) => String(m.id_usuario_membro) === String(userId));
      if (vinculo) {
        jaParticipo = true;
        funcaoMembro = vinculo.funcao_membro;
      }

      const idMembros = membrosRel.map((m) => m.id_usuario_membro);
      if (idMembros.length > 0) {
        const { data: usuariosMembros, error: errUsers } = await supabase
          .from("usuario")
          .select("id_usuario, nome_usuario, apelido_usuario, fotoperfil_url, bio_usuario, nivelsocial")
          .in("id_usuario", idMembros);

        if (!errUsers && usuariosMembros) {
          membros = usuariosMembros.map((u) => {
            const rel = membrosRel.find((m) => m.id_usuario_membro === u.id_usuario);
            return {
              ...u,
              funcao_membro: rel ? rel.funcao_membro : "membro",
              dataentrada: rel ? rel.dataentrada : null,
            };
          });
        }
      }
    }

    // 4. Buscar eventos da comunidade
    const { data: eventos, error: errEventos } = await supabase
      .from("evento")
      .select("*")
      .eq("id_comunidade", comId)
      .order("horario_inicio", { ascending: true });

    // 5. Retornar resposta consolidada
    res.json({
      comunidade: {
        ...comunidade,
        quantidade_membros: quantidadeMembros,
        ja_participo: jaParticipo,
        funcao_membro: funcaoMembro,
      },
      dono,
      membros,
      eventos: errEventos ? [] : (eventos || []),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CRUD GENÉRICO
// ==========================================

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
