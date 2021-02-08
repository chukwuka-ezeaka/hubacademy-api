const https = require('https');
const querystring = require('querystring');
const request = require('request');
const axios = require('axios');
const superagent = require('superagent');

const validateTransaction = async (trans_ref = null)=>{
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PS_PKEY}`
        }
    }
    await https.get(`https://api.paystack.co/transaction/verify/${trans_ref}`,options, (response) => {
        let resp_str = ''
        response.on('data', (data) => {
            resp_str += data
        });

        response.on('end', () => {
            if(response.statusCode){
              return JSON.parse(resp_str);
            }else{
                throw new Error('Failed to reach PayStack')
            }
        });


    }).on('error', (error) => {
        throw new Error('Failed to reach PayStack')
    })

}

const bankList =  (responseHandler)=>{
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PS_PKEY}`
        }
    }
      return https.get(`https://api.paystack.co/bank?perPage=100&page=1`,options,  responseHandler);

}

const createRecipient =  (payload)=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ process.env.PS_SKEY
    }
    return axios.post(`https://api.paystack.co/transferrecipient`,payload, {
        headers: headers
    });
}

const requestPayout =  (payload)=>{
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ process.env.PS_SKEY
    }
    return axios.post(`https://api.paystack.co/transfer`,payload, {
        headers: headers
    });
}


module.exports =
{
    validateTransaction:validateTransaction,
    bankList:bankList,
    createRecipient:createRecipient,
    requestPayout:requestPayout,
}
