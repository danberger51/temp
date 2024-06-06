const { app, input, output } = require('@azure/functions');


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
    connection: 'CosmosDB',
    createIfNotExists: true
});

app.http('addComment', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'films/{filmId}/comments',
    extraInputs: [cosmosInput],
    extraOutputs: [cosmosOutput],
    handler: async (request, context) => {
        
        

        

        if (filmResult.length === 0) {
            console.log(`Film with id ${filmId} not found.`);
            return {
                status: 404,
                body: "Film nicht gefunden."
            };
        }

        const film = filmResult; 
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

        
        

        

        return {
            status: 201,
            body: comment
        };
    }
});