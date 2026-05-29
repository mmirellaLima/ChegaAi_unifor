const express = require("express");
const { handleSupabaseError } = require("./supabaseErrors");

function createSerialCrudRouter(supabase, { table, idColumn, allowedFields }) {
  const router = express.Router();

  router.get("/", async (_req, res) => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(idColumn, { ascending: true });

    if (handleSupabaseError(res, error)) return;
    res.json(data);
  });

  router.get("/:id", async (req, res) => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq(idColumn, req.params.id)
      .single();

    if (handleSupabaseError(res, error)) return;
    res.json(data);
  });

  router.post("/", async (req, res) => {
    const body = pickFields(req.body, allowedFields);
    if (Object.keys(body).length === 0) {
      return res.status(400).json({ error: "Nenhum campo válido enviado" });
    }

    const { data, error } = await supabase
      .from(table)
      .insert(body)
      .select()
      .single();

    if (handleSupabaseError(res, error)) return;
    res.status(201).json(data);
  });

  router.put("/:id", async (req, res) => {
    const body = pickFields(req.body, allowedFields);
    if (Object.keys(body).length === 0) {
      return res.status(400).json({ error: "Nenhum campo válido enviado" });
    }

    const { data, error } = await supabase
      .from(table)
      .update(body)
      .eq(idColumn, req.params.id)
      .select()
      .single();

    if (handleSupabaseError(res, error)) return;
    res.json(data);
  });

  router.delete("/:id", async (req, res) => {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq(idColumn, req.params.id)
      .select()
      .single();

    if (handleSupabaseError(res, error)) return;
    res.json({ message: "Registro removido", data });
  });

  return router;
}

function pickFields(body, allowedFields) {
  const result = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }
  }
  return result;
}

module.exports = { createSerialCrudRouter };
