const https = require('https');


class RegionsStore {
    static async all(req, res, next) {

        https.get('https://restcountries.eu/rest/v2/all', (response) => {
            let resp_str = ''
            response.on('data', (data) => {
                resp_str += data
            });

            response.on('end', () => {
                if(response.statusCode){
                    res.json({
                        status: 'success',
                        message: 'Countries loaded',
                        data: JSON.parse(resp_str)
                    });
                }else{
                    next(new Error('Failed to load Countries'))
                }

            });
        });
    }


}

module.exports =  RegionsStore;