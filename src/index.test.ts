import { RarbgApi } from "./index";

jest.setTimeout(20000);

const rarbgapi = new RarbgApi({
  app_id: "kraken_test",
  debug: true,
});

test("fetch token", async () => {
  expect(await rarbgapi.fetchToken()).toMatch(/^\w{10}$/);
});

test("search for star wars", async () => {
  const data = await rarbgapi.search({
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
