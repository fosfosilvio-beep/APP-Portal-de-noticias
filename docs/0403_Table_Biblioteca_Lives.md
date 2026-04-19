# [0403] Tabela: biblioteca_lives

Armazena o acervo de transmissões passadas que ficam disponíveis sob demanda.

## Contrato de Dados (Esquema)

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único. |
| `titulo` | TEXT | Nome descritivo da live gravada. |
| `url` | TEXT (URL) | URL do vídeo (Facebook/Youtube/Vimeo). |
| `tema` | TEXT | Categoria ou tema da live (Ex: Entrevista, Evento). |
| `thumbnail` | TEXT (URL) | Imagem de capa para o catálogo. |
| `created_at` | TIMESTAMP | Data da gravação original. |

## Fluxo de Automação
Ao desligar a live no painel admin, o sistema automaticamente insere um registro nesta tabela se houver uma transmissão encerrada, utilizando os dados da configuração portal como base.

---
Status: Documentado
Relacionado: [[0204] Biblioteca](../02XX/0204_Biblioteca.md)
