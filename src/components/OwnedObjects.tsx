import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

export function OwnedObjects() {
  const account = useCurrentAccount();
  const { data, isPending, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
    },
    {
      enabled: !!account,
    },
  );

  if (!account) {
    return null;
  }

  if (error) {
    return <div>错误：{error.message}</div>;
  }

  if (isPending || !data) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "8px 0" }}>
      {data.data.length === 0 ? (
        <div>连接的钱包没有拥有任何对象</div>
      ) : (
        <h4>连接的钱包拥有的对象</h4>
      )}
      {data.data.map((object) => (
        <div key={object.data?.objectId}>
          <div>对象 ID：{object.data?.objectId}</div>
        </div>
      ))}
    </div>
  );
}
