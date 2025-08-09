-- Consulting availability windows for hourly AI consulting
CREATE TABLE IF NOT EXISTS consulting_availability_windows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,  -- 'HH:MM'
  end_time TEXT NOT NULL,    -- 'HH:MM'
  is_active BOOLEAN NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default Mon–Fri 09:00–17:00 if table empty
INSERT INTO consulting_availability_windows (weekday, start_time, end_time, is_active, priority)
SELECT 1, '09:00', '17:00', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM consulting_availability_windows);
INSERT INTO consulting_availability_windows (weekday, start_time, end_time, is_active, priority)
SELECT 2, '09:00', '17:00', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM consulting_availability_windows WHERE weekday=2);
INSERT INTO consulting_availability_windows (weekday, start_time, end_time, is_active, priority)
SELECT 3, '09:00', '17:00', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM consulting_availability_windows WHERE weekday=3);
INSERT INTO consulting_availability_windows (weekday, start_time, end_time, is_active, priority)
SELECT 4, '09:00', '17:00', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM consulting_availability_windows WHERE weekday=4);
INSERT INTO consulting_availability_windows (weekday, start_time, end_time, is_active, priority)
SELECT 5, '09:00', '17:00', 1, 0 WHERE NOT EXISTS (SELECT 1 FROM consulting_availability_windows WHERE weekday=5);



