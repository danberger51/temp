const { app, input } = require('@azure/functions');
const { v4: uuidv4 } = require('uuid');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',
    sqlQuery: "SELECT * FROM c WHERE c.id = @filmId",
    parameters: [
        {
            name: "@filmId",
            value: ""
        }
    ]
});

app.http('addComment', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'films/{filmId}/comments',
    extraInputs: [cosmosInput],
    handler: async (request, context) => {
        const filmId = context.bindingData.filmId;
        cosmosInput.parameters[0].value = filmId;
        
        const filmResult = context.extraInputs.get(cosmosInput);

        if (filmResult.length === 0) {
            return {
                status: 404,
                body: "Film nicht gefunden."
            };
        }

        const film = filmResult[0];
        const comment = {
            id: uuidv4(),
            userId: request.body.userId,
            content: request.body.content,
            date: new Date().toISOString()
        };

        if (!film.comments) {
            film.comments = [];
        }
        film.comments.push(comment);

        context.bindings.cosmosOutput = film;

        return {
            status: 201,
            body: film
        };
    }
});
