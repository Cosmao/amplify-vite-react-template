import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import {
  Button,
  useAuthenticator,
  Card,
  Image,
  View,
  Heading,
  Flex,
  Badge,
  Collection,
  Divider,
} from '@aws-amplify/ui-react';

import moment from "moment";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const client = generateClient<Schema>();

function App() {
  const [telemetries, setTelemetry] = useState<Array<Schema["telemetry"]["type"]>>([]);
  const [devices, setDevices] = useState<Array<Schema["devices"]["type"]>>([]);

  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.telemetry.observeQuery().subscribe({
      next: (data) => { setTelemetry([...data.items]), console.log("data", data) },
    });
    client.models.devices.observeQuery().subscribe({
      next: (data) => { setDevices([...data.items]), console.log("data", data) },
    });
  }, []);

  function createTelemetry() {
    const temperature = Math.random() * (30 - 20) + 20;
    const humidity = Math.random() * (90 - 40) + 40;

    client.models.telemetry.create({
      device_id: "1234",
      timestamp: new Date().getTime(),
      temperature: temperature,
      humidity: humidity,
      owner: user.userId,
    });
  }

  function createDevice() {
    try {
      const id = window.prompt("Enter device ID");
      if (id === null || id.trim() === "") {
        return;
      }

      client.models.devices.create({
        device_id: id,
        owner: user.userId,
      });

    } catch (err) {
      console.log(err)
    }
  }

  function deleteTelemetry(device_id: string, timestamp: number) {
    client.models.telemetry.delete({ device_id, timestamp })
  }

  async function deleteDevice(device_id: string) {
    client.models.devices.delete({ device_id });
  }

  const handleDelete = (deviceId: string) => {
    if (window.confirm(`Are you sure you want to delete this device?\n${deviceId}`)) {
      deleteDevice(deviceId);
    }
  };

  const chartOptions = {

    onClick: function(evt: any, element: string | any[]) {
      evt;
      if (element.length > 0) {
        var ind = element[0].index;
        deleteTelemetry(telemetries[ind].device_id, telemetries[ind].timestamp)
      }
    },

    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
      }
    },
  };


  const filteredTelemetries = telemetries.filter((data) =>
    devices.some((device) => device.device_id === data.device_id)
  );

  const cartData = {
    labels: filteredTelemetries.map((data) =>
      moment(data?.timestamp).format("HH:mm:ss")
    ),
    datasets: [
      {
        label: 'Temperature',
        data: filteredTelemetries.map((data) => data?.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Humidity',
        data: filteredTelemetries.map((data) => data?.humidity),
        borderColor: 'rgb(99, 255, 132)',
        backgroundColor: 'rgba(99, 255, 132, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  return (
    <main>
      <div className="left-container">
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
            columnStart="1"
            columnEnd="-1"
            variation="primary"
            loadingText=""
            onClick={createDevice}
          >
            Create Device
          </Button>
        }

        <ul>
          {telemetries
            .slice(-5)
            .reverse()
            .map((telemetri) => (
              <li
                key={telemetri.device_id + telemetri.createdAt}
              >
                {`Device: ${telemetri.device_id}`}<br />
                {`Temp: ${telemetri.temperature ? telemetri.temperature.toFixed(2) + "°C" : "N/A"}`}
                {`\tHumidity: ${telemetri.humidity ? telemetri.humidity.toFixed(2) + "%" : "N/A"}`}<br />
                {`Time: ${new Date(telemetri.timestamp).toLocaleString("sv-SE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}`}
              </li>
            ))}
        </ul>

        <Collection
          items={devices}
          type="list"
          direction="row"
          gap="20px"
          wrap="nowrap"
        >
          {(item, index) => (
            <Card
              key={index}
              borderRadius="medium"
              maxWidth="20rem"
              variation="outlined"
            >
              <Image
                src="/esp.png"
                alt="Very nice picture of a ESP32"
              />
              <View padding="xs">
                <Flex>
                  <Badge size="small" variation="info">
                    {`Status: ${item.status ? item.status : `unknown`}`}
                  </Badge>
                </Flex>
                <Heading padding="medium">{item.device_id}</Heading>
                <ul>
                  {telemetries
                    .filter((telemetries) => telemetries.device_id == item.device_id)
                    .slice(-1)
                    .map((telemetri) => (
                      <li
                        key={telemetri.device_id + telemetri.createdAt}
                      >
                        {`Temp: ${telemetri.temperature ? telemetri.temperature.toFixed(2) + "°C" : "N/A"}`}
                        {`\tHumidity: ${telemetri.humidity ? telemetri.humidity.toFixed(2) + "%" : "N/A"}`}<br />
                        {`Time: ${new Date(telemetri.timestamp).toLocaleString("sv-SE", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })}`}
                      </li>
                    ))}
                </ul>

                <Button
                  variation="primary"
                  isFullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.device_id);
                  }}
                >Delete</Button>
              </View>
            </Card>
          )}
        </Collection>
        <Divider padding="xs" />
        <button onClick={signOut}>Sign out</button>
      </div>

      <div className="graph-container">
        <Line options={chartOptions} data={cartData}></Line>
      </div>

    </main >

  );
}

export default App;
