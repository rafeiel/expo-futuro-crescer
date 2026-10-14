import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// A lista de alunos fica em src/data/alunos.local.json, que NÃO vai para o GitHub (.gitignore).
// Se o arquivo não existir (ex.: build no Netlify), a lista fica vazia e nada é importado.
const localFiles = import.meta.glob<{ default: { nome: string; turma: string }[] }>(
  '../data/alunos.local.json',
  { eager: true }
);
const alunos: { nome: string; turma: string }[] =
  Object.values(localFiles)[0]?.default ?? [];

export const totalAlunosLocais = alunos.length;

export async function importarAlunos() {
  if (alunos.length === 0) {
    console.warn('⚠️ Lista de alunos não disponível neste ambiente (src/data/alunos.local.json)');
    return;
  }

  let i = 0;
  for (const aluno of alunos) {
    await addDoc(collection(db, 'alunos'), {
      nome: aluno.nome,
      turma: aluno.turma,
    });
    i++;
    console.log(`✓ ${i}/${alunos.length} - ${aluno.nome} (${aluno.turma})`);
  }
  console.log(`✅ Importação concluída! ${alunos.length} alunos.`);
}
