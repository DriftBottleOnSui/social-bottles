import { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import { useSuiClient } from "@mysten/dapp-kit";
import { EventType, getBottleImage } from "@/utils";

[
  {
    id: {
      txDigest: "YqZN2jXZmQLYMy8mk43UKWHkhcnbbJHcp5pDcXvP7L2",
      eventSeq: "0",
    },
    packageId:
      "0x3b40d2a1fc18cfc485ca14bbf30a8bebb2c1913ed6fc05299ea30afeeeb99bf7",
    transactionModule: "drift_bottle",
    sender:
      "0xfe951e8cb178e2f2653258a280e8f53e88cc0066b924bf2f35c32f6e4cadb6f9",
    type: "0x3b40d2a1fc18cfc485ca14bbf30a8bebb2c1913ed6fc05299ea30afeeeb99bf7::drift_bottle::BottleEvent",
    parsedJson: {
      action_type: "create",
      bottle_id:
        "0x8e8541b930024a8b8d8b5a90cb4619f53188db81aee48cfad43880ddd70197a7",
      from: "0xfe951e8cb178e2f2653258a280e8f53e88cc0066b924bf2f35c32f6e4cadb6f9",
      to: null,
    },
    bcs: "4kwvPKuvdawnokWqt7hzLR4Aizs9itN3TrC1NQAwyZKDWPXo4MDhz8H2HxXYMwZF7fjvDDKoZNW5ySYXUq3AQ2hRjiQwQ3whLck",
    timestampMs: "1726134696062",
  },
  {
    id: {
      txDigest: "AeK9xJSpWhU7JL8YiH2jercyh7CxZ1xofuwLZsea53r7",
      eventSeq: "0",
    },
    packageId:
      "0x3b40d2a1fc18cfc485ca14bbf30a8bebb2c1913ed6fc05299ea30afeeeb99bf7",
    transactionModule: "drift_bottle",
    sender:
      "0xfe951e8cb178e2f2653258a280e8f53e88cc0066b924bf2f35c32f6e4cadb6f9",
    type: "0x3b40d2a1fc18cfc485ca14bbf30a8bebb2c1913ed6fc05299ea30afeeeb99bf7::drift_bottle::BottleEvent",
    parsedJson: {
      action_type: "create",
      bottle_id:
        "0xdb6ec9b0e0284d06b2a0f4df52700068ac7051e2cac6b412be44837e94ed3195",
      from: "0xfe951e8cb178e2f2653258a280e8f53e88cc0066b924bf2f35c32f6e4cadb6f9",
      to: null,
    },
    bcs: "4kwvPKuvdawnokWqt7hzLR4Aizs9itN3TrC1NQAwyZKDWQQ1hKNSAy6i2XjaPdEEciYF2WsnCP7LUaA7yy16KTyVRZBzn46xfVn",
    timestampMs: "1726122219099",
  },
  {
    id: {
      txDigest: "BVVcS8h7wgwwNLjqGCq81CrkKwkdttiY3bDn1s325Kn9",
      eventSeq: "0",
    },
    packageId:
      "0x3b40d2a1fc18cfc485ca14bbf30a8bebb2c1913ed6fc05299ea30afeeeb99bf7",
    transactionModule: "drift_bottle",
    sender:
      "0x79088c4883a33769473f548e738ec96bfa00cefbed34b4be0970dacda7135de4",
    type: "0x3b40d2a1fc18cfc485ca14bbf30a8bebb2c1913ed6fc05299ea30afeeeb99bf7::drift_bottle::BottleEvent",
    parsedJson: {
      action_type: "reply",
      bottle_id:
        "0x1b6d2fb96d1237f5df0db4056efb6f69b2b223e942867c26bff9f2a0050d903c",
      from: "0x79088c4883a33769473f548e738ec96bfa00cefbed34b4be0970dacda7135de4",
      to: "0x79088c4883a33769473f548e738ec96bfa00cefbed34b4be0970dacda7135de4",
    },
    bcs: "7yUVNJBV28v1Zd6C1CafYB8FDeCrtA93QNax93Vw3HV4D4uNjpvHqhef9ELDh9QgfH34hwATmhTPPp5GnRq8JeMLBU3pdPxxVxFSwE6r8bp6MscjoVfBfseaCUdcHV35qfT498doKLzcp",
    timestampMs: "1725843164171",
  },
];

type BottleIdObj = {
  id: {
    txDigest: string;
    eventSeq: string;
  };
  packageId: string;
  transactionModule: string;
  sender: string;
  type: string;
  parsedJson: {
    action_type: string;
    bottle_id: string;
    from: string;
    to: string;
  };
  bcs: string;
  timestampMs: string;
};

// {
//     "objectId": "0x9ed4fa4131878291c7d783d6bbedc35cd0cb49c0414cb657342082af3a94fba6",
//     "version": "141302297",
//     "digest": "8hYTezp2XD9cPafmqCdXcSYCus9RyLoYiifLVzwyrYTk",
//     "previousTransaction": "BvagZvSnA3qPjQeeYAE7iM5S1d9nVsDypx5HZDXp7q8c",
//     "content": {
//         "dataType": "moveObject",
//         "type": "0x3b40d2a1fc18cfc485ca14bbf30a8bebb2c1913ed6fc05299ea30afeeeb99bf7::drift_bottle::DriftBottle",
//         "hasPublicTransfer": true,
//         "fields": {
//             "from": "0x79088c4883a33769473f548e738ec96bfa00cefbed34b4be0970dacda7135de4",
//             "from_time": "1725842504",
//             "id": {
//                 "id": "0x9ed4fa4131878291c7d783d6bbedc35cd0cb49c0414cb657342082af3a94fba6"
//             },
//             "msgs": [
//                 {
//                     "type": "0x3b40d2a1fc18cfc485ca14bbf30a8bebb2c1913ed6fc05299ea30afeeeb99bf7::drift_bottle::BottleMsg",
//                     "fields": {
//                         "blob_id": "Eei3jVJIx05VNud_ezFOnBKrfeEmlyO7DecNV86WhsY",
//                         "blob_obj": "0x18d86b41f2e38f4123113bdaec853932e88e02b4e8af7ce279c05df2f867df18"
//                     }
//                 }
//             ],
//             "open": false,
//             "reply_time": "0",
//             "to": null
//         }
//     }
// }

type Bottle = {
  objectId: string;
  content: {
    fields: {
      from_time: string;
      msgs: {
        fields: {
          blob_id: string;
          blob_obj: string;
        };
      }[];
    };
  };
};

export default function BottlesPage() {
  const suiClient = useSuiClient();
  const [activeTab, setActiveTab] = useState("all");
  const [bottles, setBottles] = useState<Bottle[]>([]);

  useEffect(() => {
    const fetchBottles = async () => {
      const result = (await suiClient.queryEvents({
        query: {
          MoveEventType: EventType,
        },
        limit: 1000,
      })) as {
        data: BottleIdObj[];
      };

      const ids = result.data
        .filter((obj) => obj.parsedJson.action_type === "create")
        .map((obj) => obj.parsedJson.bottle_id);

      const objs = await suiClient.multiGetObjects({
        ids: ids,
        options: {
          showPreviousTransaction: true,
          showContent: true,
        },
      });

      console.log(objs);

      setBottles(objs.map((obj) => obj.data as unknown as Bottle));
    };
    fetchBottles();
  }, []);

  return (
    <DefaultLayout>
      <div className="flex h-full w-full">
        {/* 左侧栏 */}
        <div className="basis-80 p-4 bg-black text-white">
          <div className="flex flex-col space-y-4">
            <button
              className={`w-full p-2 border ${
                activeTab === "all"
                  ? "bg-white text-black border-black"
                  : "bg-black text-white border-white"
              }`}
              onClick={() => setActiveTab("all")}
            >
              所有瓶子
            </button>
            <button
              className={`w-full p-2 border ${
                activeTab === "drop"
                  ? "bg-white text-black border-black"
                  : "bg-black text-white border-white"
              }`}
              onClick={() => setActiveTab("drop")}
            >
              投放瓶子
            </button>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div
          className="flex-grow p-4 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/bottles-bg.png')" }}
        >
          {activeTab === "all" && (
            <div>
              <h2 className="text-2xl font-bold">所有瓶子</h2>
              {/* 这里添加显示所有瓶子的内容 */}
              <div className="show-all-bottles flex flex-wrap gap-4">
                {bottles.map((bottle) => (
                  <div
                    key={bottle.objectId}
                    className="p-4 border w-60 h-32 overflow-hidden bg-white"
                  >
                    <img
                      src={getBottleImage(bottle.objectId)}
                      alt="Bottle"
                      className="w-auto h-24 mx-auto"
                    />
                    <p>From: {bottle.content.fields.msgs[0].fields.blob_id}</p>
                    <p>From Time: {bottle.content.fields.from_time}</p>
                    <p>Messages: {bottle.content.fields.msgs.length}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "drop" && (
            <div>
              <h2 className="text-2xl font-bold">投放一个瓶子</h2>
              {/* 这里添加投放瓶子的表单或内容 */}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
