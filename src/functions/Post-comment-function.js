const { app, input, output } = require('@azure/functions');
const { v4: uuidv4 } = require('uuid');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',
    sqlQuery: "SELECT * FROM c WHERE c.id = {filmId}",
    parameters: [
        {
            name: "@filmId",
            value: ""
        }
    ]
});

const cosmosOutput = output.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB'
});

app.http('addComment', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'films/{filmId}/comments',
    extraInputs: [cosmosInput],
    extraOutputs: [cosmosOutput],
    handler: async (request, context) => {
        const filmId = context.bindingData.filmId;
        console.log(`Received request to add comment for filmId: ${filmId}`);
        
        cosmosInput.parameters[0].value = filmId;

        const filmResult = context.extraInputs.get(cosmosInput);
        console.log(`Query result: ${JSON.stringify(filmResult)}`);

        if (filmResult.length === 0) {
            console.log(`Film with id ${filmId} not found.`);
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
        
        console.log(`New comment: ${JSON.stringify(comment)}`);

        if (!film.comments) {
            film.comments = [];
        }
        film.comments.push(comment);

        context.extraOutputs.set(cosmosOutput, film);

        console.log(`Updated film document: ${JSON.stringify(film)}`);

        return {
            status: 201,
            body: comment
        };
    }
});
