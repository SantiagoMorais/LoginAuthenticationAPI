# API de criação de usuários e autenticação de senha

<img />

## Sumário

- [Bibliotecas](#bibliotecas)
  - [Dependências](#dependências)
  - [Dependências de Desenvolvimento](#dependências-de-desenvolvimento)
- [Passos iniciais - configuração com MongoDB Atlas](#passos-iniciais---configuração-com-mongodb-atlas)
- [Rotas da aplicação](#rotas-da-aplicação)
  - [Rota pública](#rota-pública)
- [Conexão com o banco de dados](#conexão-com-o-banco-de-dados)
    - [Configuração do arquivo .env](#configuração-do-arquivo-env)
    - [Configuração do mongoose](#configuração-do-mongoose)

## Bibliotecas

### Dependências

- [bcrypt](https://www.npmjs.com/package/bcrypt): Utilizado para criptografar senhas antes de armazená-las no banco de dados e compará-las durante o login. É uma camada extra de segurança para proteger as senhas dos usuários contra ataques.

- [dotenv](https://www.npmjs.com/package/dotenv): Carrega variáveis de ambiente de um arquivo .env para a aplicação. Isso é crucial para manter dados sensíveis, como chaves de API e senhas, fora do código-fonte, garantindo mais segurança. Ele oferece benefícios em organização, segurança e facilidade de uso, especialmente em projetos maiores ou colaborativos, tornando as configurações mais gerenciáveis e protegidas durante o desenvolvimento.

- [Zod](https://zod.dev/): Valida esquemas que garante a segurança dos dados. Valida dados de formulário, variáveis de ambiente e muito mais.

- [Fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod): Integra o **Zod** com o **Fastify**, permitindo validar e tipar dados das requisições HTTP para evitar erros. Usa validações do Zod para definir e validar o `body`, `params`, `query` e `headers` das requisições.

- [@fastify/cors](https://github.com/fastify/fastify-cors): Plugin do Fastify que configura o CORS (Cross-Origin Resource Sharing), uma medida de segurança que limita o acesso ao backend, permitindo apenas frontends específicos.

- [Fastify](https://fastify.dev): Framework web para Node.js usado para criar APIs e servidores HTTP (similar ao Express.js) e possio suporte à tipagem TypeScript.

- [jsonWebToken](https://jwt.io): Utilizado para criar e validar tokens de autenticação. Ele é fundamental para garantir que apenas usuários autenticados tenham acesso a determinadas partes da aplicação, especialmente em sistemas de login.

- [mongoose](https://mongoosejs.com): É uma biblioteca para Node.js que conecta nossa aplicação ao MongoDB, permitindo criar esquemas de dados, definir relacionamentos e realizar consultas ao banco de forma mais simples. Ele é essencial para manipular dados no MongoDB com facilidade.

### Dependências de Desenvolvimento

- [ESLint](https://eslint.org/): Ferramenta para análise de código, responsável por identificar erros e inconsistências, como variáveis não utilizadas ou não declaradas.

- [Prettier](https://prettier.io/): Ferramenta de formatação de código como indentação, espaçamento, uso de aspas simples ou duplas, etc, garantindo consistência no estilo do código.

- [tsx](https://tsx.is): tsx significa "TypeScript Excecute" e é um aprimoramento do Node.js para executar TypeScript. Podemos pensar no tsx como um "apelido" para node no terminal, substituindo `node src/app.js` por `tsx src/app.ts`

## Passos iniciais - configuração com MongoDB Atlas

1. Criar uma conta de usuário no site [MongoDB Atlas](https://www.mongodb.com/pt-br)
   - A termos de estudos e desenvolvimento, o site possui opções de criação de uma versão gratuita de bancos de dado
2. Criar o seu banco de dados e configurar o seu cluster
3. Database Access:
   - Ir na sessão de acesso ao banco de dados e criar um usuário administrador. Copie e salve o nome do usuário e senha, pois estes dados serão necessários no nosso arquivo `.env` para termos acesso ao banco de dados.
4. Network Access:
   - Adicionar o IP de sua máquina para que o meu IP tenha acesso ao banco de dados.
5. Pronto, em **Browser Colletions** na sessão **Databases** é possível visualizar nosso banco de dados. Não é necessário criar um schema posteriormente, pois o MongoDB permite a criação da tabela a medida que a aplicação é desenvolvida.
6. Por fim, configurar seus dados no arquivo .env, criando as variáveis de usuário e senha neste padrão:

```.env
DB_USER=<seu-nome-de-usuario-do-mongodb-atlas>
DB_PASSWORD=<sua-senha-de-administrador>
```

## Rotas da aplicação

### Rota pública

Rota inicial da aplicação, acessível a todos os usuários cadastrados ou não. Seria nossa sessão home.

```ts
app.get("/", (req, res) => {
  res
    .status(200)
    .header("Content-Type", "application/json; charset=utf-8")
    .send({ msg: "Rota inicial" });
});
```

## Conexão com o banco de dados

### Configuração do arquivo .env

Primeiramente configure o seu arquivo .env com os dados do usuário administrador como orientado acima:

```.env
DB_USER=<seu-nome-de-usuario-do-mongodb-atlas>
DB_PASSWORD=<sua-senha-de-administrador>
```

Em seguida crie o arquivo de configuração `env.ts` para utilizarmos o zod para lidar com a validação das variáveis de ambiente:

```ts
import { z } from "zod";

const envSchema = z.object({
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
```

### Configuração do mongoose

Na nosa aplicação, devemos importar `import mongoose from "mongoose"` e utilizar o método `mongoose.connect()` que recebe como parâmetro a url de acesso ao banco de dados. Nesta url é necessário adicionar o nome do usuário e senha de administrador dessa forma:

```ts
const dbUser = env.DB_USER;
const dbPassword = env.DB_PASSWORD;

mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rbacb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
);
```

Em seguida, utilizaremos o método `then()`, para que caso a conexão com o banco de dados funcione, ativaremos nosso servidor e informaremos pelo log que a conexão foi bem sucedida e utilizar o método `catch(err)` para caso ocorra algum erro.

```ts
  .then(() => {
    app.listen({ port }, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Connected in Mongo Database`);
    });
  })
  .catch((err) => console.log(err));
```

