const express = require("express");
const { handleSupabaseError } = require("./supabaseErrors");

function createCompositeCrudRouter(
  supabase,
  { table, keyColumns, allowedFields }
) {
  const router = express.Router();
  const pathParams = keyColumns.map((c) => `:${c}`).join("/");

  router.get("/", async (_req, res) => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(keyColumns[0], { ascending: true });

    if (handleSupabaseError(res, error)) return;
    res.json(data);
  });

  router.get(`/${pathParams}`, async (req, res) => {
    let query = supabase.from(table).select("*");

    for (const col of keyColumns) {
      query = query.eq(col, req.params[col]);
    }

    const { data, error } = await query.single();

    if (handleSupabaseError(res, error)) return;
    res.json(data);
  });

  router.post("/", async (req, res) => {
    const body = pickFields(req.body, [...keyColumns, ...allowedFields]);
    const missing = keyColumns.filter((col) => body[col] === undefined);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Chaves obrigatórias: ${missing.join(", ")}`,
      });
    }

    const { data, error } = await supabase
      .from(table)
      .insert(body)
      .select()
      .single();

    if (handleSupabaseError(res, error)) return;
    res.status(201).json(data);
  });

  router.put(`/${pathParams}`, async (req, res) => {
    const body = pickFields(req.body, allowedFields);
    if (Object.keys(body).length === 0) {
      return res.status(400).json({ error: "Nenhum campo válido enviado" });
    }

    let query = supabase.from(table).update(body);

    for (const col of keyColumns) {
      query = query.eq(col, req.params[col]);
    }

    const { data, error } = await query.select().single();

    if (handleSupabaseError(res, error)) return;
    res.json(data);
  });

  router.delete(`/${pathParams}`, async (req, res) => {
    let query = supabase.from(table).delete();

    for (const col of keyColumns) {
      query = query.eq(col, req.params[col]);
    }

    const { data, error } = await query.select().single();

    if (handleSupabaseError(res, error)) return;
    res.json({ message: "Registro removido", data });
  });

  return router;
}

function pickFields(body, fields) {
  const result = {};
  for (const field of fields) {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }
  }
  return result;
}

module.exports = { createCompositeCrudRouter };
