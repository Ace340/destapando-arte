-- Estilos vocabulary expansion (Patrick, 2026-11-26). ADR-0025 addendum: the
-- taxonomy stops being name-only — styles gains a nullable description (seed
-- text, never an editorial surface: lib/styles.ts holds that styles creation
-- is a seed or import act) and four new styles join the 9 seeded ones, taking
-- the vocabulary to the 13 entries the Tablero's Estilo dropdown groups and
-- displays. Grouping itself lives nowhere in the DB — it is a slug→group
-- constant in the dashboard's picker.
alter table styles add column if not exists description text;

insert into styles (slug, name, description) values
  ('realismo', 'Realismo', 'Retrata la vida cotidiana, el trabajo y la sociedad sin idealización ni mitología. Representantes: Gustave Courbet, Jean-François Millet.'),
  ('renacimiento', 'Renacimiento', 'Busca proporción matemática, perspectiva lineal y estudio anatómico inspirados en la Antigüedad clásica. Representantes: Leonardo da Vinci, Miguel Ángel.'),
  ('barroco', 'Barroco', 'Enfatiza el drama, el movimiento, los contrastes fuertes de luz y sombra, y la emoción intensa. Representantes: Caravaggio, Diego Velázquez.'),
  ('neoclasicismo', 'Neoclasicismo', 'Recupera la sobriedad, el orden geométrico y los temas cívicos o grecorromanos frente a los excesos decorativos previos. Representantes: Jacques-Louis David, Jean Auguste Dominique Ingres.'),
  ('impresionismo', 'Impresionismo', 'Captura la luz cambiante y la impresión fugaz de un instante con pinceladas visibles y colores puros mezclados en la retina. Representantes: Claude Monet, Edgar Degas.'),
  ('postimpresionismo', 'Postimpresionismo', 'Conserva el color vivo del impresionismo pero añade estructura, emoción o simbolismo propio. Representantes: Vincent van Gogh, Paul Cézanne.'),
  ('expresionismo', 'Expresionismo', 'Prioriza la emoción subjetiva, la angustia o el estado interior mediante colores saturados y formas distorsionadas. Representantes: Edvard Munch, Ernst Ludwig Kirchner.'),
  ('cubismo', 'Cubismo', 'Fragmenta objetos y figuras en múltiples planos geométricos simultáneos para mostrar distintos ángulos a la vez. Representantes: Pablo Picasso, Georges Braque.'),
  ('surrealismo', 'Surrealismo', 'Explora los sueños, el inconsciente y las asociaciones ilógicas o fantásticas. Representantes: Salvador Dalí, René Magritte.'),
  ('arte-abstracto', 'Arte abstracto', 'Prescinde de figuras reconocibles y construye la obra a partir de color, línea, textura, gesto o geometría. Representantes: Wassily Kandinsky, Piet Mondrian.'),
  ('pop-art', 'Pop Art', 'Toma imágenes de la cultura de masas, la publicidad y los medios comerciales con ironía y colores llamativos. Representantes: Andy Warhol, Roy Lichtenstein.'),
  ('minimalismo', 'Minimalismo', 'Reduce la obra a formas geométricas simples, materiales industriales y repetición sin ornamentación. Representantes: Donald Judd, Dan Flavin.'),
  ('arte-conceptual', 'Arte conceptual', 'Coloca la idea, el proceso o el planteamiento detrás de la obra por encima del objeto físico tradicional. Representantes: Marcel Duchamp, Sol LeWitt.')
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description;
