# 🚀 Guía de Despliegue - Futurópolis en GitHub Pages

## 📋 Pre-requisitos Completados ✅

Tu proyecto ya está configurado para GitHub Pages:
- ✅ `gh-pages` package instalado
- ✅ Scripts de deploy configurados en `package.json`
- ✅ Webpack configurado para producción
- ✅ Build de producción probado exitosamente
- ✅ Archivo `.nojekyll` creado

## 🔐 Paso 1: Resolver Acceso a GitHub

**Opciones para acceder a tu cuenta con 2FA:**

### Opción A: Usar App de Autenticación (Recomendado)
1. Abre tu app de autenticación (Google Authenticator, Authy, etc.)
2. Busca la entrada de "GitHub"
3. Ingresa el código de 6 dígitos que aparece

### Opción B: Usar Códigos de Recuperación
1. Busca los códigos de recuperación de 8 dígitos que guardaste al activar 2FA
2. Usa uno de esos códigos para acceder
3. ⚠️ **Importante**: Cada código solo se puede usar una vez

### Opción C: Usar SMS (si está configurado)
1. Solicita recibir código por SMS
2. Ingresa el código recibido

### Opción D: Recuperación de Cuenta
Si no tienes acceso a ninguno de los anteriores:
1. Ve a: https://github.com/login
2. Click en "Forgot password?"
3. Sigue el proceso de recuperación
4. Contacta GitHub Support: https://support.github.com/

---

## 🚀 Paso 2: Crear Repositorio y Desplegar

### Una vez que tengas acceso a GitHub:

**1. Crear el repositorio en GitHub:**
```bash
# Ve a: https://github.com/new
# Nombre del repositorio: futoropolis
# Descripción: Smart City 3D para Foro IoT Educativo
# Público
# NO inicialices con README (ya tienes archivos locales)
```

**2. Inicializar Git localmente:**
```bash
cd /Users/leomos/Desktop/Futoropolis
git init
git add .
git commit -m "Initial commit: Futurópolis Smart City 3D"
```

**3. Conectar con GitHub:**
```bash
git remote add origin https://github.com/leomos2022/futoropolis.git
git branch -M main
git push -u origin main
```

**4. Desplegar a GitHub Pages:**
```bash
npm run deploy
```

**5. Habilitar GitHub Pages (automático, pero verifica):**
- Ve a: https://github.com/leomos2022/futoropolis/settings/pages
- Debería mostrar: "Your site is published at https://leomos2022.github.io/futoropolis/"
- Si no está habilitado:
  - Source: Deploy from a branch
  - Branch: gh-pages / (root)
  - Guarda los cambios

---

## 🌐 Acceso a tu Aplicación

**URL de tu proyecto:**
```
https://leomos2022.github.io/futoropolis/
```

⏱️ **Nota**: El primer despliegue puede tardar 1-3 minutos en estar disponible.

---

## 📝 Comandos Rápidos de Referencia

```bash
# Desarrollo local
npm run dev                    # Servidor de desarrollo (puerto 3000)

# Producción
npm run build                  # Crear build de producción
npm run deploy                 # Desplegar a GitHub Pages

# Git
git add .                      # Agregar cambios
git commit -m "mensaje"        # Commit
git push                       # Subir a GitHub
npm run deploy                 # Actualizar GitHub Pages
```

---

## 🔧 Actualizaciones Futuras

Para actualizar tu aplicación en GitHub Pages:

```bash
# 1. Hacer cambios en el código
# 2. Commit los cambios
git add .
git commit -m "Descripción de los cambios"
git push

# 3. Redesplegar
npm run deploy
```

**Importante**: `npm run deploy` crea automáticamente una rama `gh-pages` separada que GitHub usa para servir tu sitio. Tu código fuente queda en la rama `main`.

---

## ✅ Verificación Post-Despliegue

Después de desplegar, verifica que todo funcione:

- [ ] El sitio carga en: https://leomos2022.github.io/futoropolis/
- [ ] La ciudad 3D se renderiza correctamente
- [ ] Los 42 sensores son visibles y tienen colores
- [ ] Las teclas de flecha mueven el personaje
- [ ] Click derecho mueve el personaje
- [ ] Click izquierdo en sensores abre el modal con información
- [ ] El favicon (logoiot.jpg) aparece en la pestaña

---

## 🆘 Solución de Problemas Comunes

### Problema: Página en blanco o error 404
**Solución:**
```bash
# Verificar que el publicPath esté correcto
# Revisar webpack.config.js línea: publicPath: '/futoropolis/'

# Redesplegar
npm run build
npm run deploy
```

### Problema: Los assets no cargan (CSS, JS)
**Solución:**
- Verifica que el nombre del repositorio sea exactamente `futoropolis`
- El publicPath en webpack debe coincidir con el nombre del repo
- Espera 2-3 minutos después del deploy

### Problema: El deploy falla
**Solución:**
```bash
# Verificar que gh-pages esté instalado
npm list gh-pages

# Reinstalar si es necesario
npm install gh-pages --save-dev

# Limpiar caché y redesplegar
rm -rf node_modules/.cache
npm run build
npm run deploy
```

### Problema: Git push rechazado
**Solución:**
```bash
# Si es el primer push y hay conflictos
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📊 Estructura de Ramas en GitHub

```
main (rama principal)
  └── Tu código fuente completo
  
gh-pages (rama de despliegue - creada automáticamente)
  └── Solo archivos de la carpeta dist/ (build compilado)
```

**No edites manualmente la rama gh-pages**, siempre usa `npm run deploy`.

---

## 🎯 Siguiente Paso Inmediato

1. **Resuelve el acceso a GitHub con 2FA** (opciones arriba)
2. **Ejecuta estos comandos cuando tengas acceso:**

```bash
# Comando todo-en-uno (copia y pega)
cd /Users/leomos/Desktop/Futoropolis && \
git init && \
git add . && \
git commit -m "Initial commit: Futurópolis Smart City 3D" && \
echo "✅ Git inicializado. Ahora crea el repositorio en GitHub y ejecuta:" && \
echo "git remote add origin https://github.com/leomos2022/futoropolis.git" && \
echo "git push -u origin main" && \
echo "npm run deploy"
```

---

## 📧 Soporte

Si encuentras algún problema durante el despliegue:
- GitHub Docs: https://docs.github.com/es/pages
- GitHub Support: https://support.github.com/
- Webpack Docs: https://webpack.js.org/guides/public-path/

---

**¡Tu proyecto está 100% listo para desplegar! 🎉**

Solo necesitas acceso a tu cuenta de GitHub y seguir los pasos arriba.
