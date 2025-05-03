import slugify from "slugify";

export function podcastPath(id: number, title: string): string {
  return `/podcasts/${id}/${slugify(title)}`;
}

export function episodePath(id: number, title: string | null): string {
  if (title === null) {
    return `/episodes/${id}`;
  } else {
    return `/episodes/${id}/${slugify(title)}`;
  }
}
