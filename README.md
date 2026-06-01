# Klotski

Un Klotski responsive, tactil y sin dependencias, preparado para publicarse en GitHub Pages.

## Caracteristicas

- Tablero clasico de 4 x 5.
- Movimiento por gestos tactiles, flechas del teclado o botones grandes.
- Contador de movimientos, deshacer y reinicio.
- Mejor puntuacion guardada en `localStorage`.
- App estatica: basta con servir los archivos o abrir `index.html`.

## Probar en local

Puedes abrir `index.html` directamente en el navegador. Si prefieres servirlo:

```bash
python -m http.server 8000
```

Despues abre `http://localhost:8000`.

## Publicar en GitHub Pages

Este proyecto ya esta preparado para publicarse con GitHub Pages mediante GitHub Actions.

1. Crea un repositorio en GitHub, por ejemplo `klotski`.
2. Conecta este proyecto local con el repositorio:

```bash
git remote add origin https://github.com/TU_USUARIO/klotski.git
git branch -M main
git push -u origin main
```

3. En GitHub entra en `Settings > Pages`.
4. En `Build and deployment`, selecciona `GitHub Actions`.
5. Guarda. El workflow `.github/workflows/pages.yml` desplegara la app automaticamente.
6. La URL tendra este formato:

```text
https://TU_USUARIO.github.io/klotski/
```

El archivo `.nojekyll` evita que GitHub Pages procese el proyecto con Jekyll.
