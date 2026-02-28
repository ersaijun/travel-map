import fs from 'fs/promises';

// 新增的66个景区基本信息
const newSpotsBasic = [
  { name: "圆明园遗址公园景区", province: "北京市", city: "北京市", category: "历史古迹" },
  { name: "保定市清西陵景区", province: "河北省", city: "保定市", category: "历史古迹" },
  { name: "承德市金山岭长城景区", province: "河北省", city: "承德市", category: "历史古迹" },
  { name: "晋中市平遥古城景区", province: "山西省", city: "晋中市", category: "历史古迹" },
  { name: "忻州市雁门关景区", province: "山西省", city: "忻州市", category: "历史古迹" },
  { name: "临汾市云丘山景区", province: "山西省", city: "临汾市", category: "自然风光" },
  { name: "黄河壶口瀑布旅游区", province: "山西省", city: "临汾市", category: "自然风光" },
  { name: "晋中市乔家大院景区", province: "山西省", city: "晋中市", category: "历史古迹" },
  { name: "赤峰市阿斯哈图石林景区", province: "内蒙古自治区", city: "赤峰市", category: "自然风光" },
  { name: "呼伦贝尔市呼伦贝尔大草原·莫尔格勒河景区", province: "内蒙古自治区", city: "呼伦贝尔市", category: "自然风光" },
  { name: "呼和浩特市老牛湾黄河大峡谷旅游区", province: "内蒙古自治区", city: "呼和浩特市", category: "自然风光" },
  { name: "本溪市五女山景区", province: "辽宁省", city: "本溪市", category: "自然风光" },
  { name: "长春市世界雕塑公园景区", province: "吉林省", city: "长春市", category: "主题公园" },
  { name: "松原市前郭查干湖景区", province: "吉林省", city: "松原市", category: "自然风光" },
  { name: "白城市大安嫩江湾旅游区", province: "吉林省", city: "白城市", category: "自然风光" },
  { name: "齐齐哈尔市扎龙生态旅游区", province: "黑龙江省", city: "齐齐哈尔市", category: "自然风光" },
  { name: "常州市春秋淹城旅游区", province: "江苏省", city: "常州市", category: "历史古迹" },
  { name: "宿迁市洪泽湖湿地景区", province: "江苏省", city: "宿迁市", category: "自然风光" },
  { name: "连云港市连岛景区", province: "江苏省", city: "连云港市", category: "自然风光" },
  { name: "衢州市根宫佛国文化旅游区", province: "浙江省", city: "衢州市", category: "历史古迹" },
  { name: "嘉兴市西塘古镇旅游景区", province: "浙江省", city: "嘉兴市", category: "历史古迹" },
  { name: "金华市双龙风景旅游区", province: "浙江省", city: "金华市", category: "自然风光" },
  { name: "黄山市古徽州文化旅游区", province: "安徽省", city: "黄山市", category: "历史古迹" },
  { name: "六安市万佛湖风景区", province: "安徽省", city: "六安市", category: "自然风光" },
  { name: "宁德市太姥山旅游区", province: "福建省", city: "宁德市", category: "自然风光" },
  { name: "厦门市厦门园林植物园景区", province: "福建省", city: "厦门市", category: "自然风光" },
  { name: "龙岩市冠豸山景区", province: "福建省", city: "龙岩市", category: "自然风光" },
  { name: "赣州市三百山景区", province: "江西省", city: "赣州市", category: "自然风光" },
  { name: "上饶市篁岭景区", province: "江西省", city: "上饶市", category: "历史古迹" },
  { name: "临沂市萤火虫水洞·地下大峡谷旅游区", province: "山东省", city: "临沂市", category: "自然风光" },
  { name: "青岛市奥帆海洋文化旅游区", province: "山东省", city: "青岛市", category: "主题公园" },
  { name: "洛阳市龙潭大峡谷景区", province: "河南省", city: "洛阳市", category: "自然风光" },
  { name: "安阳市红旗渠－太行大峡谷旅游景区", province: "河南省", city: "安阳市", category: "自然风光" },
  { name: "周口市太昊伏羲陵文化旅游区", province: "河南省", city: "周口市", category: "历史古迹" },
  { name: "新乡市宝泉旅游区", province: "河南省", city: "新乡市", category: "自然风光" },
  { name: "恩施州神农溪纤夫文化旅游区", province: "湖北省", city: "恩施州", category: "自然风光" },
  { name: "武汉市木兰文化生态旅游区", province: "湖北省", city: "武汉市", category: "自然风光" },
  { name: "恩施州腾龙洞景区", province: "湖北省", city: "恩施州", category: "自然风光" },
  { name: "宜昌市三峡大瀑布景区", province: "湖北省", city: "宜昌市", category: "自然风光" },
  { name: "黄冈市麻城龟峰山景区", province: "湖北省", city: "黄冈市", category: "自然风光" },
  { name: "湘西州吉首市矮寨·十八洞·德夯大峡谷景区", province: "湖南省", city: "湘西州", category: "自然风光" },
  { name: "河源市万绿湖风景区", province: "广东省", city: "河源市", category: "自然风光" },
  { name: "崇左市德天跨国瀑布景区", province: "广西壮族自治区", city: "崇左市", category: "自然风光" },
  { name: "崇左市花山岩画景区", province: "广西壮族自治区", city: "崇左市", category: "历史古迹" },
  { name: "三亚市天涯海角游览区", province: "海南省", city: "三亚市", category: "自然风光" },
  { name: "白帝城·瞿塘峡景区", province: "重庆市", city: "重庆市", category: "历史古迹" },
  { name: "成都市安仁古镇景区", province: "四川省", city: "成都市", category: "历史古迹" },
  { name: "成都市天台山景区", province: "四川省", city: "成都市", category: "自然风光" },
  { name: "毕节市织金洞景区", province: "贵州省", city: "毕节市", category: "自然风光" },
  { name: "黔西南州万峰林景区", province: "贵州省", city: "黔西南州", category: "自然风光" },
  { name: "文山州普者黑旅游景区", province: "云南省", city: "文山州", category: "自然风光" },
  { name: "林芝市雅鲁藏布大峡谷景区", province: "西藏自治区", city: "林芝市", category: "自然风光" },
  { name: "西安市华清宫景区", province: "陕西省", city: "西安市", category: "历史古迹" },
  { name: "西安市大明宫旅游景区", province: "陕西省", city: "西安市", category: "历史古迹" },
  { name: "延安市延川黄河乾坤湾景区", province: "陕西省", city: "延安市", category: "自然风光" },
  { name: "咸阳市乾陵景区", province: "陕西省", city: "咸阳市", category: "历史古迹" },
  { name: "陇南市官鹅沟景区", province: "甘肃省", city: "陇南市", category: "自然风光" },
  { name: "甘南州冶力关旅游区", province: "甘肃省", city: "甘南州", category: "自然风光" },
  { name: "固原市六盘山红军长征旅游区", province: "宁夏回族自治区", city: "固原市", category: "历史古迹" },
  { name: "喀什地区喀什古城景区", province: "新疆维吾尔自治区", city: "喀什地区", category: "历史古迹" },
  { name: "喀什地区帕米尔旅游区", province: "新疆维吾尔自治区", city: "喀什地区", category: "自然风光" },
  { name: "博尔塔拉蒙古自治州赛里木湖景区", province: "新疆维吾尔自治区", city: "博尔塔拉州", category: "自然风光" },
  { name: "昌吉回族自治州江布拉克景区", province: "新疆维吾尔自治区", city: "昌吉州", category: "自然风光" },
  { name: "阿克苏地区天山托木尔景区", province: "新疆维吾尔自治区", city: "阿克苏地区", category: "自然风光" },
  { name: "兵团十师185团白沙湖景区", province: "新疆维吾尔自治区", city: "阿勒泰地区", category: "自然风光" },
  { name: "兵团阿拉尔市塔克拉玛干·三五九旅文化旅游区", province: "新疆维吾尔自治区", city: "阿拉尔市", category: "历史古迹" }
];

