**Conectar Backend (NestJS API)**

Este projeto é a API backend do sistema **Conectar**, desenvolvida com NestJS, TypeORM e PostgreSQL. Ele fornece autenticação via JWT, gerenciamento de usuários com CRUD, filtros de listagem e suporte a usuários inativos.

---

## Recursos

- Autenticação com JWT
- Registro e login de usuários
- CRUD de usuários com roles (`manager` e `regular`)
- Listagem paginada e filtrada de usuários
- Endpoints para usuários ativos e inativos
- Docker Compose para PostgreSQL
- Boas práticas de desenvolvimento (Lint, Prettier, testes)

## Pré-requisitos

- Node.js >= 18
- npm ou yarn
- Docker & Docker Compose (opcional, para subir banco)

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/conectar-backend.git
   cd conectar-backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   # ou yarn install
   ```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```dotenv
# App
PORT=3000

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=3600s

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin
DB_DATABASE=conectar_system
```

## Scripts Disponíveis

No `package.json` estão os seguintes scripts principais:

| Comando             | Descrição                                 |
| ------------------- | ----------------------------------------- |
| `npm run start`     | Inicia a aplicação (modo prod)            |
| `npm run start:dev` | Inicia em modo de desenvolvimento (watch) |
| `npm run build`     | Compila o projeto                         |
| `npm run lint`      | Executa ESlint e corrige problemas        |
| `npm run format`    | Formata código com Prettier               |

## Executando Localmente

Após instalar e configurar as variáveis de ambiente:

```bash
# Banco local manual (sem Docker)
# Certifique-se de que o PostgreSQL está rodando nas configs do .env

# Em um terminal:
npm run start:dev
```

A API ficará disponível em `http://localhost:3000`.

## Docker Compose

Há um serviço Docker para o banco PostgreSQL definido em `docker-compose.yml`:

```yaml
services:
  conectar-postgres:
    image: postgres:latest
    container_name: conectar-postgres
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin
      - POSTGRES_DB=conectar_system
    ports:
      - '5432:5432'
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
      - ./docker/postgres/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh:ro
    networks:
      - conectar-network

networks:
  conectar-network:
    driver: bridge
```

Para subir o banco via Docker Compose:

```bash
docker-compose up -d
```

Em seguida, rode a API normalmente (`npm run start:dev`).

## Estrutura de Pastas

```text
src/
├── auth/               # Módulo de autenticação
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── guards/         # Strategies
│   └── guards/         # Guards (e.g. ManagerGuard)
├── user/               # Módulo de usuários
│   ├── core/
│   │   └── services/   # Lógica de negócio (UserService)
│   └── http/rest/dto/  # DTOs (CreateUserDto, UpdateUserDto, etc.)
├── app.module.ts       # Configurações globais
└── main.ts             # Ponto de entrada
```

## Endpoints da API

### Autenticação

| Método | Rota                 | Descrição                          | Guarda               |
| ------ | -------------------- | ---------------------------------- | -------------------- |
| POST   | `/api/auth/register` | Cria um novo usuário (role padrão) | —                    |
| POST   | `/api/auth/login`    | Autentica e gera token JWT         | `AuthGuard('local')` |

### Usuários

Todos os endpoints de usuário requerem cabeçalho `Authorization: Bearer <token>`.

| Método | Rota                  | Descrição                                     | Guarda         |
| ------ | --------------------- | --------------------------------------------- | -------------- |
| POST   | `/api/users`          | Cria usuário                                  | `ManagerGuard` |
| GET    | `/api/users`          | Lista usuários ativos (paginação e filtros)   | `ManagerGuard` |
| GET    | `/api/users/inactive` | Lista usuários inativos (paginação e filtros) | `ManagerGuard` |
| GET    | `/api/users/:id`      | Busca usuário por ID                          | JWT Guard      |
| PUT    | `/api/users/:id`      | Atualiza usuário por ID                       | JWT Guard      |
| DELETE | `/api/users/:id`      | Remove usuário (role manager)                 | `ManagerGuard` |

**Parâmetros de Query (FilterQueryDto):**

- `page`: número da página (padrão 1)
- `limit`: itens por página (padrão 10)
- `search`: termo de busca por nome ou email
