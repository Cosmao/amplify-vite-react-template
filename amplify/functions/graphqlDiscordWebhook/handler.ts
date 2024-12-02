import type { Handler } from 'aws-lambda';

const DISCORD_ENDPOINT = process.env.DISCORD_ENDPOINT as string;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export const handler: Handler = async (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  console.log(`Endpoint: ${DISCORD_ENDPOINT}`);

  if (!DISCORD_ENDPOINT) {
    console.log("SET THE DISCORD_ENDPOINT variable!");
    return;
  }

  let request;
  let response;
  let responseBody;
  let statusCode = 200;

  const headers = {
    "Content-type": "application/json"
  }

  request = new Request(DISCORD_ENDPOINT, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      username: "AWS-Webhook",
      avatar_url: "",
      content: `Test msg\nDevice: ${event.device_id}\nStatus: ${event.eventType}`
    })
  })

  console.log("request:", request)

  try {
    response = await fetch(request);
    responseBody = await response.json();
    console.log("responseBody:", responseBody);
  } catch (error) {
    statusCode = 400;
    console.log("ERROR:", JSON.stringify(error));
  }

  return {
    statusCode,
    body: JSON.stringify(responseBody)
  };
};
