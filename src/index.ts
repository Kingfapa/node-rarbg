import axios, { AxiosInstance } from "axios";
import { requestLogger, responseLogger } from "axios-logger";
import NodeCache from "node-cache";

interface IBaseParams {
  category?: ("tv" | "movies") | number;
  limit?: 25 | 50 | 100;
  sort?: "seeders" | "leechers" | "last";
  minimum_seeders?: number;
  minimum_leechers?: number;
}
interface ISearchString extends IBaseParams {
  search_string: string;
  search_imdb?: never;
  search_tvdb?: never;
  search_themoviedb?: never;
}

interface ISearchIMDB extends IBaseParams {
  search_string?: never;
  search_imdb: string;
  search_tvdb?: never;
  search_themoviedb?: never;
}

interface ISearchTVDB extends IBaseParams {
  search_string?: never;
  search_imdb?: never;
  search_tvdb: string;
  search_themoviedb?: never;
}

interface ISearchTMDB extends IBaseParams {
  search_string?: never;
  search_imdb?: never;
  search_tvdb?: never;
  search_themoviedb: string;
}

type ISearchParams = ISearchString | ISearchIMDB | ISearchTVDB | ISearchTMDB;

interface ITorrentRecord {
  title: string;
  category: string;
  download: string;
  seeders: number;
  leechers: number;
  size: number;
  pubdate: string;
  episode_info: {
    imdb: string;
    tvrage?: string;
    tvdb?: string;
    themoviedb: string;
  };
  ranked: number;
  info_page: string;
}

interface ITorrentRecords {
  torrent_results: ITorrentRecord[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class NodeRarbg {
  instance: AxiosInstance;
  maxRetries: number;
  useCache: boolean | undefined;

  private cache: NodeCache | undefined;
  private token?: string;
  private lastRequestTime?: number;
  private currentTries: number;

  categories: {
    XXX: 4;
    MOVIES_XVID: 14;
    MOVIES_XVID_720: 48;
    MOVIES_X264: 17;
    MOVIES_X264_1080: 44;
    MOVIES_X264_720: 45;
    MOVIES_X264_3D: 47;
    MOVIES_X264_4K: 50;
    MOVIES_X265_4K: 51;
    MOVIES_X265_4K_HDR: 52;
    MOVIES_FULL_BD: 42;
    MOVIES_BD_REMUX: 46;
    TV_EPISODES: 18;
    TV_HD_EPISODES: 41;
    TV_UHD_EPISODES: 49;
    MUSIC_MP3: 23;
    MUSIC_FLAC: 25;
    GAMES_PC_ISO: 27;
    GAMES_PC_RIP: 28;
    GAMES_PS3: 40;
    GAMES_XBOX_360: 32;
    SOFTWARE_PC_ISO: 33;
    GAMES_PS4: 53;
  };

  constructor({
    app_id,
    useCache,
    debug,
    throttle,
    maxRetries,
  }: {
    app_id: string;
    useCache: boolean;
    maxRetries?: number;
    debug?: boolean;
    throttle?: number;
  }) {
    this.instance = axios.create({
      baseURL: "https://torrentapi.org/pubapi_v2.php",
      params: {
        app_id,
      },
    });

    if (useCache) {
      this.useCache = useCache;
      this.cache = new NodeCache();
    }

    this.currentTries = 0;
    this.maxRetries = maxRetries || 10;

    this.instance.interceptors.request.use(async (request) => {
      if (this.lastRequestTime) {
        await sleep(
          (throttle || 2000) - (this.lastRequestTime - new Date().getTime())
        );
      }
      this.lastRequestTime = new Date().getTime();
      if (debug) {
        return requestLogger(request, {
          params: true,
        });
      }

      return request;
    });

    this.instance.interceptors.response.use(async (response) => {
      if (response.data.error_code === 20) {
        if (this.currentTries <= this.maxRetries) {
          this.currentTries++;
          console.log(
            `trying ${this.maxRetries - this.currentTries} times more`
          );
          return this.instance.request(response.config);
        } else {
          console.log("max retries reached, try another query");
        }
      }

      if (debug) {
        return responseLogger(response);
      }

      return response;
    });

    this.categories = {
      XXX: 4,
      MOVIES_XVID: 14,
      MOVIES_XVID_720: 48,
      MOVIES_X264: 17,
      MOVIES_X264_1080: 44,
      MOVIES_X264_720: 45,
      MOVIES_X264_3D: 47,
      MOVIES_X264_4K: 50,
      MOVIES_X265_4K: 51,
      MOVIES_X265_4K_HDR: 52,
      MOVIES_FULL_BD: 42,
      MOVIES_BD_REMUX: 46,
      TV_EPISODES: 18,
      TV_HD_EPISODES: 41,
      TV_UHD_EPISODES: 49,
      MUSIC_MP3: 23,
      MUSIC_FLAC: 25,
      GAMES_PC_ISO: 27,
      GAMES_PC_RIP: 28,
      GAMES_PS3: 40,
      GAMES_XBOX_360: 32,
      SOFTWARE_PC_ISO: 33,
      GAMES_PS4: 53,
    };
  }

  private async request<T>(params: object) {
    const { data } = await this.instance.get<T>("", {
      params: {
        ...params,
        token: await this.fetchToken(),
        format: "json_extended",
      },
    });

    return data;
  }

  async apiRequest<T>(params: object) {
    if (this.useCache && this.cache) {
      const key = JSON.stringify(params);
      const cachedResponse = this.cache.get(key);
      if (cachedResponse) {
        return cachedResponse as T;
      } else {
        const data = await this.request<T>(params);
        this.cache.set(key, data);
        return data;
      }
    } else {
      return await this.request<T>(params);
    }
  }

  async fetchToken() {
    if (!this.token) {
      this.token = (
        await this.instance.get<{ token: string }>("", {
          params: {
            get_token: "get_token",
          },
        })
      ).data.token;
    }
    return this.token;
  }

  async list(params?: IBaseParams) {
    return this.apiRequest<ITorrentRecords>({ mode: "list", ...params });
  }
  async search(params: ISearchParams) {
    return this.apiRequest<ITorrentRecords>({ mode: "search", ...params });
  }
}
