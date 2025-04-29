// src/MangaupIr.ts
import { Chapter, Manga, Page, Source } from "@extensions/model";
import { load } from "cheerio";

export class MangaupIr extends Source {
  id = "mangaup.ir";
  name = "Mangaup.ir";
  language = "fa";
  baseUrl = "https://mangaup.ir";

  async getMangaList(): Promise<Manga[]> {
    const res = await this.request(`${this.baseUrl}/last`);
    const $ = load(res);
    const mangaList: Manga[] = [];

    $(".card-header a").each((_, el) => {
      const url = $(el).attr("href") || "";
      const title = $(el).text().trim();
      const idMatch = url.match(/manga\/(\d+)/);
      const id = idMatch ? idMatch[1] : "";
      if (id) {
        mangaList.push({
          id,
          title,
          cover: `${this.baseUrl}/assets/logo.png`,
        });
      }
    });

    return mangaList;
  }

  async getMangaDetails(id: string): Promise<Manga> {
    const res = await this.request(`${this.baseUrl}/manga/${id}`);
    const $ = load(res);

    const title = $("h1").first().text().trim();
    const cover = $(".img-fluid").attr("src") || "";
    const description = $(".card-body p").text().trim();

    return {
      id,
      title,
      cover,
      description,
    };
  }

  async getChapters(id: string): Promise<Chapter[]> {
    const res = await this.request(`${this.baseUrl}/manga/${id}`);
    const $ = load(res);
    const chapters: Chapter[] = [];

    $(".list-group-item a").each((_, el) => {
      const url = $(el).attr("href") || "";
      const title = $(el).text().trim();
      const chapterMatch = url.match(/reader\/(\d+)/);
      const chapterId = chapterMatch ? chapterMatch[1] : "";
      if (chapterId) {
        chapters.push({
          id: chapterId,
          title,
        });
      }
    });

    return chapters;
  }

  async getChapterPages(chapterId: string): Promise<Page[]> {
    const res = await this.request(`${this.baseUrl}/manga/113/reader/${chapterId}`);
    const $ = load(res);
    const pages: Page[] = [];

    $("#all > img").each((i, el) => {
      const url = $(el).attr("src") || "";
      if (url) {
        pages.push({
          index: i,
          url: url.startsWith("http") ? url : `${this.baseUrl}${url}`,
        });
      }
    });

    return pages;
  }
}
