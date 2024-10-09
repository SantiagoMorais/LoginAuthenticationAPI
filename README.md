# API de criação de usuários e autenticação de senha

<img />

## Sumário

- [Bibliotecas](#bibliotecas)
  - [Dependências](#dependências)
  - [Dependências de Desenvolvimento](#dependências-de-desenvolvimento)
- [Passos iniciais - configuração com MongoDB Atlas](#passos-iniciais---configuração-com-mongodb-atlas)
- [Conexão com o banco de dados](#conexão-com-o-banco-de-dados)
  - [Configuração do arquivo .env](#configuração-do-arquivo-env)
  - [Configuração do mongoose](#configuração-do-mongoose)
- [Rotas da aplicação](#rotas-da-aplicação)
  - [Rota pública](#rota-pública)
  - [Rota de criação de um novo usuário](#rota-de-criação-de-novo-usuário)
  - [Rota de login](#rota-de-login)
  - [Rota privada - informações do usuário](#rota-privada---informações-do-usuário)
  - [Verificação de token válido](#verificação-de-token-válido)
  - [Criação de usuário](#criação-de-usuário)
  - [Login](#login)
  - [Coletar informações do usuário após login](#coletar-informações-do-usuário-após-login)

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

## Rotas da aplicação

### Rota pública

Rota inicial da aplicação, acessível a todos os usuários cadastrados ou não. Seria nossa sessão home.

```ts
export const publicRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/", (_, res) => {
    res
      .status(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({ message: "Initial route" });
  });
};
```

### Rota de criação de novo usuário

Nesta rota o usuário será criado e adicionado ao banco de dados. O código será divido em etapas e explicado logo abaixo:

```ts
export const createNewUser: FastifyPluginAsyncZod = async (app) => {
  app.post(
    // 1
    "/auth/register",
    {
      // 2
      schema: {
        body: z
          .object({
            name: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(6).max(15),
            confirmPassowrd: z.string().min(6).max(15),
          })
          .refine((data) => data.password === data.confirmPassowrd, {
            message: "Passwords must be the same",
            path: ["confirmPassword"],
          }),
      },
    },
    async (req, res) => {
      // 3
      const { name, email, password, confirmPassowrd } = req.body;

      // 4
      if (!name) {
        return res.status(422).send({ message: "Name is required" });
      }

      if (!email) {
        return res.status(422).send({ message: "Email is required" });
      }

      if (!password) {
        return res.status(422).send({ message: "Password is required" });
      }

      // 5
      const userExist = await User.findOne({ email });

      if (userExist) {
        return res
          .status(422)
          .send({ message: "This email is already in use" });
      }

      // 6
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // 7
      const user = new User({
        name,
        email,
        password: passwordHash,
      });

      try {
        // 8
        await user.save();
        res.status(201).send({
          message: "User successful created",
          user,
        });
      } catch (error) {
        // 9
        res
          .status(500)
          .send({ msg: "Something went wrong, please try again later." });
      }
    }
  );
};
```

1. Nossa rota para registro de usuário.

2. Schema utilizando zod, para que ele seja o responsável para garantir que os dados recebidos pelo corpo da requisição estão corretamente preenchidos.

3. Desestruturação do corpo da requisição, com os dados que definimos no nosso schema utilizando zod.

4. Verificações adicionais para verificar se todos os campos foram preenchidos.

5. Checar se o usuário existe, verificando se existe algum usuário com o email recebido já cadastrado no banco de dados.

6. Criando o sistema de senha

- **salt:** é um valor aleatório que é gerado e adicionado à senha antes de ser processada por um algoritmo de hash (como o bcrypt). O propósito do salt é garantir que a mesma senha não produza o mesmo hash quando é armazenada em diferentes lugares. Isso ajuda a proteger as senhas contra ataques de pré-computação, como tabelas rainbow.
- **passwordHash:** é a versão "hash" da senha original, que foi gerada usando o algoritmo bcrypt junto com o salt. Quando um usuário tenta fazer login, a senha fornecida é hasheada novamente com o mesmo salt, e o hash resultante é comparado com o hash armazenado no banco de dados. Se os hashes corresponderem, a senha está correta.
- Em resumo, o uso de salt e hashing torna o armazenamento de senhas mais seguro, dificultando a recuperação da senha original, mesmo que alguém tenha acesso ao banco de dados.

7. Criando o usuário no banco de dados.

8. O método `.save()` vai persistir o dado no banco de dados e salvá-lo.

9. Verificações de erro, para casos de erros no servidor.

Passando por todos os testes e sendo todos os dados bem preenchidos, o resultado será este:

![Resultado de um usuário criado com sucesso](src/assets/screenshots/userCreated.png)

Veja que a senha foi corretamente criptografada. Tenha em mente que a senha que visualizamos não é a que o usuário escreveu. Mesmo que a senha seja simples e curta ela terá este padrão "aleatório". As senhas dos usuários são armazenadas de forma segura utilizando criptografia com o algoritmo bcrypt. Quando um usuário se registra, sua senha é **hasheada**, gerando uma sequência de caracteres que não revela a senha original. Mesmo que alguém tenha acesso ao banco de dados, não conseguirá descobrir as senhas dos usuários.

Durante o processo de login, a senha fornecida pelo usuário é novamente hasheada com o mesmo algoritmo e salt. O bcrypt compara o hash resultante com o hash armazenado no banco de dados. Se ambos os hashes corresponderem, a senha está correta e o acesso é concedido. Essa abordagem oferece uma camada extra de segurança, garantindo que as senhas dos usuários permaneçam protegidas, mesmo em caso de comprometimento do banco de dados.

Por fim, verificamos se o usuário já existe no banco de dados. Se tentarmos criar um novo usuário utilizand o mesmo email já cadastrado o resultado será este:

![Aviso de email já cadastrado no banco de dados](src/assets/screenshots/duplicatedUser.png)

### Rota de login

Após a criação de um novo usuário, precisamos checar suas credenciais, criptografar usa senha e verificar se ela bate com a enviada no corpo da requisição e realizar um token de segurança com `jwt`. Vamos aprofundar um pouco mais quais são os objetivos do `jwt`.

```ts
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { login } from "../../functions/login.ts";

export const loginRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth/user",
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6).max(15),
        }),
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      await login({ email, password, res });
    }
  );
};
```

A rota de login recebe o plugin que conexta o zod ao fastify, para que o zod se responsabilize pela checagem dos dado que virão no corpo da requisição, definidos no schema.
Assim, após coletarmos o email e senha do corpo da requisição, através da desestruturação de objeto, enviamos para a função `login`, para lá realizar as verificações necessárias dos daods.

```ts
export const login = async ({ email, password, res }: ILogin) => {
  // 1
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .send({ message: "User not found, please check your email" });
  }

  // 2
  if (!user.password || typeof user.password !== "string") {
    return res
      .status(500)
      .send({ message: "Password data is invalid or missing" });
  }

  // 3
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(401).send({ message: "Email or Password incorrect" });
  }

  // 4
  try {
    const secret = env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    // 5
    res
      .status(200)
      .send({ message: "Autenticação realizada com sucesso", token });
  } catch (error) {
    res
      .status(500)
      .send({ msg: "Something went wrong, please try again later." });
  }

  res.send(user);
};
```

1. Primeiro, precisamos checar se o email enviado corresponde a algum email de usuário já cadastrado no banco de dados. Caso não, o usuário deve primeiro se cadastrar.
2. Como estamos utilizando TypeScript, precisamos garantir que a senha recebida não é inválida ou que não seja do tipo string, para só assim conferir se a senha corresponde à senha do usuário.
3. Verificar se a senha bate com a senha do usuário corresponte ao email inserido.
4. Aqui realizamos a autenticação do usuário no sistema:

- Precisamos criar aqui uma nova variável ambiente com uma hash aleatória e autenticá-la com o zod no nosso arquivo env.ts, como as demais variáveis de ambiente.

```
DB_USER=<nome-de-usuario>
DB_PASSWORD=<senha-de-administrador>
SECRET=<senha-secreta-de-acesso-exclusivo-do-servidor>
```

- Um token é criado utilizando o [Json Web Token](https://jwt.io). Utilizando o método `sign()` recebemos dois parâmetros, um objeto com o id do usuário, onde coletamos através do `user._id` e o segundo parâmetro é o nosso `secret`. Qual é o objetivo disso?
  - O JWT (JSON Web Token) é usado para autenticar usuários de forma segura. Neste trecho de código, ele gera um token após o login bem-sucedido, que contém o ID do usuário e é assinado com um segredo conhecido apenas pelo servidor.
  - Esse token é enviado do servidor para o cliente, onde é usado em futuras requisições para acessar rotas protegidas sem precisar fazer login novamente.
  - O servidor valida o token em cada requisição para garantir que o usuário é legítimo, mantendo a segurança da aplicação.
  - Isso garante que informações seguras, como dados do usuário, só sejam visíveis após o seu login, evitando usuários mal-intencionados de acessar tais dados sem realizar o login previamente ou usar um token inválido.
  - Este token é armazenado no lado do cliente através do `localStorage` ou em `cookies`, este seria mais seguro. Ou seja, nem o usuário entra em contato ou vê este token.

5. Ocorrendo tudo bem, o usuário recebe uma mensagem de sucesso e o seu token. Caso não, recebe uma mensagem de erro no servidor.

### Rota privada - informações do usuário

Vamos pesquisar os dados do usuário através do seu id.

```ts
export const getUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/user/:id",
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (req, res) => {
      const id = req.params.id;

      await getUserInfo({ id, res });
    }
  );
};
```

Após receber o id do usuário através do nosso `params`, enviamos ele e a `response` da nossa rota para a função `getUserInfo`, que será responsável pelas verificações necessárias e retorno dos dados do usuário:

```ts
interface IGetUserInfo {
  id: string;
  res: FastifyReply;
}

export const getUserInfo = async ({ id, res }: IGetUserInfo) => {
  // 1
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ message: "Invalid ID format" });
  }

  try {
    // 2
    const user = await User.findById(id, "-password");

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).send({ user });
  } catch (error) {
    res
      .status(500)
      .send({ msg: "Something went wrong, please try again later." });
  }
};
```

1. Verificação se o id passado é um ObjectId, que é o aceito pelo Mongodb. Deve ter 24 caracteres com o padrão /^[0-9a-f]{24}$/.

2. Aqui é realizado um filtro para bloquear que a senha do usuário seja enviada e visível. usando a string "-password" como segundo argumento tiramos ela do retorno.

### Verificação de token válido

Claro que antes das informações do usuário serem mostradas é necessário verificar se o usuário possui um token no cabeçalho da requisição e se possuir, se é válido ou não.
Criamos uma função para verificar tais dados:

```ts
export const getUserRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/user/:id",
    //... ,
    async (req, res) => {
      const id = req.params.id;
      // 1
      checkToken(req, res);

      // 2
      await getUserInfo({ id, res });
    }
  );
};
```

1. Verificação da validade do token antes de prosseguir.

2. Caso a validação ocorra corretamente, a função getUserInfo() é executada e os dados mostrados.

```ts
import { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.ts";
import jwt from "jsonwebtoken";

export const checkToken = (req: FastifyRequest, res: FastifyReply) => {
  // 1
  const authHeader = req.headers["authorization"];
  // 2
  const token = authHeader && authHeader.split(" ")[1];

  // 3
  if (!token) {
    return res.status(401).send({ message: "Access denied!" });
  }

  // 4
  try {
    const secret = env.SECRET;
    // 5
    jwt.verify(token, secret);
    // 6
  } catch (error) {
    res.status(400).send({ message: "Invalid token!" });
  }
};
```

1. Coleta o token do headers

2. O token vem por padrão como uma string no padrão "Bearer meu-token". Aqui separamos em um array o "Bearer" e o token, que é separado por um espaço. Transformado em um array, pegamos a segunda parte que é o token em si.

3. Caso não haja nenhum token no nosso header, o acesso é negado.

4. Caso haja um token, precisamos validá-lo.

5. Coletamos o método `verify()` para verificar o token recebido, recebendo o `secret` como parâmetro. Caso haja um erro, ele cairá no `catch`.

6. Caso não haja erro, ele seguirá na aplicação e poderá acessa a rota. Diferente do express não precisamos de um `next()` para passar para um próximo middleware. O Fastify sabe que é necessário completar esta requisição antes de dar seguimento.

Como simular se está tudo corretamente configurado?

### Criação de usuário

![Resposta do servidor diante da criação de usuário](src/assets/screenshots/userCreatedResponse.png)

### Login

![Resposta do servidor diante do login do usuário](src/assets/screenshots/loginResponse.png)

Reforçando que o token não será visível para o usuário, mas será enviado pelo cabeçalho da requisição e então armazenado em um cookie.

### Coletar informações do usuário após login

![Resposta do servidor diante da ausencia de um token](src/assets/screenshots/accessDenied.png)

Caso tenhamos o id do usuário e coloquemos diretamente na url, o servidor responderá com uma mensagem de erro, pois não temos posse do token e não utilizamos ele no cabeçalho da requisição.

Isso mostra que a função funcionou e somente o usuário que realizar o login, contendo email e senha poderão acessar os dados pessoais do usuário.

Para que tenhamos acesso aos seus dados, após a realização do login, o token de segurança será enviado ao headers e guardado via token. Para simularmos isso, vamos utilizar do [ThunderClient]() ou a ferranebta de testes de api que esteja utilizando, a sessão de autorização via `Bearer` e adicionar o token que recebemos no login:

![Resposta do servidor diante a autenticação bem sucedida do token](src/assets/screenshots/successfullTokenAuthentication.png)

Caso utilizemos um token inválido, o servidor também irá responder com uma mensagem de token inválido. Note que o `JWT` é sensível, inclusive, a letras maiúsculas e minúsculas.

![Resposta do servidor diante de um token inválido](src/assets/screenshots/invalidToken.png)

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

### Configurando nosso modelo / model

Na pasta `src/models/User.ts` criamos nosso esquema do banco de dados, os dados que o banco receberá para criação da tabela.

```ts
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
});

export const User = mongoose.model("User", userSchema);
```

Agora através do `User` (deve ser em maiúscula mesmo, por padrão) conseguimos utilizar as funcionalidades do banco de dados através de filtros, como encontrar dados ou adicioná-los.

## Como executar o projeto

1. Clonar o projeto via github

2. Ter Node e npm instalados. Neste projeto foram utilizados nas versões:
    - Node v20.17.0
    - npm v10.8.2

2. Instalar as dependências via `npm install`

3. Criar um novo usuário no [MongoDB Atlas](https://www.mongodb.com/pt-br). A versão gratuita é o suficiente.

4. Criar um novo projeto no Mongodb Atlas e o banco de dados.
![Criação de novo projeto no mongodb](src/assets/screenshots/mongodbNewProject.png)

5. Ir em banco de dado, data services e criar novo cluster
![Criação de novo cluster no mongodb](src/assets/screenshots/mongodbCreateNewCluster.png)

6. Em Security, Database Access, adicicionar novo usuário ao banco de dados:
![Criação de novo usuário no mongodb](src/assets/screenshots/mongodbCreateNewUser.png)

7. Copie e salve o nome de usuário e a senha de administrador escolhida, pois eles serão necessários para ter acesso ao banco de dados.

8. Crie um arquivo `.env` na raiz da sua aplicação e adicione seu nome de usuário, senha e secret neste padrão:
    - ignore a abertura e fechamento de chaves "<>", coloque os dados sem aspas ou qualquer outro caracter especial os envolvendo.

```
DB_USER=<nome-de-usuario>
DB_PASSWORD=<senha-de-administrador>
SECRET=<senha-secreta-de-acesso-exclusivo-do-servidor>
```

9. Em Security, Network Access adicionar um novo endereço de IP para que seu IP tenha permissão de acessar o banco de dados. Você pode permitir acesso de qualquer lugar ou estritamente de seu IP nas opções

![Adicionar endereço de IP](src/assets/screenshots/mongodbNetworkAccess.png)

10. A medida que você cadastrar dados no banco de dados você os verá nas `collections` do `cluster`

![Visualizar dados no banco](src/assets/screenshots/mongodbBrowserCollections.png)

11. Rodar o servidor utilizando o código no terminal `npm run dev` e o servidor começará a funcionar. Caso apareça alguma mensagem de erro, conferir se as configurações foram todas realizadas corretamente.