-- SQL скрипт для создания новой таблицы dreams с колонкой moon_data
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- Создаем новую таблицу dreams_new с правильной структурой
CREATE TABLE dreams_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  plot TEXT NOT NULL,
  interpretation TEXT NOT NULL,
  astrological_indicators TEXT[] DEFAULT '{}',
  generated_image TEXT,
  notes JSONB DEFAULT '[]',
  emotional_intensity INTEGER,
  moon_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Копируем данные из старой таблицы (если она существует)
INSERT INTO dreams_new (id, title, date, plot, interpretation, astrological_indicators, generated_image, notes, emotional_intensity, created_at, updated_at)
SELECT id, title, date, plot, interpretation, astrological_indicators, generated_image, notes, emotional_intensity, created_at, updated_at
FROM dreams;

-- Удаляем старую таблицу
DROP TABLE dreams;

-- Переименовываем новую таблицу
ALTER TABLE dreams_new RENAME TO dreams;

-- Добавляем комментарии к колонкам
COMMENT ON COLUMN dreams.moon_data IS 'Данные о Луне на дату сна (фаза, знак, освещенность)';
COMMENT ON COLUMN dreams.notes IS 'Заметки и инсайты к сну';

-- Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dreams' 
ORDER BY ordinal_position; 