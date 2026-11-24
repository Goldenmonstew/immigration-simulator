import type { RuleMeta } from '@uk-immigration/engine';
import type { SourceRef } from '@uk-immigration/policy-data';
import { ptConditionTitles } from '../i18n/countries/portugal-module';

// The sources and pending details each engine condition cites across its
// branches. A unit test keeps this list in step with evaluatePortugalFull.
const src = (srcId: string, locator: string, url?: string): SourceRef =>
  url ? { srcId, locator, url } : { srcId, locator };

function rule(
  id: keyof typeof ptConditionTitles,
  sources: SourceRef[],
  pendingDetails: string[] = [],
): RuleMeta {
  const [title, titleEn] = ptConditionTitles[id];
  return {
    id,
    title,
    titleEn,
    sources,
    pendingDetails,
    ruleSetId: 'pt.current-law',
  };
}

export const portugalRules: RuleMeta[] = [
  rule('PT-A-STATELESS', [src('SRC-120', 'art. 6(3), (12), p3')], ['PD-384']),
  rule(
    'PT-A-VERSION',
    [src('SRC-120', 'LO 1/2026 arts. 7–8'), src('SRC-121', 'LO 1/2024 art. 9')],
    ['PD-143'],
  ),
  rule('PT-A01', [
    src('SRC-120', 'art. 6(1)(a), pp2, 9–10'),
    src(
      'SRC-487',
      'DL 496/1977 art. 1 (Código Civil art. 130)',
      'https://files.diariodarepublica.pt/1s/1977/11/27301/00010050.pdf',
    ),
  ]),
  rule('PT-A02', [
    src('SRC-120', 'art. 6 n.º 1 b) (p2), n.º 3 (p3)'),
    src('SRC-120', 'art. 15 n.º 3 (p5)'),
    src('SRC-120', 'art. 15 n.º 1–2 (p5, p14)'),
    src('SRC-122', 'fundamentação D.5'),
    src('SRC-121', 'art. 6 n.º 1 b) (p8)'),
    src('SRC-121', 'art. 15 n.º 3–4 (p13)'),
    src('SRC-121', 'art. 15 n.º 1 (p12)'),
    src('SRC-120', 'LO 1/2026 art. 7 n.º 2, art. 8 (p7)'),
    src('SRC-127', 'Regulamentação complementar'),
  ]),
  rule('PT-A02-CURRENT-ALTERNATIVE', [
    src('SRC-120', 'art. 6 n.º 1 b) (p2), n.º 3 (p3)'),
    src('SRC-120', 'art. 15 n.º 3 (p5)'),
    src('SRC-120', 'art. 15 n.º 1–2 (p5, p14)'),
    src('SRC-122', 'fundamentação D.5'),
  ]),
  rule('PT-A03', [src('SRC-120', 'art. 6(1)(c), (10), pp2–3')], ['PD-380']),
  rule('PT-A04', [src('SRC-120', 'art. 6(1)(c), p2')], ['PD-380']),
  rule('PT-A05', [src('SRC-120', 'art. 6(1)(d), p2')], ['PD-380']),
  rule('PT-A06', [src('SRC-120', 'art. 6(1)(e), p2')], ['PD-381']),
  rule(
    'PT-A07',
    [src('SRC-120', 'Lei 37/81 art. 6(1)(f), (14)–(16), pp2–4')],
    ['PD-382'],
  ),
  rule('PT-A08', [src('SRC-120', 'art. 6(1)(g), p2')], ['PD-382']),
  rule('PT-A09', [src('SRC-120', 'art. 6(1)(h), p2')], ['PD-382']),
  rule(
    'PT-A10',
    [
      src('SRC-120', 'art. 6(1)(i), p2'),
      src('SRC-127', '2026-10-29 Conselho de Ministros, n.º 2'),
    ],
    ['PD-383'],
  ),
  rule(
    'PT-A11',
    [
      src('SRC-470', 'arts. 18–19, 25, 27, 37, 44'),
      src('SRC-485', 'art. 26'),
      src('SRC-120', 'art. 6(11)–(12)'),
    ],
    ['PD-382', 'PD-384'],
  ),
  rule(
    'PT-A11-EXAM-FEE',
    [
      src('SRC-120', 'art. 6(1)(c)–(d)'),
      src('SRC-127', '2026-10-29 Conselho de Ministros, n.º 2'),
    ],
    ['PD-380'],
  ),
  rule(
    'PT-A11-FEE',
    [src('SRC-488', 'arts. 2, 19 (RERN art. 18(2.2.1))')],
    ['PD-384'],
  ),
  rule('PT-A12', [
    src('SRC-121', 'art. 6(1)(a), p7'),
    src(
      'SRC-487',
      'DL 496/1977 art. 1 (Código Civil art. 130)',
      'https://files.diariodarepublica.pt/1s/1977/11/27301/00010050.pdf',
    ),
    src('SRC-487', 'Lei 39/2025 arts. 6–8'),
  ]),
  rule(
    'PT-A13',
    [
      src('SRC-121', 'art. 6(1)(c), p8'),
      src('SRC-470', 'RNP art. 25(2), (5)–(9)'),
      src(
        'SRC-480',
        'Portaria 183/2020 art. 9, as amended by Portaria 184/2022',
      ),
      src('SRC-470', 'art. 25(9), p42'),
    ],
    ['PD-380'],
  ),
  rule(
    'PT-A14',
    [src('SRC-121', 'Lei 37/81 arts. 6(1)(d), 9(1)(b), pp8–9')],
    ['PD-382'],
  ),
  rule('PT-A15', [src('SRC-121', 'art. 6(1)(e), p8')], ['PD-382']),
  rule(
    'PT-A15-SUSPENSION',
    [src('SRC-121', 'art. 13(2)–(4), p10')],
    ['PD-382'],
  ),
  rule('PT-B01', [
    src('SRC-123', 'art. 80 n.º 1 a) (p67)'),
    src('SRC-123', 'art. 74 n.º 1 (p65)'),
    src(
      'SRC-126',
      'Autorização de Residência Permanente (art. 80.º)',
      'https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o',
    ),
    src(
      'SRC-126',
      'Esclarecimento: Direito de Residência',
      'https://aima.gov.pt/pt/noticias/direito-de-residencia',
    ),
    src('SRC-125', 'Decreto Regulamentar 84/2007 art. 63.º n.º 14'),
  ]),
  rule('PT-B01-CANCELLATION-RISK', [
    src('SRC-123', 'art. 85 n.º 2 a) (p69)'),
    src(
      'SRC-123',
      'Lei 62/2026 art. 4 (art. 85, p8)',
      'https://files.diariodarepublica.pt/1s/2026/09/17600/0006000111.pdf',
    ),
  ]),
  rule('PT-B01-TITLE', [src('SRC-123', 'arts. 80(1)(a), 85(1)–(2)')]),
  rule(
    'PT-B02',
    [src('SRC-123', 'Lei 23/2007 art. 80(1)(b), p67')],
    ['PD-388'],
  ),
  rule(
    'PT-B02-GENERAL',
    [
      src('SRC-491', 'Lei 53/2023 art. 2 (Lei 23/2007 art. 81(3), p10)'),
      src('SRC-123', 'Lei 62/2026 art. 2 (Lei 23/2007 arts. 81–82)'),
    ],
    ['PD-388'],
  ),
  rule(
    'PT-B03',
    [
      src('SRC-123', 'art. 80(1)(c), p67'),
      src('SRC-473', 'Portaria 1563/2007 art. 2'),
      src('SRC-473', 'Portaria 1563/2007 arts. 8, 11'),
      src('SRC-475', 'Montante / Forma de comprovar'),
    ],
    ['PD-385'],
  ),
  rule(
    'PT-B04',
    [
      src('SRC-123', 'art. 80(1)(d), p67'),
      src('SRC-471', 'DR 84/2007 art. 64(1)(c)'),
    ],
    ['PD-386'],
  ),
  rule(
    'PT-B05',
    [
      src('SRC-123', 'art. 80(1)(e), p67'),
      src('SRC-471', 'DR 84/2007 art. 64(1)(e)'),
      src(
        'SRC-126',
        'Documentos necessários · português básico',
        'https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o',
      ),
      src(
        'SRC-480',
        'Portaria 183/2020 art. 9, as amended by Portaria 184/2022',
      ),
    ],
    ['PD-387'],
  ),
  rule(
    'PT-B06',
    [
      src('SRC-471', 'DR 84/2007 art. 64(1)(a), (d), (4)'),
      src(
        'SRC-126',
        'Documentos para o atendimento',
        'https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o',
      ),
    ],
    ['PD-388'],
  ),
  rule(
    'PT-B07',
    [
      src('SRC-123', 'arts. 76, 85, pp65, 69'),
      src('SRC-471', 'DR 84/2007 arts. 65, 65-K'),
    ],
    ['PD-146', 'PD-394'],
  ),
  rule('PT-B07-ABSENCE', [
    src('SRC-123', 'art. 85 n.º 2 b) (p69)'),
    src('SRC-123', 'art. 76 n.º 1–2 (p65)'),
  ]),
  rule(
    'PT-B07-FEE',
    [
      src('SRC-476', 'III.1(a), (c), (e), (f), p2'),
      src(
        'SRC-477',
        'Portaria 307/2023 art. 3 and SRC-476 effective-date notice',
      ),
      src('SRC-476', 'III.3(a)–(e), (i), pp2–3'),
    ],
    ['PD-398'],
  ),
  rule(
    'PT-B07-REPLACE-DOCUMENTS',
    [
      src('SRC-471', 'DR 84/2007 art. 65'),
      src(
        'SRC-126',
        'Documentos',
        'https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o',
      ),
    ],
    ['PD-394'],
  ),
  rule(
    'PT-C01',
    [
      src('SRC-123', 'art. 126 n.º 1 a) (p101)'),
      src('SRC-123', 'art. 125 n.º 2 a) (p100), art. 126 n.º 3 (p101)'),
      src(
        'SRC-126',
        'Estatuto de residente de longa duração (art. 125.º)',
        'https://aima.gov.pt/pt/viver/aquisicao-do-estatuto-de-residente-de-longa-duracao-erld-art-125-o',
      ),
      src('SRC-123', 'arts. 125, 126(2), (4)–(5), pp100–101'),
      src('SRC-123', 'arts. 121-I, 125–126'),
      src(
        'SRC-491',
        'Lei 53/2023 arts. 2, 10, gazette p24 (Lei 23/2007 arts. 121-I, 121-J)',
      ),
    ],
    ['PD-145', 'PD-147', 'PD-389'],
  ),
  rule(
    'PT-C01-CATEGORY',
    [src('SRC-123', 'art. 125(1)–(2), pp100–101')],
    ['PD-147'],
  ),
  rule('PT-C01-SINGLE-ABSENCE', [src('SRC-123', 'art. 126 n.º 4 (p101)')]),
  rule('PT-C01-TOTAL-ABSENCE', [src('SRC-123', 'art. 126 n.º 4 (p101)')]),
  rule(
    'PT-C02',
    [src('SRC-123', 'art. 127(3), p101; Lei 27/2008 art. 41(1)(a)–(b)')],
    ['PD-147'],
  ),
  rule(
    'PT-C03',
    [
      src(
        'SRC-491',
        'Lei 53/2023 arts. 2, 10, gazette p24 (Lei 23/2007 arts. 121-I, 121-J)',
      ),
    ],
    ['PD-389'],
  ),
  rule(
    'PT-C04',
    [
      src('SRC-123', 'art. 126(1)(b), (6), p101'),
      src('SRC-473', 'Portaria 1563/2007 art. 2'),
      src('SRC-473', 'Portaria 1563/2007 arts. 8, 11'),
      src('SRC-475', 'Montante / Forma de comprovar'),
    ],
    ['PD-385'],
  ),
  rule(
    'PT-C05',
    [
      src('SRC-123', 'art. 126(1)(c), p101'),
      src('SRC-471', 'DR 84/2007 art. 74(1)(d)'),
      src(
        'SRC-126',
        'Documentos necessários',
        'https://aima.gov.pt/pt/viver/aquisicao-do-estatuto-de-residente-de-longa-duracao-erld-art-125-o',
      ),
    ],
    ['PD-390'],
  ),
  rule(
    'PT-C06',
    [
      src('SRC-123', 'art. 126(1)(d), p101'),
      src('SRC-471', 'DR 84/2007 art. 74(1)(c)'),
    ],
    ['PD-386'],
  ),
  rule(
    'PT-C07',
    [
      src('SRC-123', 'art. 126(1)(e), p101'),
      src('SRC-471', 'DR 84/2007 art. 74(1)(g)'),
      src(
        'SRC-126',
        'Documentos necessários · português básico',
        'https://aima.gov.pt/pt/viver/aquisicao-do-estatuto-de-residente-de-longa-duracao-erld-art-125-o',
      ),
      src(
        'SRC-480',
        'Portaria 183/2020 art. 9, as amended by Portaria 184/2022',
      ),
    ],
    ['PD-387'],
  ),
  rule('PT-C08', [src('SRC-123', 'art. 127(1)–(2), p101')], ['PD-388']),
  rule(
    'PT-C09',
    [
      src('SRC-123', 'arts. 129(2)–(4), 130, p102'),
      src('SRC-471', 'DR 84/2007 art. 74'),
    ],
    ['PD-389'],
  ),
  rule(
    'PT-C09-FEE',
    [
      src('SRC-476', 'VI.1(a)–(f), p4'),
      src(
        'SRC-477',
        'Portaria 307/2023 art. 3 and SRC-476 effective-date notice',
      ),
    ],
    ['PD-398'],
  ),
  rule(
    'PT-C10',
    [
      src('SRC-123', 'arts. 129(9), 130(2), 131(1)–(6), pp102–103'),
      src(
        'SRC-491',
        'Lei 53/2023 arts. 2, 10, gazette p24 (Lei 23/2007 arts. 121-I, 121-J)',
      ),
      src('SRC-123', 'art. 131(4)–(5), p104'),
      src('SRC-123', 'Lei 23/2007 art. 131(4)–(5), p104'),
    ],
    ['PD-147', 'PD-389'],
  ),
  rule('PT-C10-PILOT-ABSENCE', [
    src('SRC-123', 'art. 131 n.º 1 c) (p103)'),
    src('SRC-123', 'art. 131 n.º 1 e) (p103)'),
    src(
      'SRC-123',
      'art. 129 n.º 9 (p102), art. 130 n.º 2 (p102), art. 131 n.º 6 (p103)',
    ),
  ]),
  rule(
    'PT-D-FEE',
    [
      src('SRC-476', 'III.3(a)–(e), (i), pp2–3'),
      src(
        'SRC-477',
        'Portaria 307/2023 art. 3 and SRC-476 effective-date notice',
      ),
    ],
    ['PD-398'],
  ),
  rule(
    'PT-D01',
    [
      src('SRC-123', 'Lei 23/2007 art. 90-A(1)(b)–(c), p72'),
      src('SRC-123', 'arts. 4(2)(a), 77(1)(b)–(c), 90-A(1)(a)–(c)'),
      src('SRC-126', 'Documentos e requisitos gerais'),
      src(
        'SRC-123',
        'Lei 61/2025 art. 2 (Lei 23/2007 arts. 98(1), (3)(c), 99, 103(2)), pp4–6',
      ),
      src('SRC-123', 'Lei 18/2022 annex art. 103(1), (3), p81'),
      src('SRC-126', 'Reagrupamento Familiar · fora/em Território Nacional'),
      src('SRC-481', 'FAQ 11'),
    ],
    ['PD-391', 'PD-392'],
  ),
  rule(
    'PT-D02',
    [
      src('SRC-123', 'arts. 77(1)(d)–(f), 90-A(1)(a), pp65–66, 72'),
      src('SRC-473', 'Portaria 1563/2007 art. 2'),
      src(
        'SRC-473',
        'Portaria 1563/2007 arts. 5(1)–(6), 7; reductions apply to the specified categories',
      ),
      src('SRC-475', 'Montante / Forma de comprovar'),
    ],
    ['PD-385'],
  ),
  rule(
    'PT-D02-HOUSING',
    [src('SRC-123', 'arts. 77(1)(e), 78(2)(b)'), src('SRC-481', 'FAQ 12, 23')],
    ['PD-386'],
  ),
  rule('PT-D02-SOCIAL', [src('SRC-123', 'art. 77(1)(f), p65')], ['PD-385']),
  rule(
    'PT-D03',
    [
      src('SRC-123', 'Lei 23/2007 art. 77(1)(g), pp65–66'),
      src('SRC-123', 'art. 77(1)(g)–(j), (2)–(7)'),
      src(
        'SRC-123',
        'Lei 56/2023 arts. 42–44, 55',
        'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
      ),
      src('SRC-491', 'Lei 53/2023 art. 2 (Lei 23/2007 art. 81(3), p10)'),
    ],
    ['PD-388', 'PD-391'],
  ),
  rule(
    'PT-D03-GENERAL',
    [
      src('SRC-491', 'Lei 53/2023 art. 2 (Lei 23/2007 art. 81(3), p10)'),
      src('SRC-123', 'Lei 62/2026 art. 2 (Lei 23/2007 arts. 81–82)'),
    ],
    ['PD-388'],
  ),
  rule(
    'PT-D04',
    [
      src('SRC-126', 'ARI · Documentos e requisitos gerais'),
      src('SRC-471', 'DR 84/2007 arts. 65-D/E'),
      src('SRC-472', 'DR 4/2022 arts. 65-A, 65-D/E'),
      src('SRC-481', 'FAQ 11–13, 23'),
    ],
    ['PD-392'],
  ),
  rule(
    'PT-D04-HEALTH',
    [
      src('SRC-471', 'DR 84/2007 arts. 65-D/E'),
      src('SRC-126', 'Documentos e requisitos gerais'),
      src('SRC-481', 'FAQ 11, 23'),
    ],
    ['PD-390'],
  ),
  rule(
    'PT-D05',
    [
      src(
        'SRC-123',
        'Lei 56/2023 arts. 42–44, 55',
        'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
      ),
      src('SRC-471', 'DR 84/2007 arts. 65-A, 65-D'),
    ],
    ['PD-393', 'PD-394'],
  ),
  rule(
    'PT-D06',
    [
      src(
        'SRC-123',
        'Lei 56/2023 arts. 42–44, 55',
        'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
      ),
    ],
    ['PD-393', 'PD-394'],
  ),
  rule(
    'PT-D06A',
    [
      src('SRC-123', 'Lei 23/2007 art. 3(1)(d)(ii), p27'),
      src(
        'SRC-123',
        'Lei 56/2023 art. 44 (Lei 23/2007 art. 3(2)–(3))',
        'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
      ),
      src('SRC-471', 'DR 84/2007 arts. 65-A, 65-D'),
      src('SRC-490', 'Portaria 208/2017 arts. 1–2 and annex'),
    ],
    ['PD-393'],
  ),
  rule(
    'PT-D06B',
    [
      src('SRC-123', 'Lei 23/2007 art. 3(1)(d)(v), p27'),
      src(
        'SRC-123',
        'Lei 56/2023 art. 44 (Lei 23/2007 art. 3(2)–(3))',
        'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
      ),
      src('SRC-471', 'DR 84/2007 arts. 65-A, 65-D'),
      src('SRC-490', 'Portaria 208/2017 arts. 1–2 and annex'),
    ],
    ['PD-393'],
  ),
  rule(
    'PT-D06C',
    [
      src('SRC-123', 'Lei 23/2007 art. 3(1)(d)(vi), p27'),
      src(
        'SRC-123',
        'Lei 56/2023 art. 44 (Lei 23/2007 art. 3(2)–(3))',
        'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
      ),
      src('SRC-471', 'DR 84/2007 arts. 65-A, 65-D'),
      src('SRC-490', 'Portaria 208/2017 arts. 1–2 and annex'),
    ],
    ['PD-393'],
  ),
  rule(
    'PT-D06D',
    [
      src(
        'SRC-123',
        'Lei 56/2023 art. 44 (Lei 23/2007 art. 3(1)(d)(vii))',
        'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
      ),
      src('SRC-471', 'DR 84/2007 art. 65-D(9)'),
    ],
    ['PD-393'],
  ),
  rule(
    'PT-D06E',
    [
      src(
        'SRC-123',
        'Lei 56/2023 art. 44 (Lei 23/2007 art. 3(1)(d)(viii))',
        'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
      ),
      src('SRC-471', 'DR 84/2007 art. 65-D(10)'),
    ],
    ['PD-393'],
  ),
  rule(
    'PT-D07',
    [
      src('SRC-123', 'art. 3 n.º 1 d) (p27)'),
      src('SRC-124', 'art. 65-B (p3)'),
      src('SRC-471', 'DR 84/2007 art. 65-E'),
      src('SRC-481', 'FAQ 23–28'),
    ],
    ['PD-394'],
  ),
  rule('PT-D07-STAY', [
    src('SRC-124', 'art. 65-C a) (p3)'),
    src('SRC-124', 'art. 65-C b) (p3)'),
    src(
      'SRC-126',
      'Perguntas frequentes ARI, n.º 24',
      'https://aima.gov.pt/pt/a-aima/perguntas-frequentes-faqs/autorizacao-de-residencia-para-investimento-ari',
    ),
  ]),
  rule('PT-D07-WINDOW', [
    src('SRC-123', 'art. 78 n.º 1 (p66)'),
    src(
      'SRC-123',
      'Lei 62/2026 art. 4 (art. 78, p7)',
      'https://files.diariodarepublica.pt/1s/2026/09/17600/0006000111.pdf',
    ),
    src('SRC-125', 'Decreto Regulamentar 84/2007 art. 63.º n.º 16'),
    src('SRC-123', 'art. 90-A n.º 2 (p72)'),
  ]),
  rule(
    'PT-D08',
    [
      src('SRC-123', 'arts. 78, 81, 98, 90-A(2)'),
      src('SRC-471', 'DR 84/2007 art. 65-E'),
      src('SRC-481', 'FAQ 11–12, 23–25'),
    ],
    ['PD-392', 'PD-395'],
  ),
  rule(
    'PT-D08-CRIME',
    [
      src('SRC-123', 'Lei 23/2007 art. 78(2)(d), p66'),
      src('SRC-123', 'arts. 77(3), 78(2)(d), (3)–(5), 79, pp66–67'),
    ],
    ['PD-388'],
  ),
  rule(
    'PT-D08-GENERAL',
    [
      src('SRC-491', 'Lei 53/2023 art. 2 (Lei 23/2007 art. 81(3), p10)'),
      src('SRC-123', 'Lei 62/2026 art. 2 (Lei 23/2007 arts. 81–82)'),
    ],
    ['PD-388'],
  ),
  rule(
    'PT-D09',
    [
      src(
        'SRC-123',
        'Lei 56/2023 arts. 42–44, 55',
        'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
      ),
      src('SRC-471', 'DR 1/2024 art. 5(5)–(8)'),
      src('SRC-486', 'DL 37-A/2024 art. 3'),
      src('SRC-123', 'Lei 18/2022 annex art. 3(1)(d)(i), (iii), (iv), p27'),
    ],
    ['PD-394'],
  ),
  rule('PT-D10', [
    src('SRC-471', 'DR 84/2007 art. 65-K'),
    src('SRC-123', 'art. 80, p67'),
    src(
      'SRC-123',
      'Lei 56/2023 arts. 42–44, 55',
      'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf',
    ),
    src('SRC-481', 'FAQ 28–29'),
  ]),
  rule(
    'PT-D10-TERMS',
    [src('SRC-471', 'DR 84/2007 art. 65-K'), src('SRC-481', 'FAQ 26–29')],
    ['PD-394'],
  ),
  rule(
    'PT-E01',
    [
      src('SRC-123', 'arts. 75, 78(1), (7), 79, 81-A, pp65–69'),
      src('SRC-123', 'art. 78 n.º 1 (p66)'),
      src(
        'SRC-123',
        'Lei 62/2026 art. 4 (art. 78, p7)',
        'https://files.diariodarepublica.pt/1s/2026/09/17600/0006000111.pdf',
      ),
      src(
        'SRC-472',
        'DR 9/2018 art. 2 (DR 84/2007 art. 63(16))',
        'https://files.diariodarepublica.pt/1s/2018/09/17500/0471804757.pdf',
      ),
    ],
    ['PD-145', 'PD-149'],
  ),
  rule('PT-E01-RECEIPT', [src('SRC-123', 'Lei 23/2007 art. 78(7), p67')]),
  rule('PT-E01-RELEASE', [src('SRC-123', 'Lei 23/2007 art. 79(2), p67')]),
  rule(
    'PT-E02',
    [
      src('SRC-123', 'art. 78(2)(a), p66'),
      src('SRC-473', 'Portaria 1563/2007 art. 2'),
      src(
        'SRC-473',
        'Portaria 1563/2007 arts. 5(1)–(6), 7; reductions apply to the specified categories',
      ),
      src('SRC-475', 'Montante / Forma de comprovar'),
    ],
    ['PD-385', 'PD-395'],
  ),
  rule(
    'PT-E03',
    [
      src('SRC-123', 'art. 78(2)(b), p66'),
      src('SRC-471', 'DR 84/2007 art. 63(1)(c)'),
    ],
    ['PD-386'],
  ),
  rule(
    'PT-E04',
    [
      src('SRC-123', 'art. 78(2)(c), p66'),
      src('SRC-471', 'DR 84/2007 art. 63(3)–(4)'),
    ],
    ['PD-395'],
  ),
  rule(
    'PT-E05',
    [
      src('SRC-123', 'Lei 23/2007 art. 78(2)(d), p66'),
      src('SRC-123', 'arts. 77(3), 78(2)(d), (3)–(5), 79, pp66–67'),
    ],
    ['PD-388'],
  ),
  rule(
    'PT-E05-GENERAL',
    [
      src('SRC-491', 'Lei 53/2023 art. 2 (Lei 23/2007 art. 81(3), p10)'),
      src('SRC-123', 'Lei 62/2026 art. 2 (Lei 23/2007 arts. 81–82)'),
    ],
    ['PD-388'],
  ),
  rule(
    'PT-E06',
    [
      src('SRC-123', 'arts. 78(2), 91(1)(d)'),
      src('SRC-471', 'DR 84/2007 art. 63(1)–(11), (15)'),
    ],
    ['PD-395'],
  ),
  rule(
    'PT-E06-DOCUMENTS',
    [src('SRC-471', 'DR 84/2007 art. 63(1), (15)')],
    ['PD-395'],
  ),
  rule(
    'PT-E06-STUDY-HEALTH',
    [src('SRC-471', 'DR 84/2007 art. 63'), src('SRC-123', 'art. 91(1)(d)')],
    ['PD-390'],
  ),
  rule(
    'PT-E07',
    [
      src('SRC-476', 'III.1(a), (c), (e), (f), p2'),
      src(
        'SRC-477',
        'Portaria 307/2023 art. 3 and SRC-476 effective-date notice',
      ),
    ],
    ['PD-398'],
  ),
  rule(
    'PT-F01',
    [
      src('SRC-478', 'arts. 1(2), 2(e), 3, 10(1)–(2)'),
      src('SRC-478', 'Lei 37/2006 art. 2(e)(iii), p5717'),
      src('SRC-484', 'Quem pode requerer'),
      src('SRC-494', 'ss. 2.2.2.3–2.2.2.4, pp13–15'),
    ],
    ['PD-396'],
  ),
  rule(
    'PT-F02',
    [
      src('SRC-478', 'Lei 37/2006 arts. 10(1)–(2), 13, pp5719–5720'),
      src('SRC-478', 'Lei 37/2006 art. 10(4)–(5), p5719'),
      src('SRC-478', 'art. 10(7)'),
      src('SRC-493', 'C-244/13, paras. 36–38, 47 and operative part (1)'),
      src('SRC-494', 'ss. 2.2.2.1, 9.1–9.2 and n. 236'),
    ],
    ['PD-396'],
  ),
  rule(
    'PT-F02-EARLY-CONTINUITY',
    [
      src('SRC-478', 'arts. 10(4), (7), 11(1), (4), (6), pp5719–5720'),
      src('SRC-494', 's. 9.2 and n. 236, pp45–46'),
      src('SRC-478', 'art. 10(7), p5719'),
    ],
    ['PD-396'],
  ),
  rule('PT-F02-RETENTION', [
    src('SRC-478', 'Lei 37/2006 art. 10(4)–(5), p5719'),
    src('SRC-478', 'Lei 37/2006 art. 17(4), p5721'),
  ]),
  rule(
    'PT-F03',
    [src('SRC-478', 'arts. 2(f), 3(2)–(3), 6–9, pp5717–5719')],
    ['PD-397'],
  ),
  rule(
    'PT-F04',
    [src('SRC-478', 'arts. 8–9, 13, pp5718–5720')],
    ['PD-396', 'PD-397'],
  ),
  rule(
    'PT-F05',
    [
      src('SRC-478', 'Lei 37/2006 art. 11(1), (4)–(6), pp5719–5720'),
      src('SRC-495', 'C-32/19, paras. 38–39, 44'),
    ],
    ['PD-396', 'PD-397'],
  ),
  rule(
    'PT-F06',
    [src('SRC-478', 'Lei 37/2006 art. 12(2)(a), p5720')],
    ['PD-396'],
  ),
  rule(
    'PT-F07',
    [
      src('SRC-478', 'Lei 37/2006 arts. 6, 14(1), 15(1)–(2), pp5718–5720'),
      src('SRC-478', 'arts. 16–17, 21'),
      src('SRC-485', 'DL 41/2023 art. 25'),
      src('SRC-484', 'Quem pode requerer / Documentos necessários'),
    ],
    ['PD-396'],
  ),
  rule(
    'PT-F08',
    [
      src('SRC-478', 'arts. 22–24, pp5721–5722'),
      src('SRC-478', 'Lei 37/2006 art. 24(3), p5722'),
    ],
    ['PD-396'],
  ),
  rule(
    'PT-F09',
    [
      src('SRC-478', 'art. 29, p5723'),
      src(
        'SRC-479',
        'Portaria 13/2024 art. 2 and Declaração de Retificação 32/2024',
      ),
    ],
    ['PD-398'],
  ),
  rule(
    'PT-G-VERSION',
    [src('SRC-120', 'LO 1/2026 arts. 7–8'), src('SRC-121', 'LO 1/2024 art. 9')],
    ['PD-143'],
  ),
  rule(
    'PT-G01',
    [
      src('SRC-120', 'art. 3(1)–(2)'),
      src('SRC-470', 'art. 14'),
      src('SRC-121', 'art. 3(1)–(2)'),
    ],
    ['PD-399'],
  ),
  rule(
    'PT-G02',
    [src('SRC-120', 'art. 3(3)'), src('SRC-470', 'art. 14')],
    ['PD-399'],
  ),
  rule(
    'PT-G03-CRIME',
    [
      src('SRC-120', 'arts. 3(4), 6(1)(f), (14)–(16)'),
      src('SRC-121', 'art. 9(1)(b), (4), p9'),
    ],
    ['PD-382'],
  ),
  rule(
    'PT-G03-SANCTIONS',
    [src('SRC-120', 'arts. 3(4), 6(1)(h)'), src('SRC-121', 'art. 13(2)–(4)')],
    ['PD-382'],
  ),
  rule(
    'PT-G03-SECURITY',
    [src('SRC-120', 'arts. 3(4), 6(1)(g)'), src('SRC-121', 'art. 9(1)(d)')],
    ['PD-382'],
  ),
  rule(
    'PT-G04',
    [
      src('SRC-120', 'arts. 9(1)(a), (2), 10(1)'),
      src('SRC-470', 'art. 56'),
      src('SRC-121', 'arts. 9(1)(a), (2)–(3), 10(1)'),
    ],
    ['PD-399'],
  ),
  rule(
    'PT-G05',
    [src('SRC-120', 'art. 9(1)(c), (2)'), src('SRC-121', 'art. 9(1)(c), (2)')],
    ['PD-399'],
  ),
  rule(
    'PT-G06',
    [src('SRC-470', 'arts. 14, 44'), src('SRC-483', 'Documentos necessários')],
    ['PD-399'],
  ),
  rule('PT-G06-FEE', [src('SRC-488', 'arts. 2, 19 (RERN art. 18(2.2.1))')]),
  rule(
    'PT-G06-PARTNER-STATEMENT',
    [src('SRC-483', 'Documentos necessários · união de facto')],
    ['PD-399'],
  ),
];
