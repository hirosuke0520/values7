export interface ThemePreset {
  id: string;
  title: string;
}

export interface ItemsPreset {
  themeId: string;
  items: string[]; // 7つの項目を想定
}

export const themePresets: ThemePreset[] = [
  {
    id: "nishida_ideal_partner",
    title: "好きな人に求めるモノ", // 既存の 'ideal_partner' を置き換え
  },
  {
    id: "saaya_dislike_kouhai",
    title: "可愛がりたくない後輩", // 新規追加
  },
  // --- 以下、元のプリセット例 ---
  {
    id: "life_values",
    title: "人生の価値観",
  },
  // { // 元の 'ideal_partner' は置き換えたためコメントアウト
  //   id: "ideal_partner",
  //   title: "理想の恋人の条件",
  // },
  {
    id: "travel_priorities",
    title: "旅行先の優先条件",
  },
  {
    id: "workplace_factors",
    title: "職場選びの条件",
  },
  {
    id: "food_preferences",
    title: "食事の好み",
  },
  {
    id: "housing_priorities",
    title: "住まいの条件",
  },
  {
    id: "friendship_qualities",
    title: "友達に求める資質",
  },
];

export const itemsPresets: ItemsPreset[] = [
  {
    themeId: "nishida_ideal_partner", // 既存の 'ideal_partner' を置き換え
    items: [
      "顔",
      "性格",
      "スタイル",
      "体の相性",
      "面白さ",
      "ファッションセンス",
      "家庭的",
    ],
  },
  {
    themeId: "saaya_dislike_kouhai", // 新規追加
    items: [
      "酔うと必ず失礼な態度をとる",
      "借金が100万円ある",
      "2回に1回寝坊する",
      "すぐ嘘をつく",
      "的外れなツッコミをよくする",
      "異性にとことん好かれない",
      "バイトを5回クビになった",
    ],
  },
  // --- 以下、元のプリセット例 ---
  {
    themeId: "life_values",
    items: [
      "健康",
      "家族",
      "仕事/キャリア",
      "友情",
      "お金",
      "趣味/娯楽",
      "自己成長",
    ],
  },
  // { // 元の 'ideal_partner' は置き換えたためコメントアウト
  //   themeId: "ideal_partner",
  //   items: [
  //     "外見",
  //     "性格",
  //     "価値観の一致",
  //     "経済力",
  //     "共通の趣味",
  //     "家族との関係",
  //     "コミュニケーション能力",
  //   ],
  // },
  {
    themeId: "travel_priorities",
    items: [
      "費用",
      "治安",
      "観光地",
      "グルメ",
      "宿泊施設",
      "現地の文化体験",
      "アクセスの良さ",
    ],
  },
  {
    themeId: "workplace_factors",
    items: [
      "給料",
      "職場環境",
      "人間関係",
      "ワークライフバランス",
      "成長機会",
      "通勤距離",
      "会社の評判",
    ],
  },
  {
    themeId: "food_preferences",
    items: ["味", "見た目", "健康面", "価格", "量", "サービス", "雰囲気"],
  },
  {
    themeId: "housing_priorities",
    items: ["家賃/価格", "広さ", "立地", "治安", "日当たり", "騒音", "設備"],
  },
  {
    themeId: "friendship_qualities",
    items: [
      "信頼性",
      "思いやり",
      "共通の趣味",
      "連絡頻度",
      "支え合い",
      "面白さ",
      "価値観の近さ",
    ],
  },
];

// テーマIDから対応するアイテムリストを取得する関数
export function getItemsForTheme(themeId: string): string[] {
  const preset = itemsPresets.find((p) => p.themeId === themeId);
  return preset ? preset.items : []; // 見つからない場合は空配列を返す
}

// (任意) テーマIDに対応するテーマタイトルを取得する関数
export function getThemeTitleById(themeId: string): string | undefined {
  const theme = themePresets.find((t) => t.id === themeId);
  return theme ? theme.title : undefined;
}
