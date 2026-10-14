# Expo Futuro – Construindo a Cidade do Amanhã

Site da feira de ciências do Centro Educacional Crescer (Macaé), 14/10/2026.
Base: UPverse 2025 (React + TypeScript + Vite + Tailwind + Firebase Firestore + Netlify).

## Como funciona
- O visitante (ou responsável por um aluno) inicia a jornada e escaneia **10 QR Codes**, um por turma: `EXPO-601`, `EXPO-602`, `EXPO-701`, `EXPO-702`, `EXPO-801`, `EXPO-901`, `EXPO-902`, `EXPO-1001`, `EXPO-2001`, `EXPO-3001`.
- A ordem é livre; a "Próxima etapa" só sugere a próxima turma (601 → 3001).
- Cada leitura revela a imagem daquela turma. Com as 10, o QR `BRINDE` libera o brinde.
- `/stats`: painel admin (login pelas variáveis `VITE_ADMIN_USER` e `VITE_ADMIN_PASS`).

## Onde trocar as coisas
| O quê | Arquivo |
|---|---|
| Logo de destaque | `public/logo-expo.png` (mesmo nome) |
| Mapa do colégio | `public/mapa-escola.png` (mesmo nome) |
| Imagens das 10 turmas | `public/stations/601.png` … `3001.png` (mesmos nomes) |
| Temas, grupos e QR de cada turma | `src/data/stations.ts` |
| Lista de alunos (fica fora do Git) | `src/data/alunos.local.json` |

## Colocar no ar
1. `npm install`
2. Firebase: criar projeto → Firestore → registrar Web App → copiar as chaves para `.env` (veja `.env.example`).
3. `npm run dev`, abrir o site, F12 → Console → `importarAlunos()` **uma única vez** (192 alunos).
4. Subir para um repositório novo no GitHub e criar um site novo no Netlify ligado a ele.
5. No Netlify, em Environment variables, cadastrar as mesmas chaves do `.env`.
