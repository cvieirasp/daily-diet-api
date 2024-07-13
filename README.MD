# Daily Diwt API (Desafio 02)

Desafio referente ao módulo: Rotas e HTTP

## Introdução

O desafio consiste no desenvolvimento de uma API para controle de dieta diária, a **Daily Diet API**.

### Regras da aplicação

- Deve ser possível criar um usuário
- Deve ser possível identificar o usuário entre as requisições
- Deve ser possível registrar uma refeição feita, com as seguintes informações:
  _As refeições devem ser relacionadas a um usuário._
  - Nome
  - Descrição
  - Data e Hora
  - Está dentro ou não da dieta
- Deve ser possível editar uma refeição, podendo alterar todos os dados acima
- Deve ser possível apagar uma refeição
- Deve ser possível listar todas as refeições de um usuário
- Deve ser possível visualizar uma única refeição
- Deve ser possível recuperar as métricas de um usuário
  - Quantidade total de refeições registradas
  - Quantidade total de refeições dentro da dieta
  - Quantidade total de refeições fora da dieta
  - Melhor sequência de refeições dentro da dieta
- O usuário só pode visualizar, editar e apagar as refeições o qual ele criou

### Estrutura (propriedades)

Usuário:

- `id` - Identificador único de cada usuário.
- `name` - Nome do usuário.
- `email` - E-mail do usuário.
- `created_at` - Data de quando o usuário foi criado.

Refeição:

- `id` - Identificador único de cada refeição.
- `user_id` - Identificador do usuário.
- `name` - Nome da refeição.
- `description` - Descrição da refeição.
- `meal_date` - Data e hora da refeição.
- `in_diet` - Indica se está ou não dentro da dieta.
- `created_at` - Data de quando o registro foi criado.
- `updated_at` - Deve ser sempre alterado para a data de quando o registro foi atualizado.

Rotas:

- `POST - /user`
  Deve ser possível criar um **usuário** no banco de dados, enviando os campos `name` e `email` por meio do `body` da requisição. Ao criar um usuário, os campos: `id` e `created_at` serão preenchidos automaticamente.
