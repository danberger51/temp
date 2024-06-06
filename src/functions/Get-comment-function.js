const { app, input } = require('@azure/functions');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB', 
    sqlQuery: "SELECT c.comments FROM c WHERE c.id = @filmId",
    parameters: [
        {
            name: "@filmId",
            value: ""
        }
    ]
});

app.http('getComments', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'films/{filmId}/comments',
    extraInputs: [cosmosInput],
    handler: async (request, context) => {
        const filmId = context.bindingData.filmId;
        cosmosInput.parameters[0].value = filmId;  d
        
        const commentsResult = context.extraInputs.get(cosmosInput);
        
        if (commentsResult.length > 0) {
            return {
                body: JSON.stringify(commentsResult[0].comments || []),
                status: 200
            };
        } else {
            return {
                status: 404,
                body: "Film nicht gefunden oder keine Kommentare vorhanden."
            };
        }
    }
});
