# 🔐 INSTRUCCIONES DE SEGURIDAD

## ⚠️ CREDENCIALES COMPROMETIDAS - ACCIÓN REQUERIDA

Si subes credenciales a GitHub por error, sigue estos pasos **INMEDIATAMENTE**:

### 1. 🚨 Cambiar credenciales comprometidas:
- Ve a tu [panel de Supabase](https://supabase.com/dashboard)
- Regenera tu Service Role Key
- Si es crítico, considera crear un nuevo proyecto

### 2. 🗑️ Limpiar historial de Git:
```bash
# Opción 1: Reescribir historial (PELIGROSO - úsalo solo si entiendes las consecuencias)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/app.yaml model/app.yaml' \
  --prune-empty --tag-name-filter cat -- --all

# Opción 2: Usar BFG Repo Cleaner (RECOMENDADO)
# 1. Descarga BFG: https://rtyley.github.io/bfg-repo-cleaner/
# 2. Ejecuta: java -jar bfg.jar --delete-files app.yaml
# 3. Ejecuta: git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

### 3. 📁 Configurar archivos seguros:

#### Para desarrollo local:
1. Copia los archivos .template:
```bash
cp backend/app.yaml.template backend/app.yaml
cp model/app.yaml.template model/app.yaml
```

2. Edita los archivos copiados con tus credenciales reales
3. Los archivos .yaml están en .gitignore y NO se subirán

#### Para producción:
- Usa variables de entorno del servidor
- Google Cloud: Configura en la consola
- Docker: Usa archivos .env externos
- Vercel/Netlify: Usa el panel de variables de entorno

### 4. ✅ Verificar seguridad:
```bash
# Verificar que no hay credenciales en el repo
git log --all --full-history --grep="SUPABASE"
grep -r "cnwmrcophalcymxxxhys" . --exclude-dir=.git
```

### 5. 🔄 Forzar push limpio:
```bash
git push origin --force --all
git push origin --force --tags
```

## 📋 Checklist de seguridad:
- [ ] Credenciales cambiadas en Supabase
- [ ] Archivos .yaml removidos del tracking
- [ ] .gitignore actualizado
- [ ] Historial de Git limpiado
- [ ] Push forzado realizado
- [ ] Verificación de que no quedan credenciales

## 🛡️ Prevención futura:
1. Siempre usar variables de entorno
2. Nunca hardcodear credenciales
3. Revisar .gitignore antes de commits
4. Usar git hooks para prevenir commits con secretos
