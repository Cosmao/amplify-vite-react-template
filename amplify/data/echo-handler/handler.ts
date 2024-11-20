import type { Schema } from '../resource'

export const handler: Schema["addTelemetry"]["functionHandler"] = async (event, context) => {
  console.log(`Echoing content: ${JSON.stringify(event)}`)

  const res = {
    device_id: event.arguments.device_id,
    timestamp: event.arguments.timestamp,
    owner: event.arguments.owner,
    temperature: event.arguments.temperature,
    humidity: event.arguments.humidity,
    createdAt: new Date(event.arguments.timestamp).toISOString(),
    updatedAt: new Date(event.arguments.timestamp).toISOString(),
  };

  console.log("res: ", res);

  return res;
};
