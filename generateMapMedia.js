// generateMediaMap.js
const fs = require('fs');
const path = require('path');

// Dostosuj ścieżki do swojej struktury projektu
const imagesDir = path.join(__dirname, 'assets/images'); // lub gdzie masz swoje media
const outputFile = path.join(__dirname, 'assets/mediaMap.ts');

function generateMediaMap() {
   try {
      // Sprawdź czy folder istnieje
      if (!fs.existsSync(imagesDir)) {
         console.error(`❌ Folder nie istnieje: ${imagesDir}`);
         console.log('📁 Sprawdź ścieżkę do folderu z mediami w skrypcie');
         return;
      }

      const files = fs.readdirSync(imagesDir);
      console.log(`📁 Znaleziono ${files.length} plików w folderze`);

      // Filtruj tylko pliki mediów, pomijając splash/icon/adaptive-icon oraz wybrane pliki
      const ignoreFiles = [
         'w11 korytarz  z 005.jpg',
         'w11_korytarz_z_001.jpg',
      ];
      const mediaFiles = files.filter(file => {
         const ext = path.extname(file).toLowerCase();
         const lower = file.toLowerCase();
         if (lower.includes('splash') || lower.includes('icon') || lower.includes('adaptive')) return false;
         if (ignoreFiles.includes(lower)) return false;
         return ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.wmv', '.avi'].includes(ext);
      });

      console.log(`🎬 Plików mediów: ${mediaFiles.length}`);

      let mapContent = `// Auto-generated file - DO NOT EDIT MANUALLY\n`;
      mapContent += `// Run 'node generateMediaMap.js' to regenerate\n`;
      mapContent += `// Generated on: ${new Date().toISOString()}\n\n`;
      mapContent += `export const MEDIA_MAP: { [key: string]: any } = {\n`;

      mediaFiles.forEach(file => {
         mapContent += `  '${file}': require('./images/${file}'),\n`;
      });

      mapContent += `};\n\n`;
      mapContent += `export const getMediaSource = (filename: string | null) => {\n`;
      mapContent += `  if (!filename) return null;\n`;
      mapContent += `  return MEDIA_MAP[filename] || null;\n`;
      mapContent += `};\n\n`;
      mapContent += `export const isMediaAvailable = (filename: string | null) => {\n`;
      mapContent += `  if (!filename) return false;\n`;
      mapContent += `  return filename in MEDIA_MAP;\n`;
      mapContent += `};\n`;

      // Stwórz folder assets jeśli nie istnieje
      const assetsDir = path.dirname(outputFile);
      if (!fs.existsSync(assetsDir)) {
         fs.mkdirSync(assetsDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, mapContent);
      console.log(`✅ Wygenerowano mapę mediów z ${mediaFiles.length} plikami`);
      console.log(`📄 Plik wyjściowy: ${outputFile}`);
      console.log(`\n📋 Lista plików:`);
      mediaFiles.forEach(file => console.log(`   - ${file}`));
   } catch (error) {
      console.error('❌ Błąd podczas generowania mapy mediów:', error.message);
   }
}

generateMediaMap();