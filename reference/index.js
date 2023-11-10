// Generate JWT: https://docs.moneyhubenterprise.com/docs/create-a-client
//require('dotenv').config({silent : false});
import _ from './env.js'
import fs from 'fs';
import path from 'path';
import { Moneyhub } from "@mft/moneyhub-api-client";

import { ChatGPTAPI } from 'chatgpt'

const gptAPI = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
});

const PORT = process.env.PORT || 3000;

import express from 'express';
import bodyParser from 'body-parser';

import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static('public'))
app.use(bodyParser.json())

const PRIVATE_KEY = JSON.parse(fs.readFileSync(`${__dirname}/private_key.pem`, "utf8"));

const config = {
    resourceServerUrl: "https://api.moneyhub.co.uk/v2.0",
    identityServiceUrl: "https://identity.moneyhub.co.uk",
    client: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        token_endpoint_auth_method: "private_key_jwt",
        id_token_signed_response_alg: "RS256",
        request_object_signing_alg: "RS256",
        redirect_uri: "https://invite.moneyhub.co.uk/api/callback",
        response_type: "code id_token",
        keys : [
            PRIVATE_KEY
        ]
    },
  };

app.get('/transactions', async(req, res, next) => {

    const mh = await Moneyhub(config);

    const users = await mh.getUsers();

    const user = users.data[0]

    console.log(user);

    const accounts = await mh.getAccounts({
        userId: user.userId,
        params: {
            limit: 10,
            offset: 0,
            showTransactionData: true,
            showPerformanceScore: false
        },
    });

    console.log("accounts:", accounts);

    const currentAccount = accounts.data[1];

    console.log("currentAccount:", currentAccount)

    const transactions = await mh.getTransactions({
        userId: user.userId,
        params: {
            limit: 1000,
            offset: 0
        },
    });

    console.log("transactions:", transactions);
    console.log("First transaction:", transactions.data[0]);

    res.json(transactions);

});

app.post('/chat', async (req, res, next) => {

    console.log(req.body);

    const response = await gptAPI.sendMessage(req.body.message,{
        parentMessageId: req.body.parentMessageId
    });

    console.log(response.text);

    res.json({
        message : response.text,
        id: response.id
    });

});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});
