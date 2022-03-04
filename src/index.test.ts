import { NodeRarbg } from "./index";

jest.setTimeout(20000);

const rarbg = new NodeRarbg({
  app_id: "kraken_test",
  debug: true,
});

test("fetch token", async () => {
  expect(await rarbg.fetchToken()).toMatch(/^\w{10}$/);
});

test("search for star wars", async () => {
  const data = await rarbg.search({
    search_string: "Star Wars",
  });
  data.torrent_results.forEach((record) => {
    expect(record).toMatchObject({
      filename: expect.any(String),
      category: expect.any(String),
      download: expect.any(String),
    });
  });
});
