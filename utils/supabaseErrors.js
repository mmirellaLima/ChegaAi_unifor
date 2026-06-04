function handleSupabaseError(res, error) {
  if (!error) return false;

  if (error.code === "PGRST116") {
    res.status(404).json({ error: "Registro não encontrado" });
    return true;
  }

  res.status(500).json({ error: error.message });
  return true;
}

module.exports = { handleSupabaseError };
