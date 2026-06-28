-- =============================================================================
-- ROMANUS Labs — siembra opcional de tools_state
-- -----------------------------------------------------------------------------
-- Opcional: si no ejecutas esto, la app simplemente usa un estado por
-- default ('en_validacion', oculta) la primera vez que se consulta cada
-- herramienta. Ejecuta esto solo si quieres fijar el estado inicial real
-- desde el día uno (ej. dejar "plataformas-digitales" en 'pendiente' por
-- el punto legal disputado que documenta su propia herramienta).
--
-- Los id deben coincidir EXACTO con los del Registro Central
-- (src/catalog/registry.ts) — no se valida con una llave foránea porque
-- el registro es código, no una tabla.
-- =============================================================================

insert into public.tools_state (herramienta_id, estado, visible_publicamente, disponible_solo_labs, nivel_minimo_requerido)
values
  ('tool_finiquito', 'publicada', true, false, null),
  ('tool_liquidacion', 'publicada', true, false, null),
  ('tool_aguinaldo', 'publicada', true, false, null),
  ('tool_vacaciones', 'publicada', true, false, null),
  ('tool_sdi', 'publicada', true, false, null),
  ('tool_resico', 'en_validacion', false, true, null),
  ('tool_xml_cfdi', 'en_validacion', false, true, null),
  ('tool_devolucion_impuestos', 'en_validacion', false, true, null),
  ('tool_resico_anual', 'en_validacion', false, true, null),
  ('tool_arrendamiento', 'en_validacion', false, true, null),
  ('tool_plataformas_digitales', 'pendiente', false, true, null),
  ('tool_terminos_procesales', 'lista_para_publico', true, false, null),
  ('tool_familiar_urgente', 'en_validacion', false, true, null)
on conflict (herramienta_id) do nothing;
