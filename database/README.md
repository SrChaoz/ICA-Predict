# Restauración de la Base de Datos en pgAdmin

## **Contenido de la Carpeta `backups/`**
- **`RespaldoCanalMesiasDB.backup`**: Archivo de respaldo de la base de datos principal. Contiene la estructura y los datos de la base de datos principal utilizada en el sistema.
- **`RespaldoCanalMesiasDBClima.backup`**: Archivo de respaldo de la base de datos enriquecida con datos climáticos.

## **Contenido de la Carpeta `scripts/`**
- Archivos SQL que contienen:
  - La creación de tablas.
  - Definición de funciones SQL.

## **Restaurar la Base de Datos en pgAdmin**
Sigue estos pasos para restaurar la base de datos usando pgAdmin:

### **Paso 1: Abrir pgAdmin**
- Abre pgAdmin e inicia sesión.

### **Paso 2: Crear la Base de Datos**
1. En el panel izquierdo de pgAdmin, haz clic derecho sobre el nodo de tu servidor ejemplo: *PostgreSQL 14* y selecciona **Create > Database**.
2. En la ventana emergente:
   - En el campo **Name**, escribe `CanalMesiasDB` o cualquier otro nombre que sea relacionado al sistema.
   - Haz clic en **Save**.

### **Paso 3: Restaurar la Base de Datos**
- Antes de restaurar la base de datos tener en cuenta que la base de datos enriquecida no se esta usando, todo trabaja en base a CanalMesiasDB, se adjunta la base de datos enriquecidad para escalar el modelo en un futuro
1. Haz clic derecho sobre la base de datos que acabas de crear (`CanalMesiasDB`).
2. Selecciona **Restore**.
3. En la ventana emergente:
   - En el campo **Filename**, haz clic en el icono de carpeta y selecciona el archivo correspondiente:
     - Para la base de datos principal: `RespaldoCanalMesiasDB.backup`
   - En el campo **Format**, selecciona `Custom`.
   - En la sección **Options**, selecciona:
     - **Clean before restore** para eliminar objetos existentes si los hay.

4. Haz clic en **Restore** y espera a que finalice el proceso.

### **Paso 4: Verificar la Base de Datos**
- Una vez restaurada, puedes expandir la base de datos en el panel izquierdo para verificar que todas las tablas, funciones y datos estén presentes y tambien ejecutar un **SELECT * FROM calidad_agua** para verificar que la informacion realmente se haya cargado.

### **Paso 5: Importar Scripts Manualmente solo si es necesario**
-**Nota:** al momento de restaurar la base de datos mediante un backup ya ontenemos las funciones creadas, triggers, etc, asi qu eno seria necesario usar los scripts pero en caso de requerirlos los puedes ver para entender mejor la estructura o puedes modificarlos o ejecutarlos: 

1. Abre la base de datos en pgAdmin.
2. Haz clic en el botón de **Query Tool**.
3. Abre los archivos SQL desde la carpeta `scripts/` y ejecútelos según el orden especificado en los comentarios dentro de los scripts.

---

