# Daily Diet API (Desafio 02)

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
- `session_id` - Identificador da sessão do usuário.
- `created_at` - Data de quando o usuário foi criado.
- `updated_at` - Deve ser sempre alterado para a data de quando o usuário foi atualizado.

Refeição:

- `id` - Identificador único de cada refeição.
- `user_id` - Identificador do usuário.
- `name` - Nome da refeição.
- `description` - Descrição da refeição.
- `meal_date` - Data e hora da refeição.
- `on_diet` - Indica se está ou não dentro da dieta.
- `created_at` - Data de quando o registro foi criado.
- `updated_at` - Deve ser sempre alterado para a data de quando o registro foi atualizado.

Rotas:

- `POST - api/user`
  Cria um **usuário** no banco de dados, enviando os campos `name` e `email` via corpo da requisição. Ao criar o usuário, os campos: `id`, `created_at` e `updated_at` são preenchidos automaticamente. O campo `session_id` é gerado automaticamente após a criação do usuário, armazenando o valor da sessão nos cookies. Retorna **Status 201** caso o registro tenha sido criado com sucesso.

  <br>Exemplo da requisição:

  ```json
  {
      "name": "Carlos Henrique",
      "email": "carlos.henrique@mail.com"
  }
  ```

  Exemplo de retorno:

  ```json
  {
    "session_id": "17e27f5d-7a58-4720-87fc-c5b16efab9fb"
  }
  ```
  
- `POST - api/meal`
  Cria uma **refeição** no banco de dados, enviando os campos `name`, `description`, `meal_date` e `on_diet` via corpo da requisição. O campo `user_id` é obtido através da sessão armazenada nos cookies. Ao criar a refeição, os campos: `id`, `created_at` e `updated_at` são preenchidos automaticamente. Retorna **Status 201** caso o registro tenha sido criado com sucesso.

  <br>Exemplo de corpo da requisição:

  ```json
  {
      "name": "Minha refeição",
      "description": "Descrição da minha refeição",
      "meal_date": "2024-01-01T10:00:00.000Z",
      "on_diet": true
  }
  ```

  Exemplo de retorno:

  ```json
  {
    "id": "594d2918-118d-4c68-a39d-380cc590866b",
    "user_id": "1a5fa847-b91b-4085-8933-348060fd58d8",
    "name": "Minha refeição",
    "description": "Descrição da minha refeição",
    "meal_date": "2024-01-01T10:00:00.000Z",
    "on_diet": true,
    "created_at": "2024-11-07T21:53:14.223Z",
    "updated_at": "2024-11-07T21:53:14.223Z"
  }
  ```

- `PATCH - api/meal/:id`
  Atualiza uma **refeição** no banco de dados, enviando os campos `name`, `description`, `meal_date` e `on_diet` via corpo da requisição. O campo `user_id` é obtido através da sessão armazenada nos cookies e o `id` da refeição é passado via parâmetro. Ao atualizar a refeição, os campos são alterados pelos enviados na requisição e o campo `updated_at` é atualizado automaticamente. Retorna **Status 204** caso o registro tenha sido atualizado com sucesso.

  <br>Exemplo de corpo da requisição:

  ```json
  {
      "name": "Minha refeição",
      "description": "Descrição da minha refeição",
      "meal_date": "2024-01-01T10:00:00.000Z",
      "on_diet": true
  }
  ```

- `DELETE - api/meal/:id`
  Remove uma **refeição** do banco de dados referente ao `id` enviado como parâmetro. O campo `user_id` é obtido através da sessão armazenada nos cookies. Retorna **Status 204** caso o registro tenha sido removido com sucesso.

- `GET - api/meal/:id`
  Retorna uma **refeição** do banco de dados especificada pelo `id` enviado como parâmetro. O campo `user_id` é obtido através da sessão armazenada nos cookies. Retorna **Status 200** caso o registro tenha sido encontrado.

  <br>Exemplo de retorno:

  ```json
  {
    "id": "594d2918-118d-4c68-a39d-380cc590866b",
    "user_id": "1a5fa847-b91b-4085-8933-348060fd58d8",
    "name": "Minha refeição",
    "description": "Descrição da minha refeição",
    "meal_date": "2024-01-01T10:00:00.000Z",
    "on_diet": true,
    "created_at": "2024-11-07T21:53:14.223Z",
    "updated_at": "2024-11-07T21:53:14.223Z"
  }
  ```

- `GET - api/meal/`
  Retorna a lista de **refeições** do banco de dados referente ao usuário. O campo `user_id` é obtido através da sessão armazenada nos cookies. Retorna **Status 200**.

  <br>Exemplo de retorno:

  ```json
  {
    [
      "id": "594d2918-118d-4c68-a39d-380cc590866b",
      "user_id": "1a5fa847-b91b-4085-8933-348060fd58d8",
      "name": "Minha refeição",
      "description": "Descrição da minha refeição",
      "meal_date": "2024-01-01T10:00:00.000Z",
      "on_diet": true,
      "created_at": "2024-11-07T21:53:14.223Z",
      "updated_at": "2024-11-07T21:53:14.223Z"
    ]
  }
  ```

  - `GET - api/meal/`
  Retorna um resumo das **refeições** do usuário. O campo `user_id` é obtido através da sessão armazenada nos cookies. Retorna **Status 200**.

  <br>Exemplo de retorno:

  ```json
  {
      "totalMeals": 5,
      "totalDietMeals": 3,
      "totalNotDietMeals": 2,
      "bestDietSequence": [
          "Minha refeição saudável 1",
          "Minha refeição saudável 2"
      ]
  }
  ```
  