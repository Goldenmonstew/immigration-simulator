import { addDays, addMonths, firstWeekday } from '../../calendar';
import { balance as b } from '../../balance';
import type { GameState, IsoDate, Locale, Text, FestivalId } from '../../types';

export const festivalResults: Record<FestivalId, Text[]> = {
  'lunar-new-year': [
    {
      zhCN: '你沿摊位走了一圈，替摊主按住卷起来的红纸价签。',
      en: 'You browse the stalls and hold down a curling red price tag for a stallholder.',
    },
    {
      zhCN: '你在年货摊前停下来，摊主一掀盖，热气把价签都遮住了。',
      en: 'You stop at a New Year stall. The stallholder lifts a lid and steam hides the prices.',
    },
    {
      zhCN: '你从摊位间穿过，帮摊主把滑下来的红桌布拉回桌角。',
      en: 'You weave between the stalls and help pull a slipping red tablecloth back over the corner.',
    },
  ],
  'may-day': [
    {
      zhCN: '你沿着摊位走了一圈，替摊主捡回掉下的纸袋，袋口还粘着面包屑。',
      en: 'You stroll past the stalls and retrieve a fallen paper bag for a stallholder, crumbs still caught in its opening.',
    },
    {
      zhCN: '你帮忙摆正甜面包的价签，旁边的小狗始终盯着桌沿，没看价钱。',
      en: 'You straighten the bun stall’s price sign. A nearby dog watches the table edge without checking the price.',
    },
    {
      zhCN: '你把挡路的空篮挪回摊边，摊主让开身，露出摆得歪歪的花束。',
      en: 'You move an empty basket out of the way. The stallholder steps aside, revealing some crooked bunches of flowers.',
    },
  ],
  'summer-fair': [
    {
      zhCN: '你替摊主按住卷起的价签，离开时衣袖还带着烤玉米的香气。',
      en: 'You hold down a curling price label for a stallholder. Grilled corn still scents your sleeve as you leave.',
    },
    {
      zhCN: '你把滚到桌边的番茄推回篮子，摊主给它垫了块折好的布。',
      en: 'You nudge a rolling tomato back into its basket. The stallholder tucks a folded cloth beneath it.',
    },
    {
      zhCN: '评比桌旁挤满了人，你腾出地方让篮子通过，听完一段种菜的笑话。',
      en: 'You make room for a basket in the crowd by the judging table and hear a gardening joke to the end.',
    },
  ],
  'bonfire-night': [
    {
      zhCN: '烟花在杯口上方开了，你慢半拍抬头，热茶倒是一口没洒。',
      en: 'Fireworks open above your cup. You look up a moment late, without spilling a drop of tea.',
    },
    {
      zhCN: '你捧着杯子看完烟花，旁边的人替你捡回被风掀走的杯盖。',
      en: 'You watch the fireworks with your cup. Someone beside you retrieves the lid the wind carried off.',
    },
    {
      zhCN: '最后一朵烟花散开，你让热杯在掌心转了转，指尖终于暖了。',
      en: 'As the final firework fades, you turn the warm cup in your palms. Your fingertips have finally thawed.',
    },
  ],
  'christmas-market': [
    {
      zhCN: '你把吹起的包装纸递回摊上，姜饼人安稳地躺进了纸盒。',
      en: 'You hand windblown wrapping back to the stall. A gingerbread person settles safely into its box.',
    },
    {
      zhCN: '你扶住歪掉的小树，摊主替它转正底座，铃铛一路响到你松手。',
      en: 'You steady a leaning little tree while the stallholder turns its base. Its bells ring until you let go.',
    },
    {
      zhCN: '你替摊主压平礼品袋，折歪的纸星星留在桌边，照样被人挑走了。',
      en: 'You flatten gift bags for a stallholder. Someone still chooses the crooked paper star left on the table.',
    },
  ],
};
const dumplingResults: Text[] = [
  {
    zhCN: '你捏好第一个饺子，把托盘传到桌尾，盘沿的面粉在袖口留了道白印。',
    en: 'You fold your first dumpling and pass the tray down the table. Flour leaves a white mark on your sleeve.',
  },
  {
    zhCN: '你替邻座扶稳饺子盘，自己捏的歪封口换来一桌笑声。',
    en: 'You steady a neighbour’s dumpling plate. Your crooked fold makes the whole table laugh.',
  },
  {
    zhCN: '你把包好的饺子排齐，又摞好空托盘，指尖还粘着面粉。',
    en: 'You line up the dumplings you folded and stack the empty trays, flour still on your fingertips.',
  },
];
const ribbonResults: Text[] = [
  {
    zhCN: '你绕过彩带结，和迎面的人笑着换位，袖口多了道折痕。',
    en: 'You circle a ribbon knot and swap places with someone, laughing. A new crease marks your cuff.',
  },
  {
    zhCN: '彩带在肩旁绕过，你找回舞步，带尾在手心弯成小圈。',
    en: 'A ribbon passes your shoulder. You find the step again, its loose end curling in your palm.',
  },
  {
    zhCN: '你把缠住的彩带理开，旁边的人趁空转了个圈，差点踩到鞋尖。',
    en: 'You untangle a ribbon. Someone beside you takes a turn and nearly steps on your toes.',
  },
];
const lanternResults: Text[] = [
  {
    zhCN: '你提着小灯听完合唱，最后那个音拖长时，灯柄也在手里轻轻晃。',
    en: 'You hold your lantern through the choir’s song. As the last note stretches, its handle sways in your hand.',
  },
  {
    zhCN: '你把小灯放低，给旁边的人留出视线，合唱停时才一起松开围巾。',
    en: 'You lower your lantern so a neighbour can see. When the choir stops, you both loosen your scarves.',
  },
  {
    zhCN: '合唱翻到下一页，你替歌手照亮谱角，小灯在纸上留了团暖光。',
    en: 'As the choir turns the page, you light a corner of the music. Your lantern leaves a warm pool on the paper.',
  },
];
export const celebrationResults: Partial<Record<FestivalId, Text[]>> = {
  'lunar-new-year': dumplingResults,
  'may-day': ribbonResults,
  'christmas-market': lanternResults,
};

