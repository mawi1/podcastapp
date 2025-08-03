import { type Result, err, ok } from "neverthrow";

export type PodcastBaseData = {
  id: number;
  title: string;
  latestEpisode: Date | null;
};

export type PodcastRef = {
  id: number;
  title: string;
};

export type EpisodeBaseData = {
  id: number;
  title: string | null;
  pubDate: Date;
  durationSeconds: number | null;
};

export type ResumeData = {
  currentTime: number,
  playbackRate: number,
}

export type PaginatedList<T> = {
  items: T[];
  totalItems: number;
};

export class PageNo {
  private _p: number;

  private constructor(p: number) {
    this._p = p;
  }

  public static fromUrl(url: URL): Result<PageNo, "invalid_page_no"> {
    const param = url.searchParams.get("page");
    if (param === null) {
      return ok(new PageNo(1));
    }
    const n = parseInt(param);
    if (isNaN(n) || n < 1 || n > Number.MAX_SAFE_INTEGER) {
      return err("invalid_page_no");
    } else {
      return ok(new PageNo(n));
    }
  }

  get pageNo(): number {
    return this._p;
  }
}

export class Id {
  private _id: number;

  private constructor(id: number) {
    this._id = id;
  }

  public static fromStr(idStr: string): Result<Id, "invalid_id"> {
    const n = parseInt(idStr);
    if (isNaN(n) || n < 0 || n > Number.MAX_SAFE_INTEGER) {
      return err("invalid_id");
    } else {
      return ok(new Id(n));
    }
  }

  get id(): number {
    return this._id;
  }
}

export enum InitialSymbol {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  H = "H",
  I = "I",
  J = "J",
  K = "K",
  L = "L",
  M = "M",
  N = "N",
  O = "O",
  P = "P",
  Q = "Q",
  R = "R",
  S = "S",
  T = "T",
  U = "U",
  V = "V",
  W = "W",
  X = "X",
  Y = "Y",
  Z = "Z",
  Numeric = "0-9",
  Other = "Other",
}

export function parseInitialSymbol(val: string): undefined | InitialSymbol {
  const match = Object.entries(InitialSymbol).find(([, value]) => value === val);
  if (match) {
    return match[1];
  } else {
    return undefined;
  }
}
