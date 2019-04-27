import * as Evt from "evtjs";

export const createDomain = async (
  apiCaller: any,
  domain: string,
  publicKey: string
) => {
  return apiCaller.pushTransaction(
    { maxCharge: 1000000, payer: publicKey },
    new Evt.EvtAction("newdomain", {
      name: domain,
      creator: publicKey,
      issue: {
        name: "issue",
        threshold: 1,
        authorizers: [
          {
            ref: "[A] " + publicKey,
            weight: 1
          }
        ]
      },
      transfer: {
        name: "transfer",
        threshold: 1,
        authorizers: [
          {
            ref: "[G] .OWNER",
            weight: 1
          }
        ]
      },
      manage: {
        name: "manage",
        threshold: 1,
        authorizers: [
          {
            ref: "[A] " + publicKey,
            weight: 1
          }
        ]
      }
    })
  );
};

export const issueToken = async (
  api: any,
  domain: string,
  name: string,
  publicKey: string
) => {
  return api.pushTransaction(
    new Evt.EvtAction("issuetoken", {
      domain,
      names: [name],
      owner: [publicKey]
    })
  );
};
