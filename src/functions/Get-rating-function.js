const { app, input } = require('@azure/functions');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDB',  
    sqlQuery: "SELECT c.ratings FROM c WHERE c.id = @filmId",
    parameters: [
        {
            name: "@filmId",
            value: ""
        }
    ]
});

app.http('getRatings', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'films/{filmId}/ratings',
    extraInputs: [cosmosInput],
    handler: async (request, context) => {
        const filmId = context.bindingData.filmId;
        cosmosInput.parameters[0].value = filmId;  
        
        const ratings = context.extraInputs.get(cosmosInput);
        
        if (ratings.length > 0) {
            return {
                body: JSON.stringify(ratings[0].ratings || []),
                status: 200
            };
        } else {
            return {
                status: 404,
                body: "Film nicht gefunden oder keine Bewertungen vorhanden."
            };
        }
    }
});
