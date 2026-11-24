import type { RuleMeta } from '@uk-immigration/engine';
import { spainFull2026_11, type SourceRef } from '@uk-immigration/policy-data';
import { spainConditionTitles } from '../i18n/countries/spain-module';

const ref = (srcId: string, locator: string, url?: string): SourceRef => ({
  srcId,
  locator,
  ...(url ? { url } : {}),
});

function rule(
  id: keyof typeof spainConditionTitles,
  sources: readonly SourceRef[],
  pendingDetails: string[] = [],
): RuleMeta {
  const [title, titleEn] = spainConditionTitles[id];
  return {
    id,
    title,
    titleEn,
    sources: [...sources],
    pendingDetails,
    ruleSetId: spainFull2026_11.ruleSetId,
  };
}

export const spainRules: RuleMeta[] = [
  rule(
    'ES-N01',
    [
      ref('SRC-084', 'art. 22.1–3'),
      ref('SRC-085', 'Adquisición de la nacionalidad'),
      ref('SRC-339', 'AN, estancia por estudios'),
    ],
    ['PD-098', 'PD-099', 'PD-100'],
  ),
  rule('ES-N02', [
    ref('SRC-084', 'art. 22.1'),
    ref('SRC-322', 'Orden JUS/1625/2016 anexo §2.h'),
  ]),
  rule(
    'ES-N03',
    [
      ref('SRC-084', 'art. 22.1'),
      ref('SRC-322', 'Orden JUS/1625/2016 art. 10.2, anexo §2.g'),
    ],
    ['PD-280'],
  ),
  rule(
    'ES-N04',
    [
      ref('SRC-084', 'arts. 20, 22.2.a–b'),
      ref('SRC-322', 'Orden JUS/1625/2016 anexo §2.a–b'),
    ],
    ['PD-280'],
  ),
  rule('ES-N05', [
    ref('SRC-084', 'art. 22.2.c'),
    ref('SRC-322', 'Orden JUS/1625/2016 anexo §2.c'),
    ref('SRC-342', 'Ley 8/2021 art. 2.6'),
  ]),
  rule(
    'ES-N06',
    [
      ref('SRC-084', 'art. 22.2.d'),
      ref('SRC-322', 'Orden JUS/1625/2016 anexo §2.d'),
    ],
    ['PD-281'],
  ),
  rule('ES-N07', [
    ref('SRC-084', 'art. 22.2.e'),
    ref('SRC-322', 'Orden JUS/1625/2016 anexo §2.e'),
  ]),
  rule('ES-N08', [
    ref('SRC-084', 'art. 22.2.f'),
    ref('SRC-322', 'Orden JUS/1625/2016 anexo §2.f'),
  ]),
  rule('ES-N-ONE-YEAR', [ref('SRC-084', 'art. 22.2.a–f')], ['PD-280']),
  rule(
    'ES-N09',
    [
      ref('SRC-084', 'arts. 20.2, 21.3'),
      ref('SRC-321', 'arts. 4–5'),
      ref('SRC-323', 'Nota Ley 8/2021, menores p1'),
      ref('SRC-342', 'Ley 8/2021 art. 2.4–5'),
    ],
    ['PD-282'],
  ),
  rule('ES-N10-RECORDS', [
    ref('SRC-321', 'arts. 5.3, 8–9'),
    ref('SRC-322', 'Orden JUS/1625/2016 arts. 7–8, anexo §§1–3'),
  ]),
  rule(
    'ES-N10',
    [ref('SRC-084', 'arts. 21.2, 22.4'), ref('SRC-321', 'arts. 8, 11')],
    ['PD-283'],
  ),
  rule('ES-N11', [
    ref('SRC-321', 'art. 6.1, 6.5, DA 4'),
    ref('SRC-322', 'Orden JUS/1625/2016 art. 10.2–6'),
  ]),
  rule(
    'ES-N12',
    [
      ref('SRC-321', 'art. 6.1, 6.3–4'),
      ref('SRC-322', 'Orden JUS/1625/2016 art. 10.4'),
      ref('SRC-335', 'Guía para la prueba CCSE §5'),
    ],
    ['PD-284'],
  ),
  rule(
    'ES-N13',
    [
      ref('SRC-084', 'art. 22.4'),
      ref('SRC-322', 'Orden JUS/1625/2016 art. 10.5–6'),
      ref('SRC-341', 'LO 2/2006 art. 4.2; RD 157/2022 art. 5.1–2'),
    ],
    ['PD-282'],
  ),
  rule('ES-N14', [
    ref('SRC-321', 'art. 5.1.a–f'),
    ref('SRC-322', 'Orden JUS/1625/2016 anexo §§1–4'),
    ref('SRC-323', 'Información Nacionalidad, Documentos'),
  ]),
  rule('ES-N15', [
    ref('SRC-321', 'DA 1'),
    ref('SRC-322', 'Orden JUS/1625/2016 art. 6'),
    ref('SRC-323', 'Nueva tasa desde el 1 de enero de 2022'),
    ref('SRC-334', 'DF 7.4'),
  ]),
  rule('ES-N16', [
    ref('SRC-335', 'Precio de la prueba CCSE'),
    ref('SRC-336', 'DELE 2026 p4 España/A2'),
  ]),
  rule(
    'ES-N17',
    [
      ref('SRC-084', 'arts. 15.1, 21.4, 23, 24.1'),
      ref('SRC-321', 'arts. 9, 12–13'),
      ref('SRC-343', 'Ley 20/2011 art. 68.3'),
      ref('SRC-346', 'Convenio art. 1; Instrucción de 31-03-2022 §2'),
    ],
    ['PD-282', 'PD-284'],
  ),
  rule('ES-N18', [
    ref('SRC-084', 'art. 23.c'),
    ref('SRC-321', 'arts. 12.2, 13.1'),
    ref('SRC-342', 'STS 15-07-2024, fallo'),
  ]),
  rule('ES-L-BASIS', [
    ref('SRC-083', 'arts. 182, 183.1–3, 184.2'),
    ref('SRC-320', 'arts. 30 bis, 32.2, 33'),
  ]),
  rule(
    'ES-L01',
    [
      ref('SRC-083', 'arts. 182, 183.1–2, 184.2'),
      ref('SRC-320', 'arts. 30 bis, 32.2, 33'),
    ],
    ['PD-097', 'PD-099', 'PD-285'],
  ),
  rule(
    'ES-L01-PERMIT',
    [
      ref('SRC-083', 'arts. 182, 183.1–2, 184.2'),
      ref('SRC-320', 'arts. 30 bis, 32.2, 33'),
    ],
    ['PD-099', 'PD-285'],
  ),
  rule('ES-L01-SINGLE', [ref('SRC-083', 'art. 183.2')], ['PD-097']),
  rule('ES-L01-TOTAL', [ref('SRC-083', 'art. 183.2')], ['PD-097']),
  rule('ES-L02', [ref('SRC-083', 'art. 183.2')], ['PD-285']),
  rule('ES-L03', [ref('SRC-083', 'arts. 183.3.a, 184.4')]),
  rule('ES-L04', [ref('SRC-083', 'arts. 183.3.b, 184.4')], ['PD-286']),
  rule(
    'ES-L05',
    [ref('SRC-083', 'arts. 183.3.c, 184.3.d'), ref('SRC-084', 'art. 240')],
    ['PD-287'],
  ),
  rule('ES-L06', [ref('SRC-083', 'arts. 183.3.d, 184.3.d')]),
  rule(
    'ES-L07',
    [ref('SRC-083', 'arts. 183.3.e, 184.3.d'), ref('SRC-084', 'art. 240')],
    ['PD-287'],
  ),
  rule('ES-L08', [
    ref('SRC-083', 'arts. 183.3.f, 184.3.d'),
    ref('SRC-320', 'art. 32.3 bis'),
  ]),
  rule('ES-L09', [ref('SRC-083', 'arts. 183.3.g, 184.1')]),
  rule('ES-L10', [
    ref('SRC-320', 'arts. 1.3, 32'),
    ref('SRC-085', 'Hoja 49, requisitos'),
  ]),
  rule(
    'ES-L11',
    [
      ref('SRC-083', 'art. 184.1–3.a'),
      ref('SRC-090', 'art. 30.2, 30.4–6'),
    ],
    ['PD-285'],
  ),
  rule(
    'ES-L12',
    [ref('SRC-083', 'art. 184.4–5'), ref('SRC-085', 'Hoja 49, salud pública')],
    ['PD-283'],
  ),
  rule('ES-L12-CERT', [ref('SRC-083', 'art. 184.3.e')], ['PD-283']),
  rule(
    'ES-L13',
    [
      ref('SRC-083', 'art. 184.3.c, 184.4'),
      ref('SRC-090', 'art. 30.4–5'),
      ref('SRC-341', 'LO 2/2006 art. 4.2; RD 157/2022 art. 5.1–2'),
    ],
    ['PD-288'],
  ),
  rule('ES-L14', [
    ref('SRC-320', 'art. 47'),
    ref('SRC-324', 'Hoja 50, Procedimiento: tasa'),
    ref('SRC-325', 'anexo 2.6'),
  ]),
  rule(
    'ES-E-TIME',
    [ref('SRC-083', 'art. 176.a')],
    ['PD-097', 'PD-099', 'PD-285', 'PD-289'],
  ),
  rule(
    'ES-E01',
    [
      ref('SRC-083', 'art. 176.a'),
      ref('SRC-324', 'Hoja 50, requisitos'),
      ref('SRC-331', 'Directiva 2003/109/CE arts. 3–4'),
    ],
    ['PD-097', 'PD-099', 'PD-285', 'PD-289'],
  ),
  rule('ES-E01-SCOPE', [
    ref('SRC-320', 'arts. 1.3, 32'),
    ref('SRC-324', 'Hoja 50, requisitos'),
  ]),
  rule(
    'ES-E02',
    [
      ref('SRC-083', 'art. 176.a'),
      ref('SRC-324', 'Hoja 50, requisitos: estudios'),
    ],
    ['PD-285'],
  ),
  rule(
    'ES-E03',
    [
      ref('SRC-083', 'art. 176.a.1–2'),
      ref('SRC-332', 'art. 71 bis.4'),
    ],
    ['PD-285', 'PD-289'],
  ),
  rule(
    'ES-E04',
    [
      ref('SRC-083', 'art. 176.a, final paragraph'),
      ref('SRC-324', 'Hoja 50, protección internacional'),
    ],
    ['PD-289'],
  ),
  rule(
    'ES-E05',
    [
      ref('SRC-083', 'arts. 176.b, 67.1'),
      ref('SRC-324', 'Hoja 50, requisitos: recursos'),
      ref('SRC-326', 'Ley 31/2022 DA 90.a–c'),
      ref('SRC-337', 'Ley 19/2021 art. 13.2; RDL 3/2026 art. 2.5'),
    ],
    ['PD-290'],
  ),
  rule(
    'ES-E06',
    [
      ref('SRC-083', 'arts. 176.c, 177.3.e'),
      ref('SRC-324', 'Hoja 50, requisitos: seguro de enfermedad'),
    ],
    ['PD-291'],
  ),
  rule(
    'ES-E07',
    [
      ref('SRC-083', 'art. 177.1–3.a'),
      ref('SRC-090', 'art. 30.2, 30.4–6'),
    ],
    ['PD-285'],
  ),
  rule(
    'ES-E08',
    [ref('SRC-083', 'art. 177.4–5'), ref('SRC-324', 'Hoja 50, salud pública')],
    ['PD-283'],
  ),
  rule('ES-E08-CERT', [ref('SRC-083', 'art. 177.3.f')], ['PD-283']),
  rule('ES-E09', [
    ref('SRC-320', 'art. 47'),
    ref('SRC-324', 'Hoja 50, Procedimiento: tasa'),
    ref('SRC-325', 'anexo 2.6'),
  ]),
  rule(
    'ES-M01',
    [
      ref('SRC-083', 'art. 179.1–3'),
      ref('SRC-090', 'art. 30.2, 30.4–6'),
      ref('SRC-320', 'art. 32.3'),
      ref('SRC-345', 'Hoja 51, requisitos y documentación exigible'),
    ],
    ['PD-099'],
  ),
  rule(
    'ES-M02',
    [
      ref('SRC-083', 'arts. 61–62, 179.3.d.1º'),
      ref('SRC-326', 'Ley 31/2022 DA 90.a–c'),
      ref('SRC-345', 'Hoja 51, requisitos y documentación exigible'),
    ],
    ['PD-292'],
  ),
  rule(
    'ES-M03',
    [ref('SRC-083', 'arts. 179.3.d.1, 61.2.b')],
    ['PD-291'],
  ),
  rule(
    'ES-M04',
    [
      ref('SRC-083', 'arts. 74.1.b–c,f, 179.3.d.2º'),
      ref('SRC-340', 'RD 126/2026 art. 3.1; RDL 2/2015 arts. 6–7'),
    ],
    ['PD-293'],
  ),
  rule(
    'ES-M05',
    [
      ref('SRC-083', 'arts. 74.1.d–e, 76, 179.3.d.2º'),
      ref('SRC-340', 'RD 126/2026 art. 1'),
      ref('SRC-345', 'Hoja 51, requisitos y documentación exigible'),
    ],
    ['PD-293'],
  ),
  rule(
    'ES-M06',
    [
      ref('SRC-083', 'arts. 84.a–c, 179.3.d.2º'),
      ref('SRC-345', 'Hoja 51, requisitos y documentación exigible'),
    ],
    ['PD-293'],
  ),
  rule(
    'ES-M07',
    [
      ref('SRC-083', 'arts. 88.a–i, 89.2, 179.3.d.2º'),
      ref('SRC-320', 'art. 41.1'),
      ref('SRC-345', 'Hoja 51, requisitos y documentación exigible'),
    ],
    ['PD-293'],
  ),
  rule(
    'ES-M08',
    [
      ref('SRC-083', 'arts. 61.2.c–e, 74.1.g–i, 84.d–f, 89.2.b–d'),
      ref('SRC-331', 'Directive 2003/109/CE arts. 17–18'),
      ref('SRC-345', 'Hoja 51, requisitos y documentación exigible'),
    ],
    ['PD-293'],
  ),
  rule('ES-M09', [ref('SRC-083', 'art. 179.4–7')], ['PD-293']),
  rule(
    'ES-M09-card',
    [ref('SRC-083', 'art. 179.4–7'), ref('SRC-090', 'art. 30.2, 30.4–6')],
    ['PD-099'],
  ),
  rule('ES-M10', [
    ref('SRC-320', 'art. 47'),
    ref('SRC-324', 'Hoja 50, Procedimiento: tasa'),
    ref('SRC-325', 'anexo 2.6'),
  ]),
  rule(
    'ES-M10-work-fee',
    [ref('SRC-320', 'arts. 45–47'), ref('SRC-325', 'anexo 3')],
    ['PD-293'],
  ),
  rule('ES-M11', [ref('SRC-083', 'art. 181.1–3')]),
  rule(
    'ES-F01',
    [
      ref('SRC-083', 'art. 180.1–4'),
      ref('SRC-090', 'art. 30.2, 30.4–6'),
      ref('SRC-345', 'Hoja 52, requisitos y documentación a aportar'),
    ],
    ['PD-099'],
  ),
  rule('ES-F01-grant', [ref('SRC-083', 'art. 180.4')]),
  rule(
    'ES-F02',
    [
      ref('SRC-083', 'arts. 66.1.c, 180.1'),
      ref('SRC-320', 'art. 17.1.b–d'),
      ref('SRC-345', 'Hoja 52, requisitos y documentación a aportar'),
    ],
    ['PD-294'],
  ),
  rule(
    'ES-F03',
    [
      ref('SRC-083', 'arts. 180.3.d, 67.1'),
      ref('SRC-326', 'Ley 31/2022 DA 90.a–c'),
      ref('SRC-337', 'Ley 19/2021 art. 13.2; RDL 3/2026 art. 2.5'),
      ref('SRC-345', 'Hoja 52, medios económicos'),
    ],
    ['PD-290'],
  ),
  rule(
    'ES-F04',
    [
      ref('SRC-083', 'arts. 179.3.d.1º, 180.3.e'),
      ref('SRC-345', 'Hoja 52, requisitos y documentación a aportar'),
    ],
    ['PD-291'],
  ),
  rule('ES-F05', [
    ref('SRC-320', 'art. 47'),
    ref('SRC-324', 'Hoja 50, Procedimiento: tasa'),
    ref('SRC-325', 'anexo 2.6'),
  ]),
  rule('ES-F05-effective', [ref('SRC-083', 'art. 180.4–8')]),
  rule(
    'ES-F05-effective-card',
    [ref('SRC-083', 'art. 180.4–8'), ref('SRC-090', 'art. 30.2, 30.4–6')],
    ['PD-099', 'PD-294'],
  ),
  rule(
    'ES-F05-card-fee',
    [ref('SRC-083', 'art. 180.4–8'), ref('SRC-325', 'anexo 4.2, 4.3, 4.7')],
    ['PD-294'],
  ),
  rule(
    'ES-R01',
    [ref('SRC-083', 'arts. 186.1, 188.1, 201.1.c–d, 201.2')],
    ['PD-295'],
  ),
  rule('ES-R02', [ref('SRC-083', 'arts. 186.2, 188.2')]),
  rule('ES-R03', [ref('SRC-083', 'art. 189.4')]),
  rule(
    'ES-R04',
    [ref('SRC-083', 'arts. 38.a–e, 187.1–2, 189.1–3')],
    ['PD-296'],
  ),
  rule(
    'ES-R05',
    [ref('SRC-083', 'arts. 187.4, 189.4–5')],
    ['PD-283', 'PD-296'],
  ),
  rule(
    'ES-R06',
    [ref('SRC-083', 'art. 187.3.a'), ref('SRC-333', 'Hoja 54, Requisitos')],
    ['PD-286'],
  ),
  rule('ES-R07', [ref('SRC-083', 'art. 187.3.b')], ['PD-291']),
  rule('ES-R08', [
    ref('SRC-320', 'art. 47'),
    ref('SRC-324', 'Hoja 50, Procedimiento: tasa'),
    ref('SRC-325', 'anexo 2.7'),
  ]),
  rule(
    'ES-R08-visa',
    [
      ref('SRC-083', 'arts. 38.h, 187.2, 189.2'),
      ref('SRC-333', 'Hoja 53/54; Hanoi §5'),
      ref('SRC-347', 'arts. 6–7, 18–19'),
    ],
    ['PD-296'],
  ),
  rule(
    'ES-R09',
    [
      ref('SRC-083', 'arts. 187.5–7, 189.6–8'),
      ref('SRC-090', 'art. 30.4–6'),
    ],
    ['PD-099'],
  ),
  rule(
    'ES-T01',
    [
      ref('SRC-083', 'arts. 177.7, 178, 179.7, 184.7, 185'),
      ref('SRC-090', 'art. 30.4–6'),
      ref('SRC-325', 'anexo 4.5, 4.7'),
    ],
    ['PD-099', 'PD-294'],
  ),
  rule(
    'ES-T02',
    [
      ref('SRC-083', 'arts. 201.1.c, 201.2, 202–203'),
      ref('SRC-320', 'art. 32.5'),
      ref('SRC-348', 'C-432/20, p1'),
    ],
    ['PD-295'],
  ),
  rule(
    'ES-U01',
    [
      ref('SRC-327', 'RD 240/2007 arts. 1–3, DA 3'),
      ref('SRC-328', 'Hoja 63, ámbito; SEM 2/2025 instrucciones 1, 10'),
    ],
    ['PD-297'],
  ),
  rule('ES-U02', [ref('SRC-327', 'RD 240/2007 arts. 2, 7.4')]),
  rule('ES-U03', [ref('SRC-327', 'RD 240/2007 art. 2 bis.1–4')]),
  rule(
    'ES-U04',
    [
      ref('SRC-327', 'RD 240/2007 arts. 10.1, 10.6–7, 14.3, 15.3'),
      ref('SRC-330', 'arts. 16, 21'),
    ],
    ['PD-298'],
  ),
  rule('ES-U04-basis', [ref('SRC-327', 'RD 240/2007 art. 10.1–5')]),
  rule('ES-U04-retention', [ref('SRC-327', 'RD 240/2007 art. 10.7')], [
    'PD-298',
  ]),
  rule(
    'ES-U05',
    [
      ref('SRC-327', 'RD 240/2007 arts. 7.1–4, 7.6–7, 10.1'),
      ref('SRC-329', 'art. 3.2'),
      ref('SRC-337', 'RDL 3/2026 art. 2.5'),
    ],
    ['PD-298'],
  ),
  rule(
    'ES-U06',
    [
      ref('SRC-327', 'RD 240/2007 arts. 9.2–4, 9 bis'),
      ref('SRC-330', 'arts. 12–13, 18'),
    ],
    ['PD-299'],
  ),
  rule(
    'ES-U07',
    [
      ref('SRC-327', 'RD 240/2007 arts. 7, 10.2.a, 10.4, 10.6, 14.3, 15.3'),
      ref('SRC-330', 'arts. 16.3, 17.1.a, 17.2, 21'),
      ref('SRC-344', 'Jubilación ordinaria, Edad, 2026'),
    ],
    ['PD-298', 'PD-299'],
  ),
  rule(
    'ES-U08',
    [
      ref('SRC-327', 'RD 240/2007 arts. 7, 10.2.b, 10.4, 10.6, 14.3, 15.3'),
      ref('SRC-330', 'arts. 16.3, 17.1.b, 17.2, 21'),
    ],
    ['PD-298', 'PD-299'],
  ),
  rule(
    'ES-U09',
    [
      ref('SRC-327', 'RD 240/2007 arts. 7, 10.2.c, 10.4, 10.6, 14.3, 15.3'),
      ref('SRC-330', 'arts. 16.3, 17.1.c, 21'),
    ],
    ['PD-298'],
  ),
  rule('ES-U10', [ref('SRC-327', 'RD 240/2007 art. 10.3')]),
  rule(
    'ES-U11',
    [
      ref('SRC-327', 'RD 240/2007 arts. 7, 10.5–6, 14.3, 15.3'),
      ref('SRC-330', 'arts. 16.3, 17.4, 21'),
    ],
    ['PD-298'],
  ),
  rule('ES-U12', [ref('SRC-327', 'RD 240/2007 art. 15.1, 15.5, 15.9')]),
  rule(
    'ES-U13',
    [
      ref('SRC-090', 'art. 30.4–6'),
      ref('SRC-325', 'anexo 4.6'),
      ref('SRC-327', 'RD 240/2007 arts. 10–12, 14'),
      ref('SRC-328', 'Hoja 63: DOCUMENTACIÓN, PROCEDIMIENTO'),
    ],
    ['PD-298'],
  ),
  rule('ES-TRANSITION', [ref('SRC-338', 'RD 1155/2024 DT 2, DF 4')]),
];
