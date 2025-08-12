-- SQL скрипт для добавления колонки moon_data в таблицу dreams
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- Добавляем колонку moon_data в таблицу dreams
ALTER TABLE dreams 
ADD COLUMN moon_data JSONB;

-- Добавляем комментарий к колонке
COMMENT ON COLUMN dreams.moon_data IS 'Данные о Луне на дату сна (фаза, знак, освещенность)';

-- Проверяем, что колонка добавлена
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dreams' AND column_name = 'moon_data'; 