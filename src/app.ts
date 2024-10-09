import fastify from "fastify";

const app = fastify();
const port = 3000

app.listen({port}, (err) => {
    if (err) {
        app.log.error(err)
    }
    console.log(`Server running on http://localhost${port}`);
})