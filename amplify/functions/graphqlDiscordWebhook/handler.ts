import type { Handler } from 'aws-lambda';

const DISCORD_ENDPOINT = process.env.API_KEY as string;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: Handler = async (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  console.log(`Endpoint: ${DISCORD_ENDPOINT}`);

  const request = new XMLHttpRequest();

  request.open("POST", DISCORD_ENDPOINT);
  request.setRequestHeader('Content-type', 'application/json');

  const params = {
    username: "AWS-Webhook",
    avatar_url: "",
    content: "Test msg\nDevice: ${event.device_id}\nStatus: ${event.eventType}"
  }
  request.send(JSON.stringify(params));

  console.log("Status code: ", request.status);

};
