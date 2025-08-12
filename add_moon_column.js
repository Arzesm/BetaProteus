// JavaScript скрипт для добавления колонки moon_data
// Запустите этот скрипт в браузере на странице Supabase Dashboard

const SUPABASE_URL = 'https://uqjyoqkejbwrcyroruku.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxanlvcWtlamJ3cmN5cm9ydWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODkwOTgsImV4cCI6MjA3MDA2NTA5OH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function addMoonDataColumn() {
  const sql = `
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'dreams' 
            AND column_name = 'moon_data'
        ) THEN
            ALTER TABLE dreams ADD COLUMN moon_data JSONB;
            COMMENT ON COLUMN dreams.moon_data IS 'Данные о Луне на дату сна (фаза, знак, освещенность)';
            RAISE NOTICE 'Колонка moon_data успешно добавлена';
        ELSE
            RAISE NOTICE 'Колонка moon_data уже существует';
        END IF;
    END $$;
  `;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ sql_query: sql })
    });

    const result = await response.json();
    console.log('Результат:', result);
    
    if (response.ok) {
      alert('Колонка moon_data успешно добавлена!');
    } else {
      alert('Ошибка: ' + JSON.stringify(result));
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Ошибка выполнения: ' + error.message);
  }
}

// Запускаем функцию
addMoonDataColumn(); 