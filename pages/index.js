import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Build Monitor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <iframe
        src="/dashboard.html"
        title="Build Monitor"
        style={{ width: "100%", height: "100vh", border: 0, display: "block" }}
      />
    </>
  );
}
