// 用途地域データ

export interface ZoningDistrict {
  name: string;
  buildingCoverageRatio: number; // 建蔽率（%）
  floorAreaRatio: number; // 容積率（%）
  heightLimit?: number; // 高さ制限（m）
  description: string;
}

export interface Oaza {
  id: string;
  name: string;
  zoningDistrict: ZoningDistrict;
}

export interface City {
  id: string;
  name: string;
  prefecture: string;
  oazas: Oaza[];
}

// 用途地域の定義
export const ZONING_TYPES: { [key: string]: ZoningDistrict } = {
  // 住居系
  category1_low_rise: {
    name: '第一種低層住居専用地域',
    buildingCoverageRatio: 50,
    floorAreaRatio: 100,
    heightLimit: 10,
    description: '低層住宅のための地域。2階建て以下が中心。'
  },
  category2_low_rise: {
    name: '第二種低層住居専用地域',
    buildingCoverageRatio: 60,
    floorAreaRatio: 150,
    heightLimit: 10,
    description: '主に低層住宅のための地域。小規模な店舗も可。'
  },
  category1_mid_rise: {
    name: '第一種中高層住居専用地域',
    buildingCoverageRatio: 60,
    floorAreaRatio: 200,
    description: '中高層住宅のための地域。病院、大学なども可。'
  },
  category2_mid_rise: {
    name: '第二種中高層住居専用地域',
    buildingCoverageRatio: 60,
    floorAreaRatio: 300,
    description: '主に中高層住宅のための地域。一定規模の店舗も可。'
  },
  category1_residential: {
    name: '第一種住居地域',
    buildingCoverageRatio: 60,
    floorAreaRatio: 300,
    description: '住居の環境を守るための地域。大規模店舗以外の店舗も可。'
  },
  category2_residential: {
    name: '第二種住居地域',
    buildingCoverageRatio: 60,
    floorAreaRatio: 400,
    description: '主に住居の環境を守る地域。店舗、事務所も可。'
  },
  quasi_residential: {
    name: '準住居地域',
    buildingCoverageRatio: 60,
    floorAreaRatio: 400,
    description: '道路の沿道で、自動車関連施設と住宅が調和した地域。'
  },

  // 商業系
  neighborhood_commercial: {
    name: '近隣商業地域',
    buildingCoverageRatio: 80,
    floorAreaRatio: 300,
    description: '近隣の住民が日用品を買物などをする地域。住宅も可。'
  },
  commercial: {
    name: '商業地域',
    buildingCoverageRatio: 80,
    floorAreaRatio: 600,
    description: '銀行、映画館、飲食店、百貨店などが集まる地域。'
  },

  // 工業系
  quasi_industrial: {
    name: '準工業地域',
    buildingCoverageRatio: 60,
    floorAreaRatio: 300,
    description: '主に軽工業の工場や環境悪化の恐れのない工場のための地域。'
  },
  industrial: {
    name: '工業地域',
    buildingCoverageRatio: 60,
    floorAreaRatio: 300,
    description: 'どんな工場でも建てられる地域。住宅も建てられる。'
  },
  exclusive_industrial: {
    name: '工業専用地域',
    buildingCoverageRatio: 50,
    floorAreaRatio: 300,
    description: '工場のための地域。住宅は建てられない。'
  },
};

