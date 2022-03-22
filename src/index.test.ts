import { NodeRarbg } from "./index";

jest.setTimeout(20000);

const rarbg = new NodeRarbg({
  app_id: "kraken_test",
  useCache: true,
  debug: true,
});

test("fetch token", async () => {
  expect(await rarbg.fetchToken()).toMatch(/^\w{10}$/);
});

test("search for string", async () => {
  const data = await rarbg.search({
    search_string: "Star Wars",
  });
  data.torrent_results.forEach((record) => {
    expect(record).toMatchObject({
      title: expect.any(String),
      category: expect.any(String),
      download: expect.any(String),
      seeders: expect.any(Number),
      leechers: expect.any(Number),
      size: expect.any(Number),
      pubdate: expect.any(String),
      episode_info: expect.objectContaining({
        imdb: expect.any(String),
        themoviedb: expect.any(String),
      }),
      ranked: expect.any(Number),
      info_page: expect.any(String),
    });
  });
});

test("search for imdb id", async () => {
  const data = await rarbg.search({
    search_imdb: "tt0076759",
  });
  data.torrent_results.forEach((record) => {
    expect(record).toMatchObject({
      title: expect.any(String),
      category: expect.any(String),
      download: expect.any(String),
      seeders: expect.any(Number),
      leechers: expect.any(Number),
      size: expect.any(Number),
      pubdate: expect.any(String),
      episode_info: expect.objectContaining({
        imdb: expect.any(String),
        themoviedb: expect.any(String),
      }),
      ranked: expect.any(Number),
      info_page: expect.any(String),
    });
  });
});

test("search for tmdb id", async () => {
  const data = await rarbg.search({
    search_themoviedb: "11",
  });
  data.torrent_results.forEach((record) => {
    expect(record).toMatchObject({
      title: expect.any(String),
      category: expect.any(String),
      download: expect.any(String),
      seeders: expect.any(Number),
      leechers: expect.any(Number),
      size: expect.any(Number),
      pubdate: expect.any(String),
      episode_info: expect.objectContaining({
        imdb: expect.any(String),
        themoviedb: expect.any(String),
      }),
      ranked: expect.any(Number),
      info_page: expect.any(String),
    });
  });
});
