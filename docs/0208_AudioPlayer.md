# [0208] Componente: AudioPlayer

Player de áudio minimalista com visualização de onda sonora em tempo real.

## Informações Gerais
- **Arquivo**: `src/components/AudioPlayer.tsx`
- **Biblioteca**: `wavesurfer.js`
- **Responsabilidade**: Reproduzir arquivos de áudio com interface flat e responsiva.

## Propriedades (Props)
| Prop | Tipo | Descrição |
| :--- | :--- | :--- |
| `audioUrl` | `string` | URL absoluta ou relativa do arquivo de áudio (mp3, wav, etc). |

## Design e Comportamento
- **Visual**: Design flat (sem sombras pesadas), focado em tipografia e no gráfico de onda.
- **Cores**:
  - Onda (não reproduzida): `slate-300` (#D1D5DB).
  - Progresso: `red-500` (#EF4444).
- **Funcionalidades**:
  - Play/Pause alternável.
  - Exibição de duração total/tempo restante.
  - Seletor de velocidade: Alterna entre `1x`, `1.5x` e `2x`.
- **Responsividade**: O gráfico se adapta automaticamente à largura do container pai.

## Exemplo de Uso
```tsx
import AudioPlayer from "@/components/AudioPlayer";

export default function Exemplo() {
  return (
    <div className="max-w-md mx-auto p-4">
      <AudioPlayer audioUrl="https://site.com/audio.mp3" />
    </div>
  );
}
```

## Dependências
- `wavesurfer.js`
- `lucide-react`
- `tailwind-css`

---
Status: Criado
Relacionado: [[0202] Noticia_Detalhe](0202_Noticia_Detalhe.md)
