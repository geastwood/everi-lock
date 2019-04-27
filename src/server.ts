import * as express from "express";
import * as Evt from "evtjs";
import * as bodyParser from "body-parser";
import { get } from "lodash";
import { createDomain, issueToken, unlock, addMeta } from "./chain";

console.log(Object.keys(Evt));
const app = express();
const privateKey = "5K3P7A16r2sVqXuntj5keU8HEkuWJyA2ZdD3mYdvuFVGmkCgTH4";
const publicKey = "EVT7VVeoJ8h2CtFqR1UBo4H3vbJUuWKrNrqa2LHKerUn27d1sbQNh";
let apiCaller = null;

const getApiCaller = (network?: {}) => {
  if (!apiCaller) {
    const localNetwork = {
      host: "testnet1.everitoken.io",
      port: 443,
      protocol: "https"
    };

    apiCaller = Evt({
      endpoint: {
        ...localNetwork,
        ...network
      },
      keyProvider: [privateKey]
    });
  }
  return apiCaller;
};

app.use(bodyParser.json());

const createError = (errMsg: string): { success: false; errMsg: string } => ({
  success: false,
  errMsg
});
const createSuccess = <T>(data: T): { success: true; data: T } => ({
  success: true,
  data
});

type Body = {
  type?: string;
  state?: "unlock" | "register";
  data?: string;
};

const mergeWithDefaultBody = (payload: Body): Body => ({
  data: null,
  ...payload
});

const validateBody = (body: Body) => {
  if (!body.type) {
    return createError("'type' is required");
  }

  if (body.state !== "unlock" && body.state !== "register") {
    return createError(`Invalid state "${body.state || ""}" received`);
  }

  return {
    success: true,
    data: mergeWithDefaultBody(body)
  };
};

app.get("/v1/transaction/:id", async (req, res) => {
  const api = getApiCaller();
  const trx = await api.getTransactionDetailById(req.params.id);
  res.json(trx);
});

app.post("/v1/locks/:id", async (req, res) => {
  const { body, params } = req;

  const validated = validateBody(body);

  // validation failed, send error message back and end session
  if (!validated.success) {
    res.json(validated);
    return;
  }

  const { type: domain, data, state } = validated.data;
  const api = getApiCaller();

  if (state === "register") {
    let createDomainTrx = null;

    try {
      createDomainTrx = await createDomain(api, domain, publicKey);
    } catch (e) {
      console.log("[Warning]:", `Domain "${domain}" exists already`);
    }

    let issueTokenTrx = null;

    try {
      issueTokenTrx = await issueToken(api, domain, params.id, publicKey);
    } catch (e) {
      console.log("[Warning]:", `Token "${params.id}" exists already`);
    }

    res.json(
      createSuccess(
        [
          { name: "domain", trx: createDomainTrx },
          { name: "token", trx: issueTokenTrx }
        ]
          .filter(({ trx }) => trx != null)
          .map(d => ({
            name: d.name,
            trxId: d.trx.transactionId
          }))
      )
    );

    return;
  } // END register

  if (state === "unlock") {
    let token = null;
    try {
      token = await api.getToken(domain, params.id);
    } catch (e) {
      const name = get(e, ["serverError", "name"]);
      const what = get(e, ["serverError", "what"], "Unknown error.");

      if (name == "unknown_token_exception") {
        res.json(
          createError(
            `Device with type: "${domain}" and "${
              params.id
            }" is not registered yet.`
          )
        );
      } else {
        res.json(createError(what));
      }

      return;
    }

    const unlockTrx = await unlock(api, domain, params.id, [privateKey]);

    let dataTrx = null;

    if (data) {
      dataTrx = await addMeta(
        api,
        domain,
        params.id,
        String(Date.now()),
        data,
        publicKey
      );
      console.log(dataTrx);
    }

    res.json(
      createSuccess(
        [{ name: "unlock", trxId: unlockTrx.transactionId }].concat(
          dataTrx ? [{ name: "data", trxId: dataTrx.transactionId }] : []
        )
      )
    );
  }

  return;
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
