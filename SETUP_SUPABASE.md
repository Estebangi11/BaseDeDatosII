# Setup Supabase - Instrucciones de Configuración

## ✅ TABLA CORRECTA: "semanas"

La base de datos utiliza la tabla **"semanas"** (no "proyectos") para almacenar la información de cada semana del portafolio. El código busca esta tabla exactamente.

## 1. Crear la tabla "semanas"

En Supabase, ve a **SQL Editor** y ejecuta el siguiente script:

```sql
-- Crear tabla semanas
CREATE TABLE semanas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT DEFAULT ''
);

-- Insertar datos iniciales para las 16 semanas
INSERT INTO semanas (id, nombre, descripcion) VALUES
('1', 'Semana 1', 'Arquitectura de Web'),
('2', 'Semana 2', 'Modelado de Datos'),
('3', 'Semana 3', ''),
('4', 'Semana 4', ''),
('5', 'Semana 5', ''),
('6', 'Semana 6', ''),
('7', 'Semana 7', ''),
('8', 'Semana 8', ''),
('9', 'Semana 9', ''),
('10', 'Semana 10', ''),
('11', 'Semana 11', ''),
('12', 'Semana 12', ''),
('13', 'Semana 13', ''),
('14', 'Semana 14', ''),
('15', 'Semana 15', ''),
('16', 'Semana 16', '');
```

## 2. Crear el Storage Bucket "Semanas"

1. Ve a **Storage** en Supabase
2. Crea un nuevo bucket llamado **"Semanas"**
3. Crea las siguientes carpetas dentro del bucket:
   - Semana01
   - Semana02
   - ... hasta Semana16

Puedes hacerlo manualmente o mediante la UI de Supabase.

## 3. Configurar Políticas RLS (Row Level Security)

Para la tabla "semanas":
```sql
-- Permitir lectura pública
CREATE POLICY "Allow public read on semanas"
ON semanas FOR SELECT
USING (true);

-- Permitir escritura solo para admin
CREATE POLICY "Allow admin write on semanas"
ON semanas FOR UPDATE
USING (auth.email() = 'estebangalarza110607@gmail.com');
```

Para el Storage "Semanas":
- Ve a **Storage** → **Policies**
- Crea una política que permita lectura pública a todo el bucket
- Permita escritura solo al usuario admin

## 4. Validar la configuración

- Verifica que la tabla "semanas" exista y tenga 16 filas
- Verifica que el bucket "Semanas" tenga las 16 carpetas
- Prueba subiendo un archivo desde el panel admin

## 5. Usar el Panel Admin

Una vez que iniciones sesión como admin (estebangalarza110607@gmail.com):

1. Aparecerá un botón flotante 📤 en la esquina inferior derecha
2. Haz clic para abrir el **Panel de Administración**
3. Desde ahí puedes:
   - Ver todas las semanas (Semana 1 a Semana 16)
   - Editar el nombre y descripción de cada semana
   - Los cambios se guardan automáticamente en Supabase

## Notas Importantes

- El email del admin está hardcodeado como `estebangalarza110607@gmail.com`
- Si deseas cambiar el admin, actualiza este valor en `main.js` línea ~804
- Solo los usuarios autenticados como admin pueden ver el panel admin
- El panel de edición solo aparece para usuarios admin
- Los cambios en Supabase se reflejan automáticamente en el panel admin