// 新增的66个景区详细信息
const newSpotsDetail = [
  {
    name: "圆明园遗址公园景区",
    province: "北京市",
    city: "北京市",
    description: "圆明园位于北京市海淀区，是清代大型皇家园林，与颐和园毗邻。圆明园始建于1709年，历经康熙、雍正、乾隆、嘉庆、道光、咸丰六朝皇帝，历时150余年建成。1860年第二次鸦片战争期间被英法联军焚毁，现仅存遗址。",
    highlights: ["万园之园", "西洋楼遗址", "大水法", "历史遗址"],
    ticketInfo: { price: 10, description: "门票10元" },
    openTime: "07:00-19:30",
    rating: 4.5,
    images: []
  },
  {
    name: "保定市清西陵景区",
    province: "河北省",
    city: "保定市",
    description: "清西陵位于河北省保定市易县，是清代雍正、嘉庆、道光、光绪四位皇帝的陵寝所在地。清西陵始建于1730年，占地800余平方公里，是中国现存规模最大、保存最完整的清代皇家陵寝群之一。",
    highlights: ["世界文化遗产", "清代皇陵", "泰陵", "昌西陵"],
    ticketInfo: { price: 108, description: "联票108元" },
    openTime: "08:00-17:30",
    rating: 4.6,
    images: []
  },
  {
    name: "承德市金山岭长城景区",
    province: "河北省",
    city: "承德市",
    description: "金山岭长城位于河北省承德市滦平县，是明长城中保存最完好、最具代表性的一段。金山岭长城东起望京楼，西至龙峪口，全长约15公里，以其建筑精美、敌楼密集而著称。",
    highlights: ["万里长城精华", "敌楼密集", "摄影胜地", "明代长城"],
    ticketInfo: { price: 65, description: "门票65元" },
    openTime: "07:00-18:00",
    rating: 4.7,
    images: []
  },
  {
    name: "晋中市平遥古城景区",
    province: "山西省",
    city: "晋中市",
    description: "平遥古城位于山西省晋中市平遥县，是中国保存最完整的明清古县城。古城始建于西周，距今已有2700多年历史，城墙、街道、店铺、民居等基本保持明清时期原貌，被列入世界文化遗产。",
    highlights: ["世界文化遗产", "明清古县城", "古城墙", "日升昌票号"],
    ticketInfo: { price: 125, description: "通票125元" },
    openTime: "08:00-18:00",
    rating: 4.7,
    images: []
  },
  {
    name: "忻州市雁门关景区",
    province: "山西省",
    city: "忻州市",
    description: "雁门关位于山西省忻州市代县，是长城上的重要关隘，有中华第一关之称。雁门关自古为兵家必争之地，杨家将曾在此驻守，留下了许多英雄传说。",
    highlights: ["中华第一关", "长城关隘", "杨家将传说", "古战场"],
    ticketInfo: { price: 90, description: "门票90元" },
    openTime: "08:00-17:30",
    rating: 4.6,
    images: []
  },
  {
    name: "临汾市云丘山景区",
    province: "山西省",
    city: "临汾市",
    description: "云丘山位于山西省临汾市乡宁县，是华夏农耕文明的发源地之一。云丘山山势险峻，风景秀丽，有千年古村落、道教宫观等人文景观，是集自然风光与历史文化于一体的旅游胜地。",
    highlights: ["华夏农耕文明发源地", "千年古村落", "道教圣地", "冰洞群"],
    ticketInfo: { price: 80, description: "门票80元" },
    openTime: "08:00-18:00",
    rating: 4.5,
    images: []
  },
  {
    name: "黄河壶口瀑布旅游区",
    province: "山西省",
    city: "临汾市",
    description: "黄河壶口瀑布位于山西省临汾市吉县与陕西省延安市宜川县交界处，是中国第二大瀑布，也是世界上最大的黄色瀑布。黄河水在此收窄，从20米高的悬崖倾泻而下，气势磅礴，蔚为壮观。",
    highlights: ["世界最大黄色瀑布", "黄河奇观", "水雾彩虹", "民族精神象征"],
    ticketInfo: { price: 100, description: "门票100元" },
    openTime: "08:00-18:00",
    rating: 4.8,
    images: []
  },
  {
    name: "晋中市乔家大院景区",
    province: "山西省",
    city: "晋中市",
    description: "乔家大院位于山西省晋中市祁县，是清代富商乔致庸的宅邸。大院始建于清乾隆年间，占地8724平方米，由6个大院、20个小院、313间房屋组成，是北方民居建筑的典范。",
    highlights: ["北方民居典范", "晋商文化", "乔家大院", "建筑艺术"],
    ticketInfo: { price: 115, description: "门票115元" },
    openTime: "08:00-18:00",
    rating: 4.6,
    images: []
  },
  {
    name: "赤峰市阿斯哈图石林景区",
    province: "内蒙古自治区",
    city: "赤峰市",
    description: "阿斯哈图石林位于内蒙古赤峰市克什克腾旗，是世界罕见的第四纪冰川遗迹。石林由花岗岩石柱组成，形态各异，有的如城堡，有的如人物，被誉为北方石林。",
    highlights: ["冰川遗迹", "花岗岩石林", "地质奇观", "草原石林"],
    ticketInfo: { price: 120, description: "门票120元" },
    openTime: "08:00-17:00",
    rating: 4.5,
    images: []
  },
  {
    name: "呼伦贝尔市呼伦贝尔大草原·莫尔格勒河景区",
    province: "内蒙古自治区",
    city: "呼伦贝尔市",
    description: "莫尔格勒河位于内蒙古呼伦贝尔市陈巴尔虎旗，是呼伦贝尔草原上最美的河流。河流蜿蜒曲折，如一条银色丝带镶嵌在绿色草原上，两岸水草丰美，牛羊成群，是体验草原风光的绝佳之地。",
    highlights: ["天下第一曲水", "呼伦贝尔草原", "草原风光", "蒙古风情"],
    ticketInfo: { price: 20, description: "门票20元" },
    openTime: "全天开放",
    rating: 4.7,
    images: []
  },
  {
    name: "呼和浩特市老牛湾黄河大峡谷旅游区",
    province: "内蒙古自治区",
    city: "呼和浩特市",
    description: "老牛湾位于内蒙古呼和浩特市清水河县，是黄河与长城交汇的地方。这里黄河九曲十八弯，两岸悬崖峭壁，形成了壮丽的峡谷风光，是黄河流域的著名景观。",
    highlights: ["黄河长城交汇", "黄河大峡谷", "悬崖峭壁", "九曲黄河"],
    ticketInfo: { price: 40, description: "门票40元" },
    openTime: "08:00-18:00",
    rating: 4.5,
    images: []
  },
  {
    name: "本溪市五女山景区",
    province: "辽宁省",
    city: "本溪市",
    description: "五女山位于辽宁省本溪市桓仁县，是高句丽王朝的第一代王城所在地。五女山山势险峻，山顶平坦，有高句丽山城遗址，被列入世界文化遗产。",
    highlights: ["世界文化遗产", "高句丽王城", "山城遗址", "历史遗迹"],
    ticketInfo: { price: 80, description: "门票80元" },
    openTime: "08:00-17:00",
    rating: 4.6,
    images: []
  },
  {
    name: "长春市世界雕塑公园景区",
    province: "吉林省",
    city: "长春市",
    description: "长春世界雕塑公园位于吉林省长春市，是集雕塑艺术展示、文化交流、旅游休闲于一体的主题公园。园内收藏了来自世界各地的雕塑作品200余件，是亚洲最大的雕塑公园。",
    highlights: ["亚洲最大雕塑公园", "国际雕塑艺术", "文化交融", "艺术殿堂"],
    ticketInfo: { price: 30, description: "门票30元" },
    openTime: "08:00-17:00",
    rating: 4.5,
    images: []
  },
  {
    name: "松原市前郭查干湖景区",
    province: "吉林省",
    city: "松原市",
    description: "查干湖位于吉林省松原市前郭尔罗斯蒙古族自治县，是吉林省最大的内陆湖。查干湖冬捕是著名的民俗活动，每年冬季举行盛大的冬捕仪式，吸引了众多游客。",
    highlights: ["吉林最大内陆湖", "冬捕民俗", "蒙古风情", "湿地生态"],
    ticketInfo: { price: 0, description: "景区免费开放" },
    openTime: "全天开放",
    rating: 4.5,
    images: []
  },
  {
    name: "白城市大安嫩江湾旅游区",
    province: "吉林省",
    city: "白城市",
    description: "嫩江湾位于吉林省白城市大安市，是嫩江下游的湿地景观。这里水草丰美，候鸟众多，是观鸟和生态旅游的好去处，被誉为嫩江明珠。",
    highlights: ["嫩江明珠", "湿地生态", "观鸟胜地", "自然风光"],
    ticketInfo: { price: 0, description: "景区免费开放" },
    openTime: "全天开放",
    rating: 4.4,
    images: []
  },
  {
    name: "齐齐哈尔市扎龙生态旅游区",
    province: "黑龙江省",
    city: "齐齐哈尔市",
    description: "扎龙自然保护区位于黑龙江省齐齐哈尔市，是中国最大的湿地自然保护区，也是世界最大的鹤类栖息地。扎龙以丹顶鹤闻名，是世界上最大的丹顶鹤繁殖地。",
    highlights: ["世界最大鹤类栖息地", "丹顶鹤故乡", "湿地生态", "观鸟胜地"],
    ticketInfo: { price: 65, description: "门票65元" },
    openTime: "08:00-17:00",
    rating: 4.6,
    images: []
  },
  {
    name: "常州市春秋淹城旅游区",
    province: "江苏省",
    city: "常州市",
    description: "淹城遗址位于江苏省常州市武进区，是中国现存最完整的春秋时期古城遗址。淹城由三道城墙、三道护城河组成，形似龟背，是研究春秋时期城池建筑的重要实物资料。",
    highlights: ["春秋古城遗址", "三城三河", "历史遗迹", "考古遗址"],
    ticketInfo: { price: 70, description: "门票70元" },
    openTime: "08:30-17:00",
    rating: 4.5,
    images: []
  },
  {
    name: "宿迁市洪泽湖湿地景区",
    province: "江苏省",
    city: "宿迁市",
    description: "洪泽湖湿地位于江苏省宿迁市泗洪县，是洪泽湖的重要组成部分。这里湿地面积广阔，生态环境优良，是众多水鸟的栖息地，也是重要的生态旅游目的地。",
    highlights: ["湿地生态", "观鸟胜地", "洪泽湖", "自然风光"],
    ticketInfo: { price: 60, description: "门票60元" },
    openTime: "08:30-17:30",
    rating: 4.5,
    images: []
  },
  {
    name: "连云港市连岛景区",
    province: "江苏省",
    city: "连云港市",
    description: "连岛位于江苏省连云港市，是江苏省最大的海岛。连岛由东西两岛组成，中间有长堤相连，岛上沙滩细腻，海水清澈，是理想的海滨度假胜地。",
    highlights: ["江苏最大海岛", "海滨度假", "沙滩浴场", "海岛风光"],
    ticketInfo: { price: 50, description: "门票50元" },
    openTime: "07:00-18:00",
    rating: 4.5,
    images: []
  },
  {
    name: "衢州市根宫佛国文化旅游区",
    province: "浙江省",
    city: "衢州市",
    description: "根宫佛国位于浙江省衢州市开化县，是以根雕艺术为主题的文化旅游区。园内收藏了数万件根雕艺术品，其中最大的根雕佛像是世界之最，被誉为中国根雕艺术之乡。",
    highlights: ["根雕艺术之乡", "世界最大根雕", "佛教文化", "艺术殿堂"],
    ticketInfo: { price: 120, description: "门票120元" },
    openTime: "08:00-17:00",
    rating: 4.6,
    images: []
  },
  {
    name: "嘉兴市西塘古镇旅游景区",
    province: "浙江省",
    city: "嘉兴市",
    description: "西塘古镇位于浙江省嘉兴市嘉善县，是江南六大古镇之一。西塘以桥多、弄多、廊棚多而闻名，古镇保存完好，小桥流水人家，是体验江南水乡风情的绝佳之地。",
    highlights: ["江南水乡", "古镇风情", "廊棚", "小桥流水"],
    ticketInfo: { price: 100, description: "门票100元" },
    openTime: "全天开放",
    rating: 4.7,
    images: []
  },
  {
    name: "金华市双龙风景旅游区",
    province: "浙江省",
    city: "金华市",
    description: "双龙洞位于浙江省金华市，是喀斯特地貌的典型代表。双龙洞由内外两个溶洞组成，洞内钟乳石千姿百态，地下河清澈见底，是著名的溶洞景观。",
    highlights: ["喀斯特溶洞", "双龙奇观", "地下河", "钟乳石"],
    ticketInfo: { price: 90, description: "门票90元" },
    openTime: "08:00-17:00",
    rating: 4.5,
    images: []
  },
  {
    name: "黄山市古徽州文化旅游区",
    province: "安徽省",
    city: "黄山市",
    description: "古徽州文化旅游区位于安徽省黄山市，包括徽州古城、呈坎、唐模等景点。这里是徽文化的发源地，徽派建筑、徽商文化、徽菜等徽文化元素在此得到充分展现。",
    highlights: ["徽文化发源地", "徽派建筑", "徽商文化", "古城古村"],
    ticketInfo: { price: 120, description: "联票120元" },
    openTime: "08:00-17:00",
    rating: 4.6,
    images: []
  },
  {
    name: "六安市万佛湖风景区",
    province: "安徽省",
    city: "六安市",
    description: "万佛湖位于安徽省六安市舒城县，是大型人工湖泊。万佛湖湖面开阔，岛屿众多，湖光山色，景色宜人，是集观光、度假、休闲于一体的旅游胜地。",
    highlights: ["人工湖泊", "湖光山色", "岛屿众多", "度假胜地"],
    ticketInfo: { price: 65, description: "门票65元" },
    openTime: "08:00-17:30",
    rating: 4.5,
    images: []
  },
  {
    name: "宁德市太姥山旅游区",
    province: "福建省",
    city: "宁德市",
    description: "太姥山位于福建省宁德市福鼎市，是国家级风景名胜区。太姥山以花岗岩峰林地貌著称，峰峦叠嶂，怪石嶙峋，有海上仙都之称。",
    highlights: ["海上仙都", "花岗岩峰林", "奇石怪岩", "山海风光"],
    ticketInfo: { price: 100, description: "门票100元" },
    openTime: "07:00-17:30",
    rating: 4.6,
    images: []
  },
  {
    name: "厦门市厦门园林植物园景区",
    province: "福建省",
    city: "厦门市",
    description: "厦门园林植物园位于福建省厦门市思明区，是福建省最大的植物园。园内收集了热带、亚热带植物数千种，有雨林世界、多肉植物区等特色展区，是植物科普和休闲游览的好去处。",
    highlights: ["福建省最大植物园", "雨林世界", "多肉植物", "植物科普"],
    ticketInfo: { price: 30, description: "门票30元" },
    openTime: "07:30-18:00",
    rating: 4.5,
    images: []
  },
  {
    name: "龙岩市冠豸山景区",
    province: "福建省",
    city: "龙岩市",
    description: "冠豸山位于福建省龙岩市连城县，是国家级风景名胜区。冠豸山山形如冠豸，山势雄伟，景色秀丽，与武夷山并称北夷南豸丹霞双绝。",
    highlights: ["北夷南豸", "丹霞地貌", "山水风光", "客家文化"],
    ticketInfo: { price: 65, description: "门票65元" },
    openTime: "08:00-17:30",
    rating: 4.5,
    images: []
  },
  {
    name: "赣州市三百山景区",
    province: "江西省",
    city: "赣州市",
    description: "三百山位于江西省赣州市安远县，是东江的源头。三百山山清水秀，森林茂密，瀑布众多，是集生态旅游、避暑度假于一体的旅游胜地。",
    highlights: ["东江源头", "瀑布群", "森林氧吧", "生态旅游"],
    ticketInfo: { price: 80, description: "门票80元" },
    openTime: "08:00-17:30",
    rating: 4.5,
    images: []
  },
  {
    name: "上饶市篁岭景区",
    province: "江西省",
    city: "上饶市",
    description: "篁岭位于江西省上饶市婺源县，是著名的晒秋文化发源地。篁岭古村依山而建，秋季家家户户在晒架上晾晒农作物，形成独特的晒秋景观，被誉为最美乡村符号。",
    highlights: ["晒秋文化", "最美乡村", "梯田花海", "古村风情"],
    ticketInfo: { price: 145, description: "门票145元" },
    openTime: "07:00-17:30",
    rating: 4.7,
    images: []
  },
  {
    name: "临沂市萤火虫水洞·地下大峡谷旅游区",
    province: "山东省",
    city: "临沂市",
    description: "萤火虫水洞和地下大峡谷位于山东省临沂市沂水县，是喀斯特地貌的典型代表。萤火虫水洞内有成千上万只萤火虫，如繁星点点；地下大峡谷长达6100米，是北方最大的溶洞。",
    highlights: ["萤火虫奇观", "地下大峡谷", "喀斯特溶洞", "地质奇观"],
    ticketInfo: { price: 96, description: "联票96元" },
    openTime: "08:00-17:30",
    rating: 4.6,
    images: []
  },
  {
    name: "青岛市奥帆海洋文化旅游区",
    province: "山东省",
    city: "青岛市",
    description: "青岛奥帆中心位于山东省青岛市市南区，是2008年北京奥运会帆船比赛举办地。景区包括奥帆中心、情人坝、灯塔等景点，是集体育、文化、旅游于一体的综合性景区。",
    highlights: ["奥运帆船赛场", "海滨风光", "情人坝", "青岛地标"],
    ticketInfo: { price: 0, description: "景区免费开放" },
    openTime: "全天开放",
    rating: 4.6,
    images: []
  },
  {
    name: "洛阳市龙潭大峡谷景区",
    province: "河南省",
    city: "洛阳市",
    description: "龙潭大峡谷位于河南省洛阳市新安县，是典型的红岩嶂谷地貌。峡谷全长12公里，谷内悬崖峭壁，飞瀑流泉，景色壮美，被誉为峡谷极品，黄河山水画廊。",
    highlights: ["红岩嶂谷", "峡谷极品", "飞瀑流泉", "地质奇观"],
    ticketInfo: { price: 85, description: "门票85元" },
    openTime: "08:00-17:00",
    rating: 4.7,
    images: []
  },
  {
    name: "安阳市红旗渠－太行大峡谷旅游景区",
    province: "河南省",
    city: "安阳市",
    description: "红旗渠和太行大峡谷位于河南省安阳市林州市。红旗渠是20世纪60年代林县人民在太行山腰修建的水利工程，被誉为人工天河。太行大峡谷山势雄伟，景色秀丽。",
    highlights: ["人工天河", "红旗渠精神", "太行风光", "峡谷景观"],
    ticketInfo: { price: 100, description: "联票100元" },
    openTime: "08:00-17:30",
    rating: 4.7,
    images: []
  },
  {
    name: "周口市太昊伏羲陵文化旅游区",
    province: "河南省",
    city: "周口市",
    description: "太昊伏羲陵位于河南省周口市淮阳县，是中华人文始祖伏羲的陵墓。太昊陵始建于春秋，历经历代修建，规模宏大，是海内外华人寻根祭祖的圣地。",
    highlights: ["人文始祖陵寝", "寻根祭祖圣地", "太昊陵", "伏羲文化"],
    ticketInfo: { price: 40, description: "门票40元" },
    openTime: "08:00-18:00",
    rating: 4.5,
    images: []
  },
  {
    name: "新乡市宝泉旅游区",
    province: "河南省",
    city: "新乡市",
    description: "宝泉旅游区位于河南省新乡市辉县，是集山水观光、休闲度假于一体的旅游胜地。景区内有宝泉水库、宝泉瀑布等景点，山清水秀，景色宜人。",
    highlights: ["山水风光", "宝泉瀑布", "休闲度假", "自然生态"],
    ticketInfo: { price: 78, description: "门票78元" },
    openTime: "08:00-17:30",
    rating: 4.5,
    images: []
  },
  {
    name: "恩施州神农溪纤夫文化旅游区",
    province: "湖北省",
    city: "恩施州",
    description: "神农溪位于湖北省恩施州巴东县，是长江三峡中的一条支流。神农溪两岸风光秀丽，溪水清澈，保留了传统的纤夫文化，可以体验纤夫拉纤的原始风情。",
    highlights: ["纤夫文化", "神农溪", "峡谷风光", "原始风情"],
    ticketInfo: { price: 200, description: "船票200元" },
    openTime: "08:00-17:00",
    rating: 4.6,
    images: []
  },
  {
    name: "武汉市木兰文化生态旅游区",
    province: "湖北省",
    city: "武汉市",
    description: "木兰文化旅游区位于湖北省武汉市黄陂区，是为纪念巾帼英雄花木兰而建的旅游景区。景区包括木兰山、木兰湖、木兰草原等景点，是集生态旅游、文化体验于一体的综合性景区。",
    highlights: ["木兰文化", "木兰山", "木兰湖", "生态旅游"],
    ticketInfo: { price: 80, description: "联票80元" },
    openTime: "08:00-17:30",
    rating: 4.6,
    images: []
  },
  {
    name: "恩施州腾龙洞景区",
    province: "湖北省",
    city: "恩施州",
    description: "腾龙洞位于湖北省恩施州利川市，是中国已探明的最大溶洞。腾龙洞洞口高74米，宽64米，洞内可容纳数万人，是集溶洞观光、洞穴探险于一体的旅游胜地。",
    highlights: ["中国最大溶洞", "洞穴奇观", "地下河", "探险胜地"],
    ticketInfo: { price: 180, description: "门票180元" },
    openTime: "08:30-17:00",
    rating: 4.7,
    images: []
  },
  {
    name: "宜昌市三峡大瀑布景区",
    province: "湖北省",
    city: "宜昌市",
    description: "三峡大瀑布位于湖北省宜昌市夷陵区，是长江三峡附近的著名瀑布。瀑布高102米，宽80米，气势磅礴，是集峡谷、瀑布、溶洞于一体的旅游胜地。",
    highlights: ["长江三峡瀑布", "高102米", "峡谷风光", "溶洞奇观"],
    ticketInfo: { price: 115, description: "门票115元" },
    openTime: "08:00-17:00",
    rating: 4.6,
    images: []
  },
  {
    name: "黄冈市麻城龟峰山景区",
    province: "湖北省",
    city: "黄冈市",
    description: "龟峰山位于湖北省黄冈市麻城市，因山形如龟而得名。龟峰山以杜鹃花闻名，每年春季，漫山遍野的杜鹃花盛开，形成壮观的杜鹃花海，被誉为中国杜鹃花第一山。",
    highlights: ["中国杜鹃花第一山", "杜鹃花海", "龟峰山", "春季赏花"],
    ticketInfo: { price: 100, description: "旺季100元" },
    openTime: "08:00-17:30",
    rating: 4.6,
    images: []
  },
  {
    name: "湘西州吉首市矮寨·十八洞·德夯大峡谷景区",
    province: "湖南省",
    city: "湘西州",
    description: "矮寨·十八洞·德夯大峡谷位于湖南省湘西州吉首市，是集峡谷风光、苗族文化、扶贫典范于一体的旅游区。矮寨大桥是世界建筑史上的奇迹，十八洞是精准扶贫的首倡地。",
    highlights: ["矮寨大桥", "十八洞", "德夯大峡谷", "苗族文化"],
    ticketInfo: { price: 100, description: "联票100元" },
    openTime: "08:00-17:30",
    rating: 4.7,
    images: []
  },
  {
    name: "河源市万绿湖风景区",
    province: "广东省",
    city: "河源市",
    description: "万绿湖位于广东省河源市，是华南最大的人工湖。万绿湖水质清澈，岛屿众多，森林茂密，是集观光、度假、休闲于一体的旅游胜地，被誉为粤港澳后花园。",
    highlights: ["华南最大人工湖", "水质清澈", "岛屿众多", "粤港澳后花园"],
    ticketInfo: { price: 0, description: "景区免费开放" },
    openTime: "全天开放",
    rating: 4.5,
    images: []
  },
  {
    name: "崇左市德天跨国瀑布景区",
    province: "广西壮族自治区",
    city: "崇左市",
    description: "德天跨国瀑布位于广西崇左市大新县与越南边境，是亚洲最大的跨国瀑布。瀑布宽200米，落差70米，气势磅礴，横跨中越两国，是独特的跨国景观。",
    highlights: ["亚洲最大跨国瀑布", "中越边境", "瀑布奇观", "异国风情"],
    ticketInfo: { price: 115, description: "门票115元" },
    openTime: "08:00-17:30",
    rating: 4.7,
    images: []
  },
  {
    name: "崇左市花山岩画景区",
    province: "广西壮族自治区",
    city: "崇左市",
    description: "花山岩画位于广西崇左市宁明县，是世界文化遗产。岩画绘制于战国至东汉时期，描绘了骆越先民的祭祀场景，是世界上发现的规模最大的古代岩画之一。",
    highlights: ["世界文化遗产", "古代岩画", "骆越文化", "祭祀场景"],
    ticketInfo: { price: 80, description: "门票80元" },
    openTime: "08:00-17:00",
    rating: 4.5,
    images: []
  },
  {
    name: "三亚市天涯海角游览区",
    province: "海南省",
    city: "三亚市",
    description: "天涯海角位于海南省三亚市，是海南最著名的景点之一。景区内有天涯、海角等巨石，寓意海角天涯，是情侣们向往的爱情圣地，也是海南旅游的标志性景点。",
    highlights: ["爱情圣地", "天涯海角", "海滨风光", "海南地标"],
    ticketInfo: { price: 81, description: "门票81元" },
    openTime: "07:30-18:00",
    rating: 4.5,
    images: []
  },
  {
    name: "白帝城·瞿塘峡景区",
    province: "重庆市",
    city: "重庆市",
    description: "白帝城·瞿塘峡位于重庆市奉节县，是长江三峡的重要组成部分。白帝城因刘备托孤而闻名，瞿塘峡以雄伟险峻著称，是长江三峡中最短最险的峡谷。",
    highlights: ["长江三峡", "白帝城", "瞿塘峡", "刘备托孤"],
    ticketInfo: { price: 100, description: "联票100元" },
    openTime: "08:00-17:30",
    rating: 4.7,
    images: []
  },
  {
    name: "成都市安仁古镇景区",
    province: "四川省",
    city: "成都市",
    description: "安仁古镇位于四川省成都市大邑县，是中国著名的博物馆小镇。古镇保存完好，有建川博物馆聚落、刘氏庄园等众多博物馆，是了解中国近现代历史的重要场所。",
    highlights: ["博物馆小镇", "建川博物馆", "刘氏庄园", "古镇风情"],
    ticketInfo: { price: 0, description: "古镇免费，博物馆收费" },
    openTime: "全天开放",
    rating: 4.6,
    images: []
  },
  {
    name: "成都市天台山景区",
    province: "四川省",
    city: "成都市",
    description: "天台山位于四川省成都市邛崃市，是国家级风景名胜区。天台山山势雄伟，森林茂密，瀑布众多，是集自然风光、佛教文化于一体的旅游胜地。",
    highlights: ["佛教圣地", "瀑布群", "森林氧吧", "自然风光"],
    ticketInfo: { price: 50, description: "门票50元" },
    openTime: "08:00-17:00",
    rating: 4.5,
    images: []
  },
  {
    name: "毕节市织金洞景区",
    province: "贵州省",
    city: "毕节市",
    description: "织金洞位于贵州省毕节市织金县，是中国最美旅游洞穴之首。织金洞洞内空间巨大，钟乳石千姿百态，被誉为地下艺术宫殿，是喀斯特地貌的典型代表。",
    highlights: ["中国最美洞穴", "地下艺术宫殿", "喀斯特溶洞", "钟乳石奇观"],
    ticketInfo: { price: 100, description: "门票100元" },
    openTime: "09:00-17:00",
    rating: 4.8,
    images: []
  },
  {
    name: "黔西南州万峰林景区",
    province: "贵州省",
    city: "黔西南州",
    description: "万峰林位于贵州省黔西南州兴义市，是典型的喀斯特峰林地貌。万峰林有两万多座山峰，连绵不绝，气势磅礴，被誉为中国最美的峰林之一。",
    highlights: ["喀斯特峰林", "万峰竞秀", "田园风光", "布依族文化"],
    ticketInfo: { price: 70, description: "门票70元" },
    openTime: "08:00-17:30",
    rating: 4.6,
    images: []
  },
  {
    name: "文山州普者黑旅游景区",
    province: "云南省",
    city: "文山州",
    description: "普者黑位于云南省文山州丘北县，是典型的喀斯特湖泊群。普者黑以溶洞、湖泊、峰林、荷花为特色，夏季万亩荷花盛开，景色如画，是理想的避暑胜地。",
    highlights: ["喀斯特湖泊", "万亩荷花", "溶洞奇观", "避暑胜地"],
    ticketInfo: { price: 200, description: "联票200元" },
    openTime: "08:00-17:30",
    rating: 4.7,
    images: []
  },
  {
    name: "林芝市雅鲁藏布大峡谷景区",
    province: "西藏自治区",
    city: "林芝市",
    description: "雅鲁藏布大峡谷位于西藏林芝市，是世界第一大峡谷。大峡谷全长504.6公里，最深处达6009米，集雪山、冰川、峡谷、森林于一体，是世界上最壮丽的自然景观之一。",
    highlights: ["世界第一大峡谷", "雅鲁藏布江", "雪山冰川", "自然奇观"],
    ticketInfo: { price: 290, description: "门票290元" },
    openTime: "09:00-18:00",
    rating: 4.8,
    images: []
  },
  {
    name: "西安市华清宫景区",
    province: "陕西省",
    city: "西安市",
    description: "华清宫位于陕西省西安市临潼区，是唐代皇家离宫。华清宫以温泉闻名，唐玄宗与杨贵妃的爱情故事在此发生，华清池遗址、长恨歌演出是景区的亮点。",
    highlights: ["唐代离宫", "华清池", "长恨歌", "温泉文化"],
    ticketInfo: { price: 120, description: "门票120元" },
    openTime: "08:00-18:00",
    rating: 4.6,
    images: []
  },
  {
    name: "西安市大明宫旅游景区",
    province: "陕西省",
    city: "西安市",
    description: "大明宫位于陕西省西安市，是唐代三大宫殿之一，是唐代的政治中心。大明宫遗址公园在原址上建设，展示了盛唐时期的宫殿建筑格局，是了解唐代历史的重要场所。",
    highlights: ["唐代宫殿", "大明宫遗址", "盛唐文化", "考古遗址"],
    ticketInfo: { price: 60, description: "门票60元" },
    openTime: "08:30-18:00",
    rating: 4.5,
    images: []
  },
  {
    name: "延安市延川黄河乾坤湾景区",
    province: "陕西省",
    city: "延安市",
    description: "黄河乾坤湾位于陕西省延安市延川县，是黄河蛇曲国家地质公园的核心景区。乾坤湾是黄河上最大的蛇曲，形如太极图，气势磅礴，是黄河流域的著名景观。",
    highlights: ["黄河蛇曲", "乾坤湾", "太极图", "黄河奇观"],
    ticketInfo: { price: 80, description: "门票80元" },
    openTime: "08:00-17:30",
    rating: 4.6,
    images: []
  },
  {
    name: "咸阳市乾陵景区",
    province: "陕西省",
    city: "咸阳市",
    description: "乾陵位于陕西省咸阳市乾县，是唐高宗李治和武则天的合葬陵。乾陵依山而建，气势雄伟，无字碑、六十一蕃臣像是乾陵的标志性景观，是唐代陵寝建筑的杰出代表。",
    highlights: ["唐代皇陵", "武则天陵", "无字碑", "六十一蕃臣像"],
    ticketInfo: { price: 100, description: "门票100元" },
    openTime: "08:00-18:00",
    rating: 4.6,
    images: []
  },
  {
    name: "陇南市官鹅沟景区",
    province: "甘肃省",
    city: "陇南市",
    description: "官鹅沟位于甘肃省陇南市宕昌县，是集森林、峡谷、瀑布、湖泊于一体的旅游胜地。官鹅沟山清水秀，景色宜人，被誉为小九寨沟，是西北地区的生态旅游胜地。",
    highlights: ["小九寨沟", "峡谷风光", "瀑布群", "森林氧吧"],
    ticketInfo: { price: 130, description: "门票130元" },
    openTime: "08:00-17:30",
    rating: 4.6,
    images: []
  },
  {
    name: "甘南州冶力关旅游区",
    province: "甘肃省",
    city: "甘南州",
    description: "冶力关位于甘肃省甘南州临潭县，是集自然风光、藏族文化于一体的旅游胜地。冶力关有冶海天池、冶力关森林公园等景点，山清水秀，景色宜人，是理想的避暑胜地。",
    highlights: ["冶海天池", "森林公园", "藏族文化", "避暑胜地"],
    ticketInfo: { price: 100, description: "门票100元" },
    openTime: "08:00-17:30",
    rating: 4.5,
    images: []
  },
  {
    name: "固原市六盘山红军长征旅游区",
    province: "宁夏回族自治区",
    city: "固原市",
    description: "六盘山红军长征旅游区位于宁夏固原市，是红军长征翻越的最后一座大山。景区包括六盘山红军长征纪念馆、将台堡红军长征会师纪念碑等红色景点，是重要的红色教育基地。",
    highlights: ["红军长征", "红色教育基地", "六盘山", "将台堡"],
    ticketInfo: { price: 0, description: "纪念馆免费开放" },
    openTime: "09:00-17:00",
    rating: 4.6,
    images: []
  },
  {
    name: "喀什地区喀什古城景区",
    province: "新疆维吾尔自治区",
    city: "喀什地区",
    description: "喀什古城位于新疆喀什地区喀什市，是中国保存最完整的西域古城之一。古城以艾提尕尔清真寺为中心，街巷纵横，民居独特，是体验维吾尔族文化的绝佳之地。",
    highlights: ["西域古城", "维吾尔文化", "艾提尕尔清真寺", "古城街巷"],
    ticketInfo: { price: 0, description: "古城免费开放" },
    openTime: "全天开放",
    rating: 4.6,
    images: []
  },
  {
    name: "喀什地区帕米尔旅游区",
    province: "新疆维吾尔自治区",
    city: "喀什地区",
    description: "帕米尔旅游区位于新疆喀什地区塔什库尔干县，是帕米尔高原的一部分。这里雪山连绵，草原辽阔，是塔吉克族的主要聚居地，有世界第二高峰乔戈里峰。",
    highlights: ["帕米尔高原", "雪山草原", "塔吉克文化", "乔戈里峰"],
    ticketInfo: { price: 0, description: "景区免费开放" },
    openTime: "全天开放",
    rating: 4.5,
    images: []
  },
  {
    name: "博尔塔拉蒙古自治州赛里木湖景区",
    province: "新疆维吾尔自治区",
    city: "博尔塔拉州",
    description: "赛里木湖位于新疆博尔塔拉州博乐市，是新疆海拔最高、面积最大的高山湖泊。赛里木湖湖水清澈，雪山环绕，景色壮美，被誉为大西洋最后一滴眼泪。",
    highlights: ["高山湖泊", "大西洋最后一滴眼泪", "雪山环绕", "湖光山色"],
    ticketInfo: { price: 70, description: "门票70元" },
    openTime: "09:00-20:00",
    rating: 4.8,
    images: []
  },
  {
    name: "昌吉回族自治州江布拉克景区",
    province: "新疆维吾尔自治区",
    city: "昌吉州",
    description: "江布拉克位于新疆昌吉州奇台县，是典型的山地草原景观。江布拉克草原辽阔，森林茂密，雪山环绕，是集观光、度假、摄影于一体的旅游胜地。",
    highlights: ["山地草原", "雪山森林", "摄影胜地", "自然风光"],
    ticketInfo: { price: 43, description: "门票43元" },
    openTime: "09:00-19:00",
    rating: 4.6,
    images: []
  },
  {
    name: "阿克苏地区天山托木尔景区",
    province: "新疆维吾尔自治区",
    city: "阿克苏地区",
    description: "天山托木尔景区位于新疆阿克苏地区温宿县，是天山山脉的重要组成部分。景区包括托木尔峰、大峡谷等景点，雪山、峡谷、森林、草原交相辉映，景色壮美。",
    highlights: ["天山山脉", "托木尔峰", "大峡谷", "雪山峡谷"],
    ticketInfo: { price: 36, description: "门票36元" },
    openTime: "10:00-19:00",
    rating: 4.6,
    images: []
  },
  {
    name: "兵团十师185团白沙湖景区",
    province: "新疆维吾尔自治区",
    city: "阿勒泰地区",
    description: "白沙湖位于新疆阿勒泰地区兵团十师185团，是一个小型沙漠湖泊。白沙湖湖水清澈，周围是沙漠和胡杨林，形成了独特的沙漠湖泊景观，是新疆的秘境之地。",
    highlights: ["沙漠湖泊", "秘境之地", "胡杨林", "沙漠风光"],
    ticketInfo: { price: 45, description: "门票45元" },
    openTime: "09:00-19:00",
    rating: 4.5,
    images: []
  },
  {
    name: "兵团阿拉尔市塔克拉玛干·三五九旅文化旅游区",
    province: "新疆维吾尔自治区",
    city: "阿拉尔市",
    description: "塔克拉玛干·三五九旅文化旅游区位于新疆阿拉尔市，是集沙漠风光、军垦文化于一体的旅游区。景区展示了三五九旅屯垦戍边的历史，是了解新疆生产建设兵团的重要窗口。",
    highlights: ["军垦文化", "三五九旅", "塔克拉玛干沙漠", "兵团历史"],
    ticketInfo: { price: 0, description: "景区免费开放" },
    openTime: "09:00-18:00",
    rating: 4.5,
    images: []
  }
];

async function mergeDataFiles() {
  try {
    const basicPath = 'c:/work/code/vibe-coding/travel-map/data/scenic-spots.json';
    const detailPath = 'c:/work/code/vibe-coding/travel-map/data/scenic-spots-detail-full.json';

    // 读取现有数据
    const existingBasic = JSON.parse(await fs.readFile(basicPath, 'utf-8'));
    const existingDetail = JSON.parse(await fs.readFile(detailPath, 'utf-8'));

    // 合并数据
    const mergedBasic = [...existingBasic, ...newSpotsBasic];
    const mergedDetail = [...existingDetail, ...newSpotsDetail];

    // 写入文件
    await fs.writeFile(basicPath, JSON.stringify(mergedBasic, null, 2), 'utf-8');
    await fs.writeFile(detailPath, JSON.stringify(mergedDetail, null, 2), 'utf-8');

    console.log(`成功合并数据文件`);
    console.log(`scenic-spots.json: ${existingBasic.length} -> ${mergedBasic.length}`);
    console.log(`scenic-spots-detail-full.json: ${existingDetail.length} -> ${mergedDetail.length}`);

  } catch (error) {
    console.error('错误:', error);
  }
}

mergeDataFiles();
