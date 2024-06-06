const { app, input } = require('@azure/functions');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB', 
    sqlQuery: "SELECT VALUE comment.content FROM c JOIN comment IN c.comments WHERE c.id = {filmId}",
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
    route: 'films/{filmId}/comments/content',
    extraInputs: [cosmosInput],
    handler: async (request, context) => {
        

        
        const commentsResult = context.extraInputs.get(cosmosInput);
        
        if (commentsResult.length > 0) {
            return {
                body: JSON.stringify(commentsResult),
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
