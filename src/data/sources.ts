import type { Source } from "@/lib/types";

export const sources: Source[] = [
  {
    id: "S09",
    title: "文化庁 敬語の指針",
    reliability: "A",
    url: "https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/keigo_tosin.pdf",
  },
  {
    id: "S10",
    title: "日本電信電話ユーザ協会 ビジネス電話の基本",
    reliability: "B",
    url: "https://www.pi.jtua.or.jp/aichi/wp-content/uploads/sites/4/2022/03/98083b5d99f66996637b6425e31ed777.pdf",
  },
  {
    id: "S13",
    title: "日本電信電話ユーザ協会 ビジネス文書とメールの違い",
    reliability: "B",
    url: "https://www.jtua.or.jp/education/column/businessmail/201907_01/",
  },
  {
    id: "S14",
    title: "日本電信電話ユーザ協会 添付ファイルの送り方",
    reliability: "B",
    url: "https://www.jtua.or.jp/education/column/businessmail/202004_01/",
  },
  {
    id: "S11",
    title: "日本電信電話ユーザ協会 ビジネスメール術 件名",
    reliability: "B",
    url: "https://www.jtua.or.jp/education/column/businessmail/201908_01/",
  },
  {
    id: "S12",
    title: "日本電信電話ユーザ協会 ビジネスメール術 To/CC/BCC",
    reliability: "B",
    url: "https://www.jtua.or.jp/education/column/businessmail/201910_01/",
  },
  {
    id: "S15",
    title: "個人情報保護法",
    reliability: "A",
    url: "https://laws.e-gov.go.jp/law/415AC0000000057",
  },
  {
    id: "S17",
    title: "個人情報保護委員会 漏えい等報告リーフレット",
    reliability: "A",
    url: "https://www.ppc.go.jp/files/pdf/roueihoukoku_leaflet_2023.pdf",
  },
  {
    id: "S19",
    title: "環境省 クールビズ方針",
    reliability: "A",
    url: "https://www.env.go.jp/press/109505.html",
  },
  {
    id: "S21",
    title: "環境省 服装の可否例示",
    reliability: "B",
    url: "https://www.env.go.jp/content/900520342.pdf",
  },
  {
    id: "S22",
    title: "ビジネス検定関連問題資料",
    reliability: "B",
    url: "https://zensho.or.jp/puf/download/exam/pastexam/2022/bc_10_exa.pdf",
  },
  {
    id: "S23",
    title: "ビジネス実務マナー検定 例題",
    reliability: "B",
    url: "https://jitsumu-ginou-kentei.jp/BZ/example",
  },
  {
    id: "S01",
    title: "厚生労働省 パワハラ防止指針",
    reliability: "A",
    url: "https://www.mhlw.go.jp/content/11900000/000605661.pdf",
  },
  {
    id: "S03",
    title: "厚生労働省 セクハラ防止指針",
    reliability: "A",
    url: "https://www.mhlw.go.jp/content/11900000/000605548.pdf",
  },
  {
    id: "S04",
    title: "厚生労働省 カスタマーハラスメント指針",
    reliability: "A",
    url: "https://www.mhlw.go.jp/content/11900000/001662584.pdf",
  },
  {
    id: "S05",
    title: "厚生労働省 求職者等セクハラ防止指針",
    reliability: "A",
    url: "https://www.mhlw.go.jp/content/11900000/001662589.pdf",
  },
];

export const sourceMap = new Map(sources.map((source) => [source.id, source]));
