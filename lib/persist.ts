import type { AuctionState } from "./store";

const DEFAULT_REPO = "sharadvc/tabtax";
const AUCTION_PATH = "data/auction.json";
const BRANCH = "main";

export function getGithubToken(): string | undefined {
  return process.env.TABTAX_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
}

export function isPersistenceEnabled(): boolean {
  return Boolean(getGithubToken());
}

function getRepo(): string {
  return process.env.GITHUB_REPO || DEFAULT_REPO;
}

function emptyState(): AuctionState {
  return { currentBid: 0, winner: null, history: [] };
}

type GithubContent = {
  sha: string;
  content: string;
};

async function fetchAuctionFile(): Promise<{
  state: AuctionState | null;
  sha: string | null;
}> {
  const token = getGithubToken();
  if (!token) {
    return { state: null, sha: null };
  }

  const [owner, repo] = getRepo().split("/");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${AUCTION_PATH}?ref=${BRANCH}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (res.status === 404) {
    return { state: emptyState(), sha: null };
  }

  if (!res.ok) {
    console.error("GitHub read failed", res.status, await res.text());
    return { state: null, sha: null };
  }

  const data = (await res.json()) as GithubContent;
  const raw = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
  const state = JSON.parse(raw) as AuctionState;
  return { state, sha: data.sha };
}

export async function loadPersistedState(): Promise<AuctionState | null> {
  const result = await fetchAuctionFile();
  return result.state;
}

export async function savePersistedState(
  state: AuctionState,
  expectedSha: string | null
): Promise<boolean> {
  const token = getGithubToken();
  if (!token) {
    return false;
  }

  const [owner, repo] = getRepo().split("/");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${AUCTION_PATH}`;

  const content = Buffer.from(JSON.stringify(state, null, 2), "utf8").toString("base64");

  const body: Record<string, string> = {
    message: "chore: update auction state",
    content,
    branch: BRANCH,
  };
  if (expectedSha) {
    body.sha = expectedSha;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    return false;
  }

  if (!res.ok) {
    console.error("GitHub write failed", res.status, await res.text());
    return false;
  }

  return true;
}

export async function readForUpdate(): Promise<{
  state: AuctionState;
  sha: string | null;
} | null> {
  const token = getGithubToken();
  if (!token) {
    return null;
  }
  const result = await fetchAuctionFile();
  if (!result.state) {
    return null;
  }
  return { state: result.state, sha: result.sha };
}
