-- Execute no SQL Editor do Supabase se quiser usar a chave publishable/anon
-- e não a service_role no backend.

-- Opção A: desabilitar RLS em desenvolvimento (mais simples)
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE comunidade DISABLE ROW LEVEL SECURITY;
ALTER TABLE membros_da_comunidade DISABLE ROW LEVEL SECURITY;
ALTER TABLE evento DISABLE ROW LEVEL SECURITY;
ALTER TABLE participantes_do_evento DISABLE ROW LEVEL SECURITY;
ALTER TABLE amizade DISABLE ROW LEVEL SECURITY;
ALTER TABLE conquista DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_conquistas DISABLE ROW LEVEL SECURITY;
ALTER TABLE desafios DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_desafios DISABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens DISABLE ROW LEVEL SECURITY;

-- Opção B (produção): manter RLS e criar políticas por tabela, exemplo:
-- ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "usuario_select" ON usuario FOR SELECT USING (true);
-- CREATE POLICY "usuario_insert" ON usuario FOR INSERT WITH CHECK (true);
-- CREATE POLICY "usuario_update" ON usuario FOR UPDATE USING (true);
-- CREATE POLICY "usuario_delete" ON usuario FOR DELETE USING (true);
