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

expect.extend({
  nullOrAny(received, expected) {
    if (received === null) {
      return {
        pass: true,
        message: () =>
          `expected null or instance of ${this.utils.printExpected(
            expected
          )}, but received ${this.utils.printReceived(received)}`,
      };
    }

    if (expected == String) {
      return {
        pass: typeof received == "string" || received instanceof String,
        message: () =>
          `expected null or instance of ${this.utils.printExpected(
            expected
          )}, but received ${this.utils.printReceived(received)}`,
      };
    }

    if (expected == Number) {
      return {
        pass: typeof received == "number" || received instanceof Number,
        message: () =>
          `expected null or instance of ${this.utils.printExpected(
            expected
          )}, but received ${this.utils.printReceived(received)}`,
      };
    }

    if (expected == Function) {
      return {
        pass: typeof received == "function" || received instanceof Function,
        message: () =>
          `expected null or instance of ${this.utils.printExpected(
            expected
          )}, but received ${this.utils.printReceived(received)}`,
      };
    }

    if (expected == Object) {
      return {
        pass: received !== null && typeof received == "object",
        message: () =>
          `expected null or instance of ${this.utils.printExpected(
            expected
          )}, but received ${this.utils.printReceived(received)}`,
      };
    }

    if (expected == Boolean) {
      return {
        pass: typeof received == "boolean",
        message: () =>
          `expected null or instance of ${this.utils.printExpected(
            expected
          )}, but received ${this.utils.printReceived(received)}`,
      };
    }

    /* jshint -W122 */
    /* global Symbol */
    if (typeof Symbol != "undefined" && this.expectedObject == Symbol) {
      return {
        pass: typeof received == "symbol",
        message: () =>
          `expected null or instance of ${this.utils.printExpected(
            expected
          )}, but received ${this.utils.printReceived(received)}`,
      };
    }
    /* jshint +W122 */

    return {
      pass: received instanceof expected,
      message: () =>
        `expected null or instance of ${this.utils.printExpected(
          expected
        )}, but received ${this.utils.printReceived(received)}`,
    };
  },
});

test("search for star wars", async () => {
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
