-- Простой SQL скрипт для добавления колонки moon_data
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- Проверяем, существует ли колонка moon_data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'dreams' 
        AND column_name = 'moon_data'
    ) THEN
        -- Добавляем колонку moon_data
        ALTER TABLE dreams ADD COLUMN moon_data JSONB;
        
        -- Добавляем комментарий
        COMMENT ON COLUMN dreams.moon_data IS 'Данные о Луне на дату сна (фаза, знак, освещенность)';
        
        RAISE NOTICE 'Колонка moon_data успешно добавлена';
    ELSE
        RAISE NOTICE 'Колонка moon_data уже существует';
    END IF;
END $$;

-- Проверяем результат
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dreams' AND column_name = 'moon_data'; 