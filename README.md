# API de criação de usuários e autenticação de senha

<img />

## Sumário
- [Bibliotecas](#bibliotecas)

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