// 市区町村のサンプルデータ
export const CITIES: City[] = [
  {
    id: 'tokyo-shibuya',
    name: '渋谷区',
    prefecture: '東京都',
    oazas: [
      { id: 'shibuya-dougenzaka', name: '道玄坂', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shibuya-jinnan', name: '神南', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shibuya-udagawacho', name: '宇田川町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shibuya-sakuragaokacho', name: '桜丘町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'shibuya-higashi', name: '東', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'shibuya-ebisu', name: '恵比寿', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'shibuya-ebisuNishi', name: '恵比寿西', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'shibuya-hiroo', name: '広尾', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },
  {
    id: 'tokyo-setagaya',
    name: '世田谷区',
    prefecture: '東京都',
    oazas: [
      { id: 'setagaya-setagaya', name: '世田谷', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'setagaya-taishido', name: '太子堂', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'setagaya-sangenjaya', name: '三軒茶屋', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'setagaya-kamiuma', name: '上馬', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'setagaya-okusawa', name: '奥沢', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'setagaya-jiyugaoka', name: '自由が丘', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'tokyo-meguro',
    name: '目黒区',
    prefecture: '東京都',
    oazas: [
      { id: 'meguro-meguro', name: '目黒', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'meguro-nakameguro', name: '中目黒', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'meguro-jiyugaoka', name: '自由が丘', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'meguro-himonya', name: '碑文谷', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },
  {
    id: 'tokyo-minato',
    name: '港区',
    prefecture: '東京都',
    oazas: [
      { id: 'minato-roppongi', name: '六本木', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'minato-akasakaakasaka', name: '赤坂', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'minato-azabu', name: '麻布', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'minato-shirokane', name: '白金', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'minato-takanawa', name: '高輪', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },
  {
    id: 'tokyo-chiyoda',
    name: '千代田区',
    prefecture: '東京都',
    oazas: [
      { id: 'chiyoda-marunouchi', name: '丸の内', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chiyoda-otemachi', name: '大手町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chiyoda-kanda', name: '神田', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'chiyoda-kojimachi', name: '麹町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'tokyo-chuo',
    name: '中央区',
    prefecture: '東京都',
    oazas: [
      { id: 'chuo-nihonbashi', name: '日本橋', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-ginza', name: '銀座', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-tsukiji', name: '築地', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'chuo-tsukishima', name: '月島', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },
  {
    id: 'tokyo-shinjuku',
    name: '新宿区',
    prefecture: '東京都',
    oazas: [
      { id: 'shinjuku-shinjuku', name: '新宿', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shinjuku-kabukicho', name: '歌舞伎町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shinjuku-yotsuya', name: '四谷', zoningDistrict: ZONING_TYPES.category2_residential },
      { id: 'shinjuku-ichigaya', name: '市谷', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'shinjuku-takadanobaba', name: '高田馬場', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'tokyo-bunkyo',
    name: '文京区',
    prefecture: '東京都',
    oazas: [
      { id: 'bunkyo-hongo', name: '本郷', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'bunkyo-yushima', name: '湯島', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'bunkyo-koishikawa', name: '小石川', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },
  {
    id: 'tokyo-taito',
    name: '台東区',
    prefecture: '東京都',
    oazas: [
      { id: 'taito-asakusa', name: '浅草', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'taito-ueno', name: '上野', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'taito-taito', name: '台東', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'tokyo-sumida',
    name: '墨田区',
    prefecture: '東京都',
    oazas: [
      { id: 'sumida-kinshicho', name: '錦糸町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'sumida-ryogoku', name: '両国', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'sumida-oshiage', name: '押上', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'tokyo-koto',
    name: '江東区',
    prefecture: '東京都',
    oazas: [
      { id: 'koto-kameido', name: '亀戸', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'koto-kiba', name: '木場', zoningDistrict: ZONING_TYPES.quasi_industrial },
      { id: 'koto-toyosu', name: '豊洲', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'koto-ariake', name: '有明', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },
  {
    id: 'tokyo-shinagawa',
    name: '品川区',
    prefecture: '東京都',
    oazas: [
      { id: 'shinagawa-shinagawa', name: '品川', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shinagawa-osaki', name: '大崎', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'shinagawa-gotanda', name: '五反田', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'tokyo-ota',
    name: '大田区',
    prefecture: '東京都',
    oazas: [
      { id: 'ota-kamata', name: '蒲田', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'ota-denenchofu', name: '田園調布', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'ota-haneda', name: '羽田', zoningDistrict: ZONING_TYPES.quasi_industrial },
    ]
  },
  {
    id: 'tokyo-nakano',
    name: '中野区',
    prefecture: '東京都',
    oazas: [
      { id: 'nakano-nakano', name: '中野', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nakano-nogata', name: '野方', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'tokyo-suginami',
    name: '杉並区',
    prefecture: '東京都',
    oazas: [
      { id: 'suginami-ogikubo', name: '荻窪', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'suginami-koenji', name: '高円寺', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'suginami-asagaya', name: '阿佐ヶ谷', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },
  {
    id: 'tokyo-toshima',
    name: '豊島区',
    prefecture: '東京都',
    oazas: [
      { id: 'toshima-ikebukuro', name: '池袋', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'toshima-sugamo', name: '巣鴨', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'toshima-mejiro', name: '目白', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },
  {
    id: 'tokyo-kita',
    name: '北区',
    prefecture: '東京都',
    oazas: [
      { id: 'kita-akabane', name: '赤羽', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kita-tabata', name: '田端', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'tokyo-arakawa',
    name: '荒川区',
    prefecture: '東京都',
    oazas: [
      { id: 'arakawa-nippori', name: '日暮里', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'arakawa-machiya', name: '町屋', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },
  {
    id: 'tokyo-itabashi',
    name: '板橋区',
    prefecture: '東京都',
    oazas: [
      { id: 'itabashi-itabashi', name: '板橋', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'itabashi-narimasu', name: '成増', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'tokyo-nerima',
    name: '練馬区',
    prefecture: '東京都',
    oazas: [
      { id: 'nerima-nerima', name: '練馬', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'nerima-shakujii', name: '石神井', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'nerima-hikarigaoka', name: '光が丘', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },
  {
    id: 'tokyo-adachi',
    name: '足立区',
    prefecture: '東京都',
    oazas: [
      { id: 'adachi-kitasenju', name: '北千住', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'adachi-ayase', name: '綾瀬', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'tokyo-katsushika',
    name: '葛飾区',
    prefecture: '東京都',
    oazas: [
      { id: 'katsushika-kameari', name: '亀有', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'katsushika-shibamata', name: '柴又', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },
  {
    id: 'tokyo-edogawa',
    name: '江戸川区',
    prefecture: '東京都',
    oazas: [
      { id: 'edogawa-koiwa', name: '小岩', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'edogawa-kasai', name: '葛西', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'kanagawa-yokohama-tsuzuki',
    name: '横浜市都筑区',
    prefecture: '神奈川県',
    oazas: [
      { id: 'tsuzuki-chuo', name: 'センター南', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'tsuzuki-kitacenterkita', name: 'センター北', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'tsuzuki-azamino', name: 'あざみ野', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'kanagawa-kawasaki-nakahara',
    name: '川崎市中原区',
    prefecture: '神奈川県',
    oazas: [
      { id: 'nakahara-musashikosugi', name: '武蔵小杉', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nakahara-motosumiyoshi', name: '元住吉', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'saitama-saitama-urawa',
    name: 'さいたま市浦和区',
    prefecture: '埼玉県',
    oazas: [
      { id: 'urawa-urawa', name: '浦和', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'urawa-kita', name: '北浦和', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'chiba-chiba-chuo',
    name: '千葉市中央区',
    prefecture: '千葉県',
    oazas: [
      { id: 'chuo-chiba', name: '千葉', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-chuocho', name: '中央', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'osaka-osaka-kita',
    name: '大阪市北区',
    prefecture: '大阪府',
    oazas: [
      { id: 'kita-umeda', name: '梅田', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kita-nakazakicho', name: '中崎町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'osaka-osaka-chuo',
    name: '大阪市中央区',
    prefecture: '大阪府',
    oazas: [
      { id: 'chuo-shinsaibashi', name: '心斎橋', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-namba', name: '難波', zoningDistrict: ZONING_TYPES.commercial },
    ]
  },
  {
    id: 'osaka-osaka-nishi',
    name: '大阪市西区',
    prefecture: '大阪府',
    oazas: [
      { id: 'nishi-horie', name: '堀江', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'nishi-kyomachibori', name: '京町堀', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'osaka-osaka-tennoji',
    name: '大阪市天王寺区',
    prefecture: '大阪府',
    oazas: [
      { id: 'tennoji-tennoji', name: '天王寺', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'tennoji-uehonmachi', name: '上本町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'osaka-osaka-yodogawa',
    name: '大阪市淀川区',
    prefecture: '大阪府',
    oazas: [
      { id: 'yodogawa-nishinakajima', name: '西中島', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'yodogawa-juso', name: '十三', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'hyogo-kobe-chuo',
    name: '神戸市中央区',
    prefecture: '兵庫県',
    oazas: [
      { id: 'chuo-sannomiya', name: '三宮', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-kitano', name: '北野', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'kanagawa-yokohama-naka',
    name: '横浜市中区',
    prefecture: '神奈川県',
    oazas: [
      { id: 'naka-kannai', name: '関内', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'naka-yamashitacho', name: '山下町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'naka-motomachi', name: '元町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'kanagawa-yokohama-nishi',
    name: '横浜市西区',
    prefecture: '神奈川県',
    oazas: [
      { id: 'nishi-minatomiraimirai', name: 'みなとみらい', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nishi-yokohama', name: '横浜', zoningDistrict: ZONING_TYPES.commercial },
    ]
  },
  {
    id: 'kanagawa-yokohama-kohoku',
    name: '横浜市港北区',
    prefecture: '神奈川県',
    oazas: [
      { id: 'kohoku-kikuna', name: '菊名', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'kohoku-tsunashima', name: '綱島', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'kanagawa-yokohama-kanagawa',
    name: '横浜市神奈川区',
    prefecture: '神奈川県',
    oazas: [
      { id: 'kanagawa-higashikanagawa', name: '東神奈川', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'kanagawa-kanagawa', name: '神奈川', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },
  {
    id: 'kanagawa-kawasaki-kawasaki',
    name: '川崎市川崎区',
    prefecture: '神奈川県',
    oazas: [
      { id: 'kawasaki-kawasaki', name: '川崎', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kawasaki-daishi', name: '大師', zoningDistrict: ZONING_TYPES.quasi_industrial },
    ]
  },
  {
    id: 'kanagawa-kawasaki-takatsu',
    name: '川崎市高津区',
    prefecture: '神奈川県',
    oazas: [
      { id: 'takatsu-takatsu', name: '高津', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'takatsu-mizonokuchi', name: '溝の口', zoningDistrict: ZONING_TYPES.commercial },
    ]
  },
  {
    id: 'aichi-nagoya-naka',
    name: '名古屋市中区',
    prefecture: '愛知県',
    oazas: [
      { id: 'naka-sakae', name: '栄', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'naka-osu', name: '大須', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'aichi-nagoya-higashi',
    name: '名古屋市東区',
    prefecture: '愛知県',
    oazas: [
      { id: 'higashi-higashi', name: '東区', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'higashi-sakae', name: '栄', zoningDistrict: ZONING_TYPES.commercial },
    ]
  },
  {
    id: 'fukuoka-fukuoka-chuo',
    name: '福岡市中央区',
    prefecture: '福岡県',
    oazas: [
      { id: 'chuo-tenjin', name: '天神', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-akasaka', name: '赤坂', zoningDistrict: ZONING_TYPES.category2_residential },
    ]
  },
  {
    id: 'fukuoka-fukuoka-hakata',
    name: '福岡市博多区',
    prefecture: '福岡県',
    oazas: [
      { id: 'hakata-hakata', name: '博多', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'hakata-gion', name: '祇園', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 北海道
  {
    id: 'hokkaido-sapporo-chuo',
    name: '札幌市中央区',
    prefecture: '北海道',
    oazas: [
      { id: 'chuo-odori', name: '大通', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-susukino', name: '薄野', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-maruyama', name: '円山', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },
  {
    id: 'hokkaido-sapporo-kita',
    name: '札幌市北区',
    prefecture: '北海道',
    oazas: [
      { id: 'kita-kita', name: '北区', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'kita-shinkawa', name: '新川', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 青森県
  {
    id: 'aomori-aomori-aomori',
    name: '青森市',
    prefecture: '青森県',
    oazas: [
      { id: 'aomori-honcho', name: '本町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'aomori-shinmachi', name: '新町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'aomori-yasukata', name: '安方', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 岩手県
  {
    id: 'iwate-morioka-morioka',
    name: '盛岡市',
    prefecture: '岩手県',
    oazas: [
      { id: 'morioka-odori', name: '大通', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'morioka-saien', name: '菜園', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'morioka-uchimaru', name: '内丸', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 宮城県
  {
    id: 'miyagi-sendai-aoba',
    name: '仙台市青葉区',
    prefecture: '宮城県',
    oazas: [
      { id: 'aoba-ichibancho', name: '一番町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'aoba-kokubuncho', name: '国分町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'aoba-kawauchi', name: '川内', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },

  // 秋田県
  {
    id: 'akita-akita-akita',
    name: '秋田市',
    prefecture: '秋田県',
    oazas: [
      { id: 'akita-nakadori', name: '中通', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'akita-omachi', name: '大町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'akita-yabase', name: '八橋', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 山形県（全市町村）
  // 山形市（県庁所在地）
  {
    id: 'yamagata-yamagata',
    name: '山形市',
    prefecture: '山形県',
    oazas: [
      { id: 'yamagata-nanokamachi', name: '七日町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'yamagata-kasumicho', name: '香澄町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'yamagata-honcho', name: '本町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'yamagata-jonomachi', name: '城南町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'yamagata-ekimae', name: '駅前', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'yamagata-midoricho', name: '緑町', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'yamagata-kojirakawa', name: '小白川町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'yamagata-zao', name: '蔵王', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'yamagata-kaminoyama', name: '上ノ山', zoningDistrict: ZONING_TYPES.category2_low_rise },
      { id: 'yamagata-suzukawa', name: '鈴川町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'yamagata-minaminumajiri', name: '南沼原', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'yamagata-yamagata', name: '旅篭町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'yamagata-sakuramachi', name: '桜町', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'yamagata-ayase', name: 'あこや町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'yamagata-tokamachi', name: '十日町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },

  // 米沢市
  {
    id: 'yamagata-yonezawa',
    name: '米沢市',
    prefecture: '山形県',
    oazas: [
      { id: 'yonezawa-marunouchi', name: '丸の内', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'yonezawa-ekimae', name: '駅前', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'yonezawa-tokamachi', name: '通町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'yonezawa-higashioomachi', name: '東大通', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'yonezawa-jonan', name: '城南', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'yonezawa-ooaza-akayu', name: '大字赤湯', zoningDistrict: ZONING_TYPES.quasi_residential },
      { id: 'yonezawa-sumiyoshi', name: '住吉町', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'yonezawa-naramachi', name: '奈良町', zoningDistrict: ZONING_TYPES.category2_residential },
      { id: 'yonezawa-omatsu', name: '大松町', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'yonezawa-nakamachi', name: '中町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },

  // 鶴岡市
  {
    id: 'yamagata-tsuruoka',
    name: '鶴岡市',
    prefecture: '山形県',
    oazas: [
      { id: 'tsuruoka-honcho', name: '本町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'tsuruoka-suehiro', name: '末広町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'tsuruoka-maruoka', name: '丸岡', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'tsuruoka-miyanomaedori', name: '宮野前通', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'tsuruoka-izumicho', name: '泉町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'tsuruoka-baba', name: '馬場町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'tsuruoka-nishishinzai', name: '西新斎町', zoningDistrict: ZONING_TYPES.category2_residential },
      { id: 'tsuruoka-yunohama', name: '湯野浜', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'tsuruoka-haguro', name: '羽黒町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 酒田市
  {
    id: 'yamagata-sakata',
    name: '酒田市',
    prefecture: '山形県',
    oazas: [
      { id: 'sakata-chuomachi', name: '中央町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'sakata-honcho', name: '本町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'sakata-kotobukicho', name: '寿町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'sakata-midoricho', name: '緑ヶ丘', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'sakata-wakaba', name: '若葉町', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'sakata-saiwaicho', name: '幸町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'sakata-higashioomachi', name: '東大町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'sakata-funaba', name: '船場町', zoningDistrict: ZONING_TYPES.quasi_industrial },
      { id: 'sakata-miyanoura', name: '宮野浦', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 新庄市
  {
    id: 'yamagata-shinjo',
    name: '新庄市',
    prefecture: '山形県',
    oazas: [
      { id: 'shinjo-tokamachi', name: '十日町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shinjo-ootemachi', name: '大手町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'shinjo-kitahon', name: '北本町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'shinjo-kanjo', name: '金沢', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'shinjo-tokoro', name: '所沢町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'shinjo-goromaru', name: '五日町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'shinjo-showa', name: '昭和', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 寒河江市
  {
    id: 'yamagata-sagae',
    name: '寒河江市',
    prefecture: '山形県',
    oazas: [
      { id: 'sagae-honcho', name: '本町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'sagae-chuocho', name: '中央', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'sagae-nishimura', name: '西村山', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'sagae-shimazaki', name: '島', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'sagae-yanome', name: '八鍬', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'sagae-midorigaoka', name: '緑町', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'sagae-shimazaki', name: '幸町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 上山市
  {
    id: 'yamagata-kaminoyama',
    name: '上山市',
    prefecture: '山形県',
    oazas: [
      { id: 'kaminoyama-onsen', name: '湯町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'kaminoyama-shinyu', name: '新湯', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'kaminoyama-sakaemachi', name: '栄町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kaminoyama-yawata', name: '八日町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'kaminoyama-takano', name: '高野', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'kaminoyama-kawasaki', name: '河崎', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },

  // 村山市
  {
    id: 'yamagata-murayama',
    name: '村山市',
    prefecture: '山形県',
    oazas: [
      { id: 'murayama-kushibiki', name: '楯岡', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'murayama-kamanome', name: '釜ノ目', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'murayama-tominami', name: '富並', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'murayama-kita', name: '北町', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'murayama-aramachi', name: '荒町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },

  // 長井市
  {
    id: 'yamagata-nagai',
    name: '長井市',
    prefecture: '山形県',
    oazas: [
      { id: 'nagai-honcho', name: '本町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nagai-oocho', name: '大町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'nagai-yokokomachi', name: '横町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'nagai-miyauchi', name: '宮内', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'nagai-kohama', name: '小浜', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'nagai-shinden', name: '新田', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },

  // 天童市
  {
    id: 'yamagata-tendo',
    name: '天童市',
    prefecture: '山形県',
    oazas: [
      { id: 'tendo-honcho', name: '本町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'tendo-ekimae', name: '駅西', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'tendo-onsen', name: '鎌田本町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'tendo-hisashimachi', name: '久野本', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'tendo-oimatsu', name: '老野森', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'tendo-higashihoncho', name: '東本町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'tendo-kitamemba', name: '北目', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'tendo-yaotome', name: '矢野目', zoningDistrict: ZONING_TYPES.category2_residential },
    ]
  },

  // 東根市
  {
    id: 'yamagata-higashine',
    name: '東根市',
    prefecture: '山形県',
    oazas: [
      { id: 'higashine-chuogai', name: '中央', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'higashine-ekimae', name: 'さくらんぼ駅前', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'higashine-honmaru', name: '本丸', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'higashine-kagami', name: '鏡', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'higashine-kamino', name: '神町', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'higashine-ohmori', name: '大森', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 尾花沢市
  {
    id: 'yamagata-obanazawa',
    name: '尾花沢市',
    prefecture: '山形県',
    oazas: [
      { id: 'obanazawa-nakamachi', name: '中町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'obanazawa-shinmachi', name: '新町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'obanazawa-tokamachi', name: '常盤町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'obanazawa-wakaba', name: '若葉町', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'obanazawa-ginzan', name: '銀山新畑', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 南陽市
  {
    id: 'yamagata-nanyo',
    name: '南陽市',
    prefecture: '山形県',
    oazas: [
      { id: 'nanyo-akayu', name: '赤湯', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nanyo-miyauchi', name: '宮内', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'nanyo-akayu-onsen', name: '赤湯温泉', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'nanyo-shiozawa', name: '塩沢', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'nanyo-higashiokitama', name: '椚塚', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'nanyo-aramachi', name: '荒町', zoningDistrict: ZONING_TYPES.category1_mid_rise },
    ]
  },

  // 山辺町
  {
    id: 'yamagata-yamanobe',
    name: '山辺町',
    prefecture: '山形県',
    oazas: [
      { id: 'yamanobe-yamanobe', name: '山辺', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'yamanobe-kita', name: '北', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'yamanobe-naka', name: '中', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'yamanobe-minami', name: '南', zoningDistrict: ZONING_TYPES.category2_residential },
    ]
  },

  // 中山町
  {
    id: 'yamagata-nakayama',
    name: '中山町',
    prefecture: '山形県',
    oazas: [
      { id: 'nakayama-nagasaki', name: '長崎', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'nakayama-tsuchida', name: '土田', zoningDistrict: ZONING_TYPES.category1_low_rise },
      { id: 'nakayama-tateyama', name: '達磨寺', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 河北町
  {
    id: 'yamagata-kahoku',
    name: '河北町',
    prefecture: '山形県',
    oazas: [
      { id: 'kahoku-tani', name: '谷地', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kahoku-sawayanagi', name: '溝延', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'kahoku-hirose', name: '広瀬', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 西川町
  {
    id: 'yamagata-nishikawa',
    name: '西川町',
    prefecture: '山形県',
    oazas: [
      { id: 'nishikawa-kaizu', name: '海味', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'nishikawa-oomachi', name: '大町', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 朝日町
  {
    id: 'yamagata-asahi',
    name: '朝日町',
    prefecture: '山形県',
    oazas: [
      { id: 'asahi-miyajuku', name: '宮宿', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'asahi-tachioka', name: '立木', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 大江町
  {
    id: 'yamagata-oe',
    name: '大江町',
    prefecture: '山形県',
    oazas: [
      { id: 'oe-sakaemachi', name: '左沢', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'oe-honmachi', name: '本町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'oe-fujita', name: '藤田', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 大石田町
  {
    id: 'yamagata-oishida',
    name: '大石田町',
    prefecture: '山形県',
    oazas: [
      { id: 'oishida-oishida', name: '大石田', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'oishida-yokomachi', name: '横町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'oishida-ekimae', name: '駅前', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },

  // 金山町
  {
    id: 'yamagata-kaneyama',
    name: '金山町',
    prefecture: '山形県',
    oazas: [
      { id: 'kaneyama-kaneyama', name: '金山', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'kaneyama-arimaya', name: '有屋', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 最上町
  {
    id: 'yamagata-mogami',
    name: '最上町',
    prefecture: '山形県',
    oazas: [
      { id: 'mogami-mukaimachi', name: '向町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'mogami-honjo', name: '本城', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 舟形町
  {
    id: 'yamagata-funagata',
    name: '舟形町',
    prefecture: '山形県',
    oazas: [
      { id: 'funagata-funagata', name: '舟形', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'funagata-nagasawa', name: '長沢', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 真室川町
  {
    id: 'yamagata-mamurogawa',
    name: '真室川町',
    prefecture: '山形県',
    oazas: [
      { id: 'mamurogawa-shinmachi', name: '新町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'mamurogawa-kamimachi', name: '上町', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 大蔵村
  {
    id: 'yamagata-okura',
    name: '大蔵村',
    prefecture: '山形県',
    oazas: [
      { id: 'okura-kiyama', name: '清水', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'okura-akakura', name: '赤松', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 鮭川村
  {
    id: 'yamagata-sakegawa',
    name: '鮭川村',
    prefecture: '山形県',
    oazas: [
      { id: 'sakegawa-sakegawa', name: '佐渡', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'sakegawa-kyowa', name: '京塚', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 戸沢村
  {
    id: 'yamagata-tozawa',
    name: '戸沢村',
    prefecture: '山形県',
    oazas: [
      { id: 'tozawa-furukuchi', name: '古口', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'tozawa-tsukidate', name: '蔵岡', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 高畠町
  {
    id: 'yamagata-takahata',
    name: '高畠町',
    prefecture: '山形県',
    oazas: [
      { id: 'takahata-takahata', name: '高畠', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'takahata-futatsui', name: '二井宿', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'takahata-kamadai', name: '亀岡', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 川西町
  {
    id: 'yamagata-kawanishi',
    name: '川西町',
    prefecture: '山形県',
    oazas: [
      { id: 'kawanishi-jonan', name: '上小松', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'kawanishi-nakako', name: '中小松', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 小国町
  {
    id: 'yamagata-oguni',
    name: '小国町',
    prefecture: '山形県',
    oazas: [
      { id: 'oguni-oguni', name: '小国', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'oguni-wakabamachi', name: '若林', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'oguni-otani', name: '大滝', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 白鷹町
  {
    id: 'yamagata-shirataka',
    name: '白鷹町',
    prefecture: '山形県',
    oazas: [
      { id: 'shirataka-arato', name: '荒砥', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shirataka-tsukimamachi', name: '十王', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 飯豊町
  {
    id: 'yamagata-iide',
    name: '飯豊町',
    prefecture: '山形県',
    oazas: [
      { id: 'iide-tsubaki', name: '椿', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'iide-nagatomi', name: '中津川', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 三川町
  {
    id: 'yamagata-mikawa',
    name: '三川町',
    prefecture: '山形県',
    oazas: [
      { id: 'mikawa-yokoyama', name: '横山', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'mikawa-oshigiri', name: '押切新田', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 庄内町
  {
    id: 'yamagata-shonai',
    name: '庄内町',
    prefecture: '山形県',
    oazas: [
      { id: 'shonai-amarume', name: '余目', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shonai-tachikawa', name: '立川', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'shonai-kitamachi', name: '北町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },

  // 遊佐町
  {
    id: 'yamagata-yuza',
    name: '遊佐町',
    prefecture: '山形県',
    oazas: [
      { id: 'yuza-yuza', name: '遊佐', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'yuza-fukura', name: '吹浦', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'yuza-kisakata', name: '岩川', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 福島県
  {
    id: 'fukushima-fukushima-fukushima',
    name: '福島市',
    prefecture: '福島県',
    oazas: [
      { id: 'fukushima-sakae', name: '栄町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'fukushima-ota', name: '太田町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'fukushima-omachi', name: '大町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 茨城県
  {
    id: 'ibaraki-mito-mito',
    name: '水戸市',
    prefecture: '茨城県',
    oazas: [
      { id: 'mito-miyamachi', name: '宮町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'mito-sannomaru', name: '三の丸', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'mito-senba', name: '千波町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'ibaraki-tsukuba-tsukuba',
    name: 'つくば市',
    prefecture: '茨城県',
    oazas: [
      { id: 'tsukuba-takezono', name: '竹園', zoningDistrict: ZONING_TYPES.category1_mid_rise },
      { id: 'tsukuba-azuma', name: '吾妻', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'tsukuba-tennodai', name: '天王台', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 栃木県
  {
    id: 'tochigi-utsunomiya-utsunomiya',
    name: '宇都宮市',
    prefecture: '栃木県',
    oazas: [
      { id: 'utsunomiya-babadori', name: '馬場通り', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'utsunomiya-omotesando', name: '表参道', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'utsunomiya-sakura', name: '桜', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 群馬県
  {
    id: 'gunma-maebashi-maebashi',
    name: '前橋市',
    prefecture: '群馬県',
    oazas: [
      { id: 'maebashi-honcho', name: '本町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'maebashi-chiyoda', name: '千代田町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'maebashi-motosoja', name: '元総社町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'gunma-takasaki-takasaki',
    name: '高崎市',
    prefecture: '群馬県',
    oazas: [
      { id: 'takasaki-yashima', name: '八島町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'takasaki-asahi', name: '旭町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },

  // 新潟県
  {
    id: 'niigata-niigata-chuo',
    name: '新潟市中央区',
    prefecture: '新潟県',
    oazas: [
      { id: 'chuo-bandai', name: '万代', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-furumachi', name: '古町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-kamiokawamaedori', name: '上大川前通', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 富山県
  {
    id: 'toyama-toyama-toyama',
    name: '富山市',
    prefecture: '富山県',
    oazas: [
      { id: 'toyama-sakurabashi', name: '桜橋通り', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'toyama-sogawa', name: '総曲輪', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'toyama-maruyama', name: '丸山', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 石川県
  {
    id: 'ishikawa-kanazawa-kanazawa',
    name: '金沢市',
    prefecture: '石川県',
    oazas: [
      { id: 'kanazawa-korinbo', name: '香林坊', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kanazawa-katamachi', name: '片町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kanazawa-kenrokumachi', name: '兼六町', zoningDistrict: ZONING_TYPES.category1_residential },
      { id: 'kanazawa-higashiyama', name: '東山', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 福井県
  {
    id: 'fukui-fukui-fukui',
    name: '福井市',
    prefecture: '福井県',
    oazas: [
      { id: 'fukui-chuo', name: '中央', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'fukui-junka', name: '順化', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'fukui-tawaramoto', name: '俵町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 山梨県
  {
    id: 'yamanashi-kofu-kofu',
    name: '甲府市',
    prefecture: '山梨県',
    oazas: [
      { id: 'kofu-marunouchi', name: '丸の内', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kofu-chuo', name: '中央', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'kofu-asahi', name: '朝日', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 長野県
  {
    id: 'nagano-nagano-nagano',
    name: '長野市',
    prefecture: '長野県',
    oazas: [
      { id: 'nagano-gondo', name: '権堂町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nagano-minami', name: '南千歳', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'nagano-zenko', name: '善光寺', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'nagano-matsumoto-matsumoto',
    name: '松本市',
    prefecture: '長野県',
    oazas: [
      { id: 'matsumoto-chuo', name: '中央', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'matsumoto-ote', name: '大手', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },

  // 岐阜県
  {
    id: 'gifu-gifu-gifu',
    name: '岐阜市',
    prefecture: '岐阜県',
    oazas: [
      { id: 'gifu-kandamachi', name: '神田町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'gifu-yanagase', name: '柳ケ瀬', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'gifu-kanomachi', name: '鹿野町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 静岡県
  {
    id: 'shizuoka-shizuoka-aoi',
    name: '静岡市葵区',
    prefecture: '静岡県',
    oazas: [
      { id: 'aoi-gofuku', name: '呉服町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'aoi-ryogae', name: '両替町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'aoi-tokiwa', name: '常磐町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'shizuoka-hamamatsu-naka',
    name: '浜松市中区',
    prefecture: '静岡県',
    oazas: [
      { id: 'naka-sunayama', name: '砂山町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'naka-kajimachi', name: '鍛冶町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'naka-motoshiro', name: '元城町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 三重県
  {
    id: 'mie-tsu-tsu',
    name: '津市',
    prefecture: '三重県',
    oazas: [
      { id: 'tsu-sakaemachi', name: '栄町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'tsu-omiya', name: '大門', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'tsu-marunouchi', name: '丸之内', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 滋賀県
  {
    id: 'shiga-otsu-otsu',
    name: '大津市',
    prefecture: '滋賀県',
    oazas: [
      { id: 'otsu-chuo', name: '中央', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'otsu-hamaotsu', name: '浜大津', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'otsu-shimanoseki', name: '島の関', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 京都府
  {
    id: 'kyoto-kyoto-shimogyo',
    name: '京都市下京区',
    prefecture: '京都府',
    oazas: [
      { id: 'shimogyo-shijo', name: '四条通', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shimogyo-karasuma', name: '烏丸', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shimogyo-nishikoji', name: '錦小路', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },
  {
    id: 'kyoto-kyoto-nakagyo',
    name: '京都市中京区',
    prefecture: '京都府',
    oazas: [
      { id: 'nakagyo-sanjo', name: '三条通', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nakagyo-kawaramachi', name: '河原町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nakagyo-nijo', name: '二条', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'kyoto-kyoto-higashiyama',
    name: '京都市東山区',
    prefecture: '京都府',
    oazas: [
      { id: 'higashiyama-gion', name: '祇園', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'higashiyama-kiyomizu', name: '清水', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 奈良県
  {
    id: 'nara-nara-nara',
    name: '奈良市',
    prefecture: '奈良県',
    oazas: [
      { id: 'nara-higashimuki', name: '東向', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nara-noborioji', name: '登大路町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'nara-nara', name: '奈良町', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 和歌山県
  {
    id: 'wakayama-wakayama-wakayama',
    name: '和歌山市',
    prefecture: '和歌山県',
    oazas: [
      { id: 'wakayama-honmachi', name: '本町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'wakayama-kimiidera', name: '紀三井寺', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 鳥取県
  {
    id: 'tottori-tottori-tottori',
    name: '鳥取市',
    prefecture: '鳥取県',
    oazas: [
      { id: 'tottori-eimachi', name: '栄町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'tottori-wakasa', name: '若桜町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'tottori-higashimachi', name: '東町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 島根県
  {
    id: 'shimane-matsue-matsue',
    name: '松江市',
    prefecture: '島根県',
    oazas: [
      { id: 'matsue-asahi', name: '朝日町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'matsue-tonomachi', name: '殿町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'matsue-kitahori', name: '北堀町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 岡山県
  {
    id: 'okayama-okayama-kita',
    name: '岡山市北区',
    prefecture: '岡山県',
    oazas: [
      { id: 'kita-ekimotomachi', name: '駅元町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kita-omotecho', name: '表町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kita-marunouchi', name: '丸の内', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'okayama-kurashiki-kurashiki',
    name: '倉敷市',
    prefecture: '岡山県',
    oazas: [
      { id: 'kurashiki-achi', name: '阿知', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kurashiki-honmachi', name: '本町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },

  // 広島県
  {
    id: 'hiroshima-hiroshima-naka',
    name: '広島市中区',
    prefecture: '広島県',
    oazas: [
      { id: 'naka-hondori', name: '本通', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'naka-hatchobori', name: '八丁堀', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'naka-shirakamijo', name: '白島中町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'hiroshima-hiroshima-minami',
    name: '広島市南区',
    prefecture: '広島県',
    oazas: [
      { id: 'minami-matoba', name: '的場町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'minami-ujinahigashi', name: '宇品東', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 山口県
  {
    id: 'yamaguchi-yamaguchi-yamaguchi',
    name: '山口市',
    prefecture: '山口県',
    oazas: [
      { id: 'yamaguchi-chuo', name: '中央', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'yamaguchi-kameyama', name: '亀山町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'yamaguchi-yuda', name: '湯田温泉', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
  {
    id: 'yamaguchi-shimonoseki-shimonoseki',
    name: '下関市',
    prefecture: '山口県',
    oazas: [
      { id: 'shimonoseki-takezaki', name: '竹崎町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'shimonoseki-karato', name: '唐戸町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
    ]
  },

  // 徳島県
  {
    id: 'tokushima-tokushima-tokushima',
    name: '徳島市',
    prefecture: '徳島県',
    oazas: [
      { id: 'tokushima-sakaemachi', name: '栄町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'tokushima-motomachi', name: '元町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'tokushima-terashima', name: '寺島本町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 香川県
  {
    id: 'kagawa-takamatsu-takamatsu',
    name: '高松市',
    prefecture: '香川県',
    oazas: [
      { id: 'takamatsu-kawaramachi', name: '瓦町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'takamatsu-hyogomachi', name: '兵庫町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'takamatsu-marunouchi', name: '丸の内', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 愛媛県
  {
    id: 'ehime-matsuyama-matsuyama',
    name: '松山市',
    prefecture: '愛媛県',
    oazas: [
      { id: 'matsuyama-okaido', name: '大街道', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'matsuyama-sanbanco', name: '三番町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'matsuyama-dogo', name: '道後', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 高知県
  {
    id: 'kochi-kochi-kochi',
    name: '高知市',
    prefecture: '高知県',
    oazas: [
      { id: 'kochi-obiyamachi', name: '帯屋町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kochi-honmachi', name: '本町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'kochi-marunouchi', name: '丸ノ内', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 佐賀県
  {
    id: 'saga-saga-saga',
    name: '佐賀市',
    prefecture: '佐賀県',
    oazas: [
      { id: 'saga-ekimae', name: '駅前中央', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'saga-hakusan', name: '白山', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'saga-jonai', name: '城内', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 長崎県
  {
    id: 'nagasaki-nagasaki-nagasaki',
    name: '長崎市',
    prefecture: '長崎県',
    oazas: [
      { id: 'nagasaki-hamano', name: '浜町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nagasaki-dejima', name: '出島町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'nagasaki-ebisu', name: '恵美須町', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 熊本県
  {
    id: 'kumamoto-kumamoto-chuo',
    name: '熊本市中央区',
    prefecture: '熊本県',
    oazas: [
      { id: 'chuo-shimotori', name: '下通', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-kamitori', name: '上通町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'chuo-ninomaru', name: '二の丸', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 大分県
  {
    id: 'oita-oita-oita',
    name: '大分市',
    prefecture: '大分県',
    oazas: [
      { id: 'oita-chuo', name: '中央町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'oita-miyako', name: '都町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'oita-nishi', name: '西大分', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 宮崎県
  {
    id: 'miyazaki-miyazaki-miyazaki',
    name: '宮崎市',
    prefecture: '宮崎県',
    oazas: [
      { id: 'miyazaki-tachibana', name: '橘通', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'miyazaki-nishiki', name: '錦町', zoningDistrict: ZONING_TYPES.neighborhood_commercial },
      { id: 'miyazaki-maruyama', name: '丸山', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },

  // 鹿児島県
  {
    id: 'kagoshima-kagoshima-kagoshima',
    name: '鹿児島市',
    prefecture: '鹿児島県',
    oazas: [
      { id: 'kagoshima-tenmonkan', name: '天文館', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kagoshima-higashisengoku', name: '東千石町', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'kagoshima-shiroyama', name: '城山町', zoningDistrict: ZONING_TYPES.category1_low_rise },
    ]
  },

  // 沖縄県
  {
    id: 'okinawa-naha-naha',
    name: '那覇市',
    prefecture: '沖縄県',
    oazas: [
      { id: 'naha-kokusai', name: '国際通り', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'naha-makishi', name: '牧志', zoningDistrict: ZONING_TYPES.commercial },
      { id: 'naha-shuri', name: '首里', zoningDistrict: ZONING_TYPES.category1_residential },
    ]
  },
];

// 都道府県リスト（山形県のみ）
export const PREFECTURES = [
  '山形県',
];

// 都道府県から市区町村を取得
export function getCitiesByPrefecture(prefecture: string): City[] {
  return CITIES.filter(city => city.prefecture === prefecture);
}

// IDから市区町村を取得
export function getCityById(id: string): City | undefined {
  return CITIES.find(city => city.id === id);
}

// 市区町村から大字を取得
export function getOazasByCity(cityId: string): Oaza[] {
  const city = getCityById(cityId);
  return city ? city.oazas : [];
}

// IDから大字を取得
export function getOazaById(cityId: string, oazaId: string): Oaza | undefined {
  const city = getCityById(cityId);
  return city?.oazas.find(oaza => oaza.id === oazaId);
}
