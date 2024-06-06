const { app, input } = require('@azure/functions');

const cosmosInput = input.cosmosDB({
    databaseName: 'FilmDatabase',
    containerName: 'Films',
    connection: 'CosmosDBConnectionString',
    sqlQuery: "SELECT * FROM c WHERE c.id = @filmId",
    parameters: [
        {
            name: "@filmId",
            value: ""
        }
    ]
});

app.http('addRating', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'films/{filmId}/ratings',
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

        const selectedFilm = filmResult[0];
        const rating = {
            userId: request.body.userId,
            rating: request.body.rating, // "👍" oder "👎"
            date: new Date().toISOString()
        };

        if (!selectedFilm.ratings) {
            selectedFilm.ratings = [];
        }
        selectedFilm.ratings.push(rating)const { app, input } = require('@azure/functions');

        const cosmosInput = input.cosmosDB({
            databaseName: 'FilmDatabase',
            containerName: 'Films',
            connection: 'CosmosDBConnectionString',
            sqlQuery: "SELECT * FROM c WHERE c.id = @filmId",
            parameters: [
                {
                    name: "@filmId",
                    value: ""
                }
            ]
        });
        
        app.http('addRating', {
            methods: ['POST'],
            authLevel: 'anonymous',
            route: 'films/{filmId}/ratings',
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
                const rating = {
                    userId: request.body.userId,
                    rating: request.body.rating, // "👍" oder "👎"
                    date: new Date().toISOString()
                };
        
                if (!film.ratings) {
                    film.ratings = [];
                }
                film.ratings.push(rating);
        
                context.bindings.cosmosOutput = film;
        
                return {
                    status: 201,
                    body: film
                };
            }
        });
        ;

        const updatedFilm = await context.bindings.cosmosOutput = {
            ...selectedFilm
        };

        return {
            status: 201,
            body: updatedFilm
        };
    }
});
