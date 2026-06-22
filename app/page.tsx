import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Ticker } from "@/components/ticker";
import { SignalList } from "@/components/signal-list";
import { Footer } from "@/components/footer";
import { getTrending } from "@/lib/aggregator";
import { getSourceStatuses } from "@/lib/sources";

export default async function HomePage() {
  const [trending, sources] = await Promise.all([
    getTrending(),
    getSourceStatuses(),
  ]);

  return (
    <>
      <Nav />
      <main>
        <Hero signalCount={trending.total} />
        <Ticker signals={trending.signals} />
        <SignalList signals={trending.signals} sources={sources} />
      </main>
      <Footer />
    </>
  );
}
