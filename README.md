## IoT service using AWS IoT Core

This is a simple implementation of a IoT project that measures temperature and humidity using a ESP32 (Any hardware that can use MQTT is usable). It features a secure MQTT connection using the built in functions of IoT Core with the option of disabling devices if you no longer trust them. For frontend it uses Amplify to keep within the AWS ecosystem. 

## Flowchart
![Flowchart](flowchart.jpg "Flowchart")

## Setup
### ESP32
ESP setup can be found [here](https://github.com/Cosmao/esp32-idf-aws/)
### Amplify

#### Deploying to AWS
For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

### IoT Core
#### Security policy
The first thing we want to do in IoT Core is creating a policy under security, this is the one I use
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:eu-central-1:194722443757:client/${iot:Connection.Thing.ThingName}"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": [
        "arn:aws:iot:eu-central-1:194722443757:topicfilter/${iot:Connection.Thing.ThingName}/downlink",
        "arn:aws:iot:eu-central-1:194722443757:topicfilter/$aws/things/${iot:Connection.Thing.ThingName}/shadow/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish",
        "iot:Receive"
      ],
      "Resource": [
        "arn:aws:iot:eu-central-1:194722443757:topic/$aws/things/${iot:Connection.Thing.ThingName}/shadow/*",
        "arn:aws:iot:eu-central-1:194722443757:topic/${iot:Connection.Thing.ThingName}/downlink",
        "arn:aws:iot:eu-central-1:194722443757:topic/${iot:Connection.Thing.ThingName}/telemetry"
      ]
    }
  ]
}

```
This will limit the topics that devices are allowed to subscribe to and post to, all of this is to increase the security for our solution.
#### Connecting a ESP32
Once this is done we can connect our ESP32 using the `Manage > All devices > Things > Create Thing` in IoT Core. Select unnamed shadow and the name to be the same as the ESP32's MAC address. Once this is done you should be able to see messages in the `MQTT test client` in IoT Core by subcribing to `#`.
#### Message rules
Head to `Message routing > Rules > Create Rule` \
First one will will create is to send the telemetry data to amplify and dynamoDB using graphQL. Use the following SQL statement.
```SQL
SELECT *, clientId() AS device_id, timestamp() AS timestamp FROM "+/telemetry"
```
Select the rule action as `Lambda` and search for `CoreTelemetry` it will show up once you've depolyed your amplify solution. \

Next we will create the rule for online/offline devices. Start by creating another rule with the following SQL statement.
```SQL
SELECT *, clientID() AS device_id FROM "$aws/events/presence/+/+"
```
Select the `Lambda` action again and search for `CoreStatus` and select it. Then create another action and select `Lambda` and search for DiscordWebhook. The first action will handle our database and website connection to keep the status updated there. DiscordWebhook will send a notification when the state changes to your selected channel.

## Deploying to AWS
For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
