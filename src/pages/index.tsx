import DefaultLayout from "@/layouts/default";
import MintForm from "@/components/mint-form";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto max-w-7xl px-2 md:px-6 pt-16">
        <section
          className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 bg-cover bg-no-repeat bg-center "
          style={{
            backgroundImage: `url(/images/home-bg.png)`,
          }}
        >
          <MintForm />
        </section>
      </div>
    </DefaultLayout>
  );
}
