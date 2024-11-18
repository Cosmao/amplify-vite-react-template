import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import {
  Button,
  Table,
  useAuthenticator
} from '@aws-amplify/ui-react';
//import { ClientRoutingPolicy } from "aws-cdk-lib/aws-elasticloadbalancingv2";

const client = generateClient<Schema>();

function App() {
  const [telemetries, setTelemetry] = useState<Array<Schema["telemetry"]["type"]>>([]);

  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.telemetry.observeQuery().subscribe({
      next: (data) => { setTelemetry([...data.items]), console.log("data", data) },
    });

    client.models.telemetry.onCreate().subscribe({
      next: (data) => console.log("got something..: ", data),
    })


  }, []);

  function createTelemetry() {
    const temperature = Math.random() * (30 - 20) + 20;
    const humidity = Math.random() * (90 - 40) + 40;

    client.models.telemetry.create({
      device_id: "1234",
      timestamp: new Date().getTime(),
      temperature: temperature,
      humidity: humidity,
    });
  }

  function testCreate() {
    client.mutations.addTelemetry({
      device_id: "666",
      timestamp: new Date().getTime(),
      owner: "0334a8d2-e021-707f-6c65-a9fac9f52221::0334a8d2-e021-707f-6c65-a9fac9f52221",
      temperature: 66,
      humidity: 66,
    });
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s IoT</h1>
      {
        <Button
          variation="primary"
          loadingText=""
          onClick={createTelemetry}
        >
          Create new Telemetry record
        </Button>
      }
      {
        <Button
          variation="primary"
          loadingText=""
          onClick={testCreate}
        >
          Test Mutation
        </Button>
      }
      <ul>
        {telemetries.map((telemetri) => (
          <li
            key={telemetri.device_id + telemetri.createdAt}>{JSON.stringify(telemetri)}</li>
        ))}
      </ul>

      <Table>

      </Table>
      <button onClick={signOut}>Sign out</button>
    </main >
  );
}

export default App;
