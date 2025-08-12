-- Добавляем колонку moon_data в таблицу dreams
ALTER TABLE dreams 
ADD COLUMN moon_data JSONB;

-- Добавляем комментарий к колонке
COMMENT ON COLUMN dreams.moon_data IS 'Данные о Луне на дату сна (фаза, знак, освещенность)'; 