import DefaultLayout from "@/layouts/default";
import { WalletStatus } from "@/components/WalletStatus";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 ">
        <div
          className="mint-form w-full max-w-2xl aspect-[25/19] bg-contain bg-no-repeat bg-center rounded-lg overflow-hidden relative"
          style={{
            backgroundImage: `url(/images/home-bg.png)`,
          }}
        >
          <div className="form-container h-full p-16 bg-transparent">
            <div
              className="title w-full h-24 bg-contain bg-no-repeat bg-center flex items-center justify-center"
              style={{
                backgroundImage: `url(/images/title-bg.svg)`,
              }}
            >
              <h1 className="text-white text-center text-2xl font-bold">
                Mint your NFT
              </h1>
            </div>
            <WalletStatus />
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