function festivalDate(id: FestivalId, year: number): IsoDate {
  if (id === 'lunar-new-year') return firstWeekday(`${year}-01-31`, 6);
  if (id === 'may-day') return firstWeekday(`${year}-04-30`, 1);
  if (id === 'bonfire-night') return `${year}-11-05`;
  const before = id === 'summer-fair' ? `${year}-09-01` : `${year}-12-25`;
  let date = addDays(before, -1);
  while (new Date(date).getUTCDay() !== 6) date = addDays(date, -1);
  return date;
}
export function specialDay(state: GameState): {
  date: IsoDate;
  festival: FestivalId;
} {
  const end = addMonths(state.date, b.monthsPerQuarter);
  const pick = (year: number): FestivalId =>
    state.quarter === 1
      ? 'lunar-new-year'
      : state.quarter === 2
        ? 'may-day'
        : state.quarter === 3
          ? 'summer-fair'
          : year % 2
            ? 'bonfire-night'
            : 'christmas-market';
  for (
    let year = Number(state.date.slice(0, 4));
    year <= Number(end.slice(0, 4));
    year++
  ) {
    const festival = pick(year);
    let date = festivalDate(festival, year);
    if (date < state.date) continue;
    const weekend = firstWeekday(firstWeekday(addDays(state.date, 7), 2), 6);
    while (date <= weekend) date = addDays(date, 7);
    if (date < end) return { date, festival };
  }
  let date = addDays(end, -1);
  while (new Date(date).getUTCDay() !== 6) date = addDays(date, -1);
  return { date, festival: pick(Number(date.slice(0, 4))) };
}

export function noticeDate(date: IsoDate, locale: Locale) {
  const day = new Date(`${date}T00:00:00Z`);
  if (locale === 'zh-CN')
    return `${day.getUTCMonth() + 1}月${day.getUTCDate()}日周${'日一二三四五六'[day.getUTCDay()]}`;
  return `${new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(day)} ${day.getUTCDate()} ${new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(day)}`;
}
