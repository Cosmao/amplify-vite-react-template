import { defineFunction, secret } from '@aws-amplify/backend';

export const graphqlIoTCoreStatus = defineFunction({

  environment: {
    DISCORD_ENDPOINT: secret("CUSTOM_DISCORD_ENDPOINT")
  },
  // optionally specify a name for the Function (defaults to directory name)
  name: 'graphqlDiscordWebhook',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts'
});
