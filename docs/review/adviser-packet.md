# Settlement simulator — review packet for a regulated adviser

Generated from the engine's golden cases. Policy checked up to 2026-11-04. 56 cases.

This is an educational simulator, not advice. We would like a regulated adviser (OISC or a solicitor) to check whether its conclusions are right. For each case below please mark **Agree** or **Disagree**; when you disagree, give the outcome you expect and the paragraph of the Immigration Rules (or the CP 1707 page for the Earned Settlement column) that decides it.

How to read a result:
- **Outcome** is the simulator’s overall view for that rule set. Outcomes used in this packet: INSUFFICIENT_INFORMATION, LIKELY_ELIGIBLE, LIKELY_NOT_ELIGIBLE, POTENTIALLY_ELIGIBLE, REQUIRES_REGULATED_REVIEW.
- **Pathway** is the qualifying period the simulator thinks applies. **Earliest date** is the application date itself when the person already qualifies; otherwise it is the first later date the simulator projects for that pathway, assuming nothing else changes.
- **Conditional completion** is when the selected reform pathway would reach its residence period under the stated assumptions. **Public funds reassessment from** is the first day the recorded use falls outside the lookback, assuming no further counted use.
- **Decisive rules** are the checks the outcome rests on. Every failing or unknown check is then listed in full, except when the person is likely eligible: the failures left are other pathways not taken, listed by id only. Each check cites the source register id (SRC-xxx) and paragraph.
- The Earned Settlement column models policy announced on 2 November 2026 (CP 1707). It is **not law yet**; please only flag it where it misreads the published policy.

## Summary

| Case | Scenario | Current rules | Earned Settlement |
|---|---|---|---|
| [G-SW-5Y-ON-DAY](#g-sw-5y-on-day) | Skilled Worker since 2021-06-01 on £52,000 (SOC 2136), applies the day 5 years are completed | LIKELY_ELIGIBLE, 5y, 2026-06-01 | LIKELY_ELIGIBLE, 5y, 2026-06-01 |
| [G-SW-5Y-DAY-BEFORE](#g-sw-5y-day-before) | Same Skilled Worker, applies one day before 5 years | LIKELY_ELIGIBLE, 5y, 2026-05-31 | LIKELY_NOT_ELIGIBLE, 5y, 2026-06-01 |
| [G-SW-ABSENCE-200-DAYS](#g-sw-absence-200-days) | Same Skilled Worker, 200 days outside the UK in one 12-month period | LIKELY_NOT_ELIGIBLE, 5y, 2028-07-01 | LIKELY_NOT_ELIGIBLE, 5y, 2028-07-29 |
| [G-SW-NO-ENGLISH-LITUK](#g-sw-no-english-lituk) | Same Skilled Worker, English and Life in the UK test not provided | INSUFFICIENT_INFORMATION | INSUFFICIENT_INFORMATION |
| [G-SW-B1-DAY-BEFORE-B2](#g-sw-b1-day-before-b2) | Skilled Worker since 2022-03-01 with B1 English, applies on 2027-03-25 (the day before the B2 requirement) | LIKELY_ELIGIBLE, 5y, 2027-03-25 | LIKELY_NOT_ELIGIBLE |
| [G-SW-B1-ON-B2-DATE](#g-sw-b1-on-b2-date) | Same Skilled Worker with B1 English, applies on 2027-03-26 (the day the B2 requirement starts) | LIKELY_NOT_ELIGIBLE | LIKELY_NOT_ELIGIBLE |
| [G-SW-PRE-2024-SALARY-BEFORE-CUTOFF](#g-sw-pre-2024-salary-before-cutoff) | Skilled Worker since 2024-01-15 on £41,000, applies 2029-01-15 (old-salary window open) | LIKELY_ELIGIBLE, 5y, 2029-01-15 | LIKELY_NOT_ELIGIBLE, 10y, 2034-01-15 |
| [G-SW-PRE-2024-SALARY-AFTER-CUTOFF](#g-sw-pre-2024-salary-after-cutoff) | Same Skilled Worker on £41,000, applies 2030-04-04 (the day the old-salary window closes) | LIKELY_NOT_ELIGIBLE, 10y, 2033-12-18 | LIKELY_NOT_ELIGIBLE, 10y, 2034-01-15 |
| [G-SW-CARE-WORKER](#g-sw-care-worker) | Care worker (SOC 6135) on Skilled Worker since 2021-09-01 at £25,000 | LIKELY_ELIGIBLE, 5y, 2026-09-01 | LIKELY_ELIGIBLE, 5y, 2026-09-01 |
| [G-STUDENT-GRADUATE-SW](#g-student-graduate-sw) | Student 2019–2022, Graduate 2022–2024, then Skilled Worker; applies 2026-11-16 | LIKELY_NOT_ELIGIBLE, 10y, 2029-08-18 | LIKELY_NOT_ELIGIBLE, 5y, 2029-09-15 |
| [G-LONG-RESIDENCE-10Y](#g-long-residence-10y) | Student 2016–2021, Graduate 2021–2023, Skilled Worker since 2023; 10 years lawful residence on 2026-09-15 | LIKELY_ELIGIBLE, 10y, 2026-09-15 | LIKELY_NOT_ELIGIBLE, 10y, 2033-09-15 |
| [G-VISIT-ONLY](#g-visit-only) | Only visit visas, no qualifying residence | INSUFFICIENT_INFORMATION | LIKELY_NOT_ELIGIBLE |
| [G-HKBNO-ONE-MONTH-SHORT](#g-hkbno-one-month-short) | Hong Kong BN(O) Status Holder since 2021-12-01, applies 2026-11-01 (one month short of 5 years) | LIKELY_NOT_ELIGIBLE, 5y, 2026-12-01 | REQUIRES_REGULATED_REVIEW |
| [G-FAMILY-10Y-PARTNER](#g-family-10y-partner) | Partner of a British citizen on the 10-year Appendix FM route since 2016-10-01 | LIKELY_ELIGIBLE, 10y, 2026-10-01 | LIKELY_ELIGIBLE, 5y, 2026-10-01 |
| [G-FAMILY-5Y-LOW-INCOME](#g-family-5y-low-income) | Partner of a British citizen on the 5-year Appendix FM route, household income £21,000 and no savings | LIKELY_ELIGIBLE, 5y, 2026-08-01 | LIKELY_ELIGIBLE, 5y, 2026-08-01 |
| [G-GLOBAL-TALENT-3Y](#g-global-talent-3y) | Global Talent (exceptional talent) since 2023-08-01, applies after 3 years | LIKELY_ELIGIBLE, 3y, 2026-08-01 | LIKELY_NOT_ELIGIBLE, 5y, 2028-08-01 |
| [G-REFUGEE-5Y](#g-refugee-5y) | Refugee status since 2021-07-01, applies after 5 years | LIKELY_ELIGIBLE, 5y, 2026-07-01 | LIKELY_NOT_ELIGIBLE, 20y, 2041-07-01 |
| [G-SW-PARTNER](#g-sw-partner) | Dependent partner (earning £26,000) of the 5-year Skilled Worker (G-SW-5Y-ON-DAY), applies the same day | LIKELY_ELIGIBLE, 5y, 2026-06-01 | LIKELY_ELIGIBLE, 5y, 2026-06-01 |
| [G-SW-CHILD](#g-sw-child) | Child (born 2015) of the 5-year Skilled Worker, dependant since 2021-06-01 | LIKELY_ELIGIBLE, 5y, 2026-06-01 | LIKELY_ELIGIBLE, 5y, 2026-06-01 |
| [G-SW-AGED-66-NO-ENGLISH](#g-sw-aged-66-no-english) | Skilled Worker aged 66 on the application date, no English test or Life in the UK test | LIKELY_ELIGIBLE, 5y, 2026-06-01 | LIKELY_ELIGIBLE, 5y, 2026-06-01 |
| [G-CRIMINAL-RECORD](#g-criminal-record) | Same Skilled Worker with a criminal conviction in 2024 | REQUIRES_REGULATED_REVIEW | REQUIRES_REGULATED_REVIEW |
| [G-OVERSTAY-BREACH](#g-overstay-breach) | Same Skilled Worker who overstayed for a period in 2020 before the current permission | LIKELY_ELIGIBLE, 5y, 2026-06-01 | LIKELY_NOT_ELIGIBLE, 20y, 2041-06-01 |
| [G-UNIVERSAL-CREDIT](#g-universal-credit) | Same Skilled Worker who received Universal Credit for 8 months in 2023 | LIKELY_ELIGIBLE, 5y, 2026-06-01 | LIKELY_NOT_ELIGIBLE, 20y, conditional completion 2041-06-01, public funds reassessment from 2028-11-01 |
| [ES-OFFICIAL-INDIVIDUAL-C](#es-official-individual-c) | Individual C: combined household income | LIKELY_ELIGIBLE, 10y, 2026-11-04 | LIKELY_ELIGIBLE, 10y, 2026-11-04 |
| [ES-OFFICIAL-INDIVIDUAL-D](#es-official-individual-d) | Individual D: accessed public funds | LIKELY_ELIGIBLE, 10y, 2026-11-04 | LIKELY_NOT_ELIGIBLE, 20y, conditional completion 2035-06-01, public funds reassessment from 2028-10-01 |
| [ES-OFFICIAL-P16-MATERNITY-BEST-YEARS](#es-official-p16-maternity-best-years) | Maternity leave: five qualifying earnings years out of seven | LIKELY_ELIGIBLE, 10y, 2026-04-06 | LIKELY_ELIGIBLE, 10y, 2026-04-06 |
| [ES-OFFICIAL-P19-INDIVIDUAL-A](#es-official-p19-individual-a) | Individual A: social worker on the public-service pathway | INSUFFICIENT_INFORMATION | LIKELY_ELIGIBLE, 5y, 2026-11-04 |
| [ES-OFFICIAL-P19-INDIVIDUAL-B](#es-official-p19-individual-b) | Individual B: spouse of a British citizen | INSUFFICIENT_INFORMATION | LIKELY_ELIGIBLE, 5y, 2026-11-04 |
| [ES-OFFICIAL-P31-INDIVIDUAL-A](#es-official-p31-individual-a) | Individual A: dependant partner arrives with the principal | LIKELY_ELIGIBLE, 5y, 2026-04-06 | LIKELY_ELIGIBLE, 5y, 2026-04-06 |
| [ES-OFFICIAL-P31-INDIVIDUAL-B](#es-official-p31-individual-b) | Individual B: principal whose dependant partner arrives later | INSUFFICIENT_INFORMATION | LIKELY_ELIGIBLE, 5y, 2026-04-06 |
| [ES-OFFICIAL-P31-INDIVIDUAL-B-PARTNER](#es-official-p31-individual-b-partner) | Individual B: dependant partner joins two years later | LIKELY_NOT_ELIGIBLE, 5y, 2028-03-09 | LIKELY_NOT_ELIGIBLE, 5y, 2028-04-06 |
| [ES-OFFICIAL-P31-INDIVIDUAL-C](#es-official-p31-individual-c) | Individual C: 14-year-old child dependant | LIKELY_ELIGIBLE, 5y, 2026-04-06 | LIKELY_ELIGIBLE, 5y, 2026-04-06 |
| [ES-OFFICIAL-P31-INDIVIDUAL-D](#es-official-p31-individual-d) | Individual D: 22-year-old child dependant | LIKELY_ELIGIBLE, 5y, 2026-04-06 | LIKELY_ELIGIBLE, 5y, 2026-04-06 |
| [ES-OFFICIAL-P31-INDIVIDUAL-E](#es-official-p31-individual-e) | Individual E: child dependant aged 25 | LIKELY_NOT_ELIGIBLE, 10y, 2031-03-09 | LIKELY_NOT_ELIGIBLE |
| [ES-OFFICIAL-P40-INDIVIDUAL-A](#es-official-p40-individual-a) | Individual A: UK Resettlement Scheme refugee | LIKELY_ELIGIBLE, 5y, 2032-06-01 | LIKELY_ELIGIBLE, 5y, 2032-06-01 |
| [ES-OFFICIAL-P40-INDIVIDUAL-B](#es-official-p40-individual-b) | Individual B: Core Protection, then work | LIKELY_NOT_ELIGIBLE, 5y, 2032-03-01 | LIKELY_NOT_ELIGIBLE, 10y, 2038-03-01 |
| [ES-OFFICIAL-P40-INDIVIDUAL-C](#es-official-p40-individual-c) | Individual C: illegal entry, then work | LIKELY_NOT_ELIGIBLE, 5y, 2032-03-01 | LIKELY_NOT_ELIGIBLE, 20y, 2048-03-01 |
| [ES-OFFICIAL-P40-INDIVIDUAL-D](#es-official-p40-individual-d) | Individual D: illegal entry, stays on Core Protection | LIKELY_NOT_ELIGIBLE, 5y, 2032-03-01 | LIKELY_NOT_ELIGIBLE, 30y, 2057-03-01 |
| [ES-OFFICIAL-P45-INDIVIDUAL-A](#es-official-p45-individual-a) | Individual A: existing care worker meeting the requirements | LIKELY_ELIGIBLE, 5y, 2028-04-06 | LIKELY_ELIGIBLE, 5y, 2028-04-06 |
| [ES-OFFICIAL-P45-INDIVIDUAL-B](#es-official-p45-individual-b) | Individual B: existing care worker not meeting the requirements | LIKELY_NOT_ELIGIBLE, 10y, 2033-03-09 | LIKELY_NOT_ELIGIBLE, 10y, 2033-04-06 |
| [ES-OFFICIAL-P45-INDIVIDUAL-C](#es-official-p45-individual-c) | Individual C: care worker switching after the transitional cutoff | LIKELY_ELIGIBLE, 10y, 2035-06-06 | LIKELY_ELIGIBLE, 10y, 2035-06-06 |
| [CL-HKBNO-FIVE-YEARS](#cl-hkbno-five-years) | Hong Kong BN(O) Status Holder: 5 years completed on the day | LIKELY_ELIGIBLE, 5y, 2026-02-01 | REQUIRES_REGULATED_REVIEW |
| [CL-GLOBAL-TALENT-THREE-YEARS](#cl-global-talent-three-years) | Global Talent, exceptional talent: 3 years completed on the day | LIKELY_ELIGIBLE, 3y, 2026-11-04 | LIKELY_NOT_ELIGIBLE |
| [CL-FAMILY-PARTNER-FIVE-YEARS](#cl-family-partner-five-years) | Partner of a British citizen: 5-year route completed on the day | LIKELY_ELIGIBLE, 5y, 2026-03-01 | LIKELY_NOT_ELIGIBLE |
| [CL-REFUGEE-FIVE-YEARS](#cl-refugee-five-years) | Refugee: 5 years with protection completed on the day | LIKELY_ELIGIBLE, 5y, 2026-03-01 | LIKELY_NOT_ELIGIBLE, 20y, 2041-03-01 |
| [CL-UK-ANCESTRY-FIVE-YEARS](#cl-uk-ancestry-five-years) | UK Ancestry: 5 years completed on the day | LIKELY_ELIGIBLE, 5y, 2026-09-01 | LIKELY_NOT_ELIGIBLE |
| [CL-INNOVATOR-FOUNDER-THREE-YEARS](#cl-innovator-founder-three-years) | Innovator Founder: 3 years completed on the day, two criteria met | LIKELY_ELIGIBLE, 3y, 2026-05-01 | INSUFFICIENT_INFORMATION |
| [CL-PRIVATE-LIFE-YOUNG-ADULT-FIVE-YEARS](#cl-private-life-young-adult-five-years) | Private Life young adult (half-life test): 5 years completed on the day | LIKELY_ELIGIBLE, 5y, 2026-07-01 | LIKELY_NOT_ELIGIBLE |
| [CL-HKBNO-CHILD-WITH-PARENT](#cl-hkbno-child-with-parent) | Hong Kong BN(O) child under 18 settling with the parent | LIKELY_ELIGIBLE, 5y, 2026-02-01 | REQUIRES_REGULATED_REVIEW |
| [CL-GLOBAL-TALENT-PARTNER-FIVE-YEARS](#cl-global-talent-partner-five-years) | Global Talent dependent partner: 5 years after the principal settled | LIKELY_ELIGIBLE, 5y, 2026-06-01 | LIKELY_NOT_ELIGIBLE |
| [CL-FAMILY-CHILD-TEN-YEAR](#cl-family-child-ten-year) | Child of a 10-year route partner settling with the parent | LIKELY_ELIGIBLE, 10y, 2026-03-01 | LIKELY_NOT_ELIGIBLE |
| [CL-FAMILY-FIVE-YEAR-CHILD-PROJECTED](#cl-family-five-year-child-projected) | Child of a 5-year route partner, a day before the parent qualifies | LIKELY_NOT_ELIGIBLE, 5y, 2026-11-06 | LIKELY_NOT_ELIGIBLE |
| [CL-FAMILY-FIVE-YEAR-ADULT-CHILD-ENGLISH](#cl-family-five-year-adult-child-english) | Adult child of a 5-year route partner without an English level | INSUFFICIENT_INFORMATION | LIKELY_NOT_ELIGIBLE |
| [CL-FAMILY-FIVE-YEAR-SAVINGS-PASS](#cl-family-five-year-savings-pass) | Partner on the 5-year route: savings make up the income shortfall | LIKELY_ELIGIBLE, 5y, 2029-06-01 | LIKELY_ELIGIBLE, 5y, 2029-06-01 |
| [CL-FAMILY-FIVE-YEAR-SAVINGS-SHORT](#cl-family-five-year-savings-short) | Partner on the 5-year route: savings short of the income shortfall | LIKELY_NOT_ELIGIBLE, 10y, 2034-05-04 | LIKELY_ELIGIBLE, 5y, 2029-06-01 |
| [CL-FAMILY-FIVE-YEAR-PARTNER-BENEFIT](#cl-family-five-year-partner-benefit) | Partner on the 5-year route whose partner receives Carer's Allowance | POTENTIALLY_ELIGIBLE, 5y | LIKELY_ELIGIBLE, 5y, 2029-06-01 |

## G-SW-5Y-ON-DAY

**Skilled Worker since 2021-06-01 on £52,000 (SOC 2136), applies the day 5 years are completed**

Application date: 2026-06-01.

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **PASS**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2021-06-01: 5 years completed. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row C (continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £31,300; the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row C, Appendix Skilled Occupations Table 2 gives a going rate of £34,500 for SOC 2136 (IT quality and testing professionals); the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. The application date is before 2027-03-26, and Appendix Skilled Worker sets no separate English requirement for settlement (the B2 in SW 22A.1 applies only to later applications). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-06-01: 5 full years by 2026-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **PASS**. Earnings reached £50,271 in 5 of the 5 tax years 2021-22 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-BRITISH-CONNECTION`, `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-5Y-DAY-BEFORE

**Same Skilled Worker, applies one day before 5 years**

Application date: 2026-05-31.

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-05-31.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **PASS**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2021-06-01: 5 years completed on 2026-06-01, within the CR 1.1 reference window for 2026-05-31. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row C (continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £31,300; the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row C, Appendix Skilled Occupations Table 2 gives a going rate of £34,500 for SOC 2136 (IT quality and testing professionals); the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. The application date is before 2027-03-26, and Appendix Skilled Worker sets no separate English requirement for settlement (the B2 in SW 22A.1 applies only to later applications). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- Under CR 1.1 the period is assessed as of 2026-06-01 and completes on 2026-06-01. The application date remains 2026-05-31.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2021-06-01: 4 full years by 2026-05-31. Not enough residence yet for the 5-year pathway; 5 years are completed on 2026-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **PASS**. Earnings reached £50,271 in 5 of the 5 tax years 2021-22 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The earliest application date is projected on the basis that residence continues from 2021-06-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-ABSENCE-200-DAYS

**Same Skilled Worker, 200 days outside the UK in one 12-month period**

Application date: 2026-06-01.

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- Absences: 2023-01-10 to 2023-07-28.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2028-07-01.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **FAIL**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2023-07-29: expected to complete 5 years on 2028-07-29; the earliest projected application date for the residence requirement is 2028-07-01 under CR 1.1. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row C (continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £31,300; the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row C, Appendix Skilled Occupations Table 2 gives a going rate of £34,500 for SOC 2136 (IT quality and testing professionals); the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. The application date is before 2027-03-26, and Appendix Skilled Worker sets no separate English requirement for settlement (the B2 in SW 22A.1 applies only to later applications). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Failing or unknown checks:

- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2023-07-29: expected to complete 10 years on 2033-07-29; the earliest projected application date for the residence requirement is 2033-07-01 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The projected date is on or after 2027-03-26, when settlement requires English at B2 (SW 22A.1, LR 13.1(b)).
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- Absences follow CR 3.1–3.2, using the permission start date to infer whether the old permission rules apply. Departure and return days count as absence. CR 3.4 exemptions are outside the model.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- Absences starting before 2024-04-11 are subject to the CR 3.3 limit of 184 days per trip. Only days before the cut-off and within the selected qualifying period count towards the 548-day total. Trips beginning on or after the cut-off follow CR 3.1; the days of departure and return both count as absence.
- The earliest application date is projected on the basis that residence continues from 2023-07-29, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2028-07-29; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2023-07-29: 2 full years by 2026-06-01. Absences exceed 180 days in a 12-month period, so continuous residence is broken and restarts from 2023-07-29. Not enough residence yet for the 5-year pathway; 5 years are completed on 2028-07-29. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **PASS**. Earnings reached £50,271 in 5 of the 5 tax years 2021-22 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- How absences count under Earned Settlement has not been published; assumed to follow the current Appendix Continuous Residence CR 3.1 (no more than 180 days in any 12-month period, with the days of departure and return both counted as absence) (PD-054).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The earliest application date is projected on the basis that residence continues from 2023-07-29, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-NO-ENGLISH-LITUK

**Same Skilled Worker, English and Life in the UK test not provided**

Application date: 2026-06-01.

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: not provided. Life in the UK test: not provided.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **INSUFFICIENT_INFORMATION**.

Failing or unknown checks:

- `CL-KOL` Pass the Life in the UK test — **UNKNOWN**. Not provided whether the Life in the UK test has been passed. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2021-06-01: expected to complete 10 years on 2031-06-01; the earliest projected application date for the residence requirement is 2031-05-04 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The 10-year Long Residence pathway requires English at B1 (LR 13.1(a)), and no English level has been provided; the settlement English requirement shown applies the current route’s level.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **INSUFFICIENT_INFORMATION**; route group CORE_PERMISSION.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **UNKNOWN**. English level not provided. Earned Settlement requires CEFR B2 (existing exemptions are retained). _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **UNKNOWN**. Not provided whether the Life in the UK test has been passed. _(SRC-001 p21)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-B1-DAY-BEFORE-B2

**Skilled Worker since 2022-03-01 with B1 English, applies on 2027-03-25 (the day before the B2 requirement)**

Application date: 2027-03-25.

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2022-03-01 to 2025-02-28, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2025-03-01 to 2028-02-28, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B1. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2027-03-25.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **PASS**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2022-03-01: 5 years completed. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row C (continuous Skilled Worker permission since 2022-03-01, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £31,300; the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row C, Appendix Skilled Occupations Table 2 gives a going rate of £34,500 for SOC 2136 (IT quality and testing professionals); the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. The application date is before 2027-03-26, and Appendix Skilled Worker sets no separate English requirement for settlement (the B2 in SW 22A.1 applies only to later applications). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; route group CORE_PERMISSION.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **FAIL**. English at B1, below the B2 required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions. _(SRC-001 p21)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2022-03-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-B1-ON-B2-DATE

**Same Skilled Worker with B1 English, applies on 2027-03-26 (the day the B2 requirement starts)**

Application date: 2027-03-26.

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2022-03-01 to 2025-02-28, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2025-03-01 to 2028-02-28, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B1. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**.

Failing or unknown checks:

- `CL-ENGLISH` Settlement English requirement — **FAIL**. English at B1, below the B2 required for settlement (applications from 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2022-03-01: expected to complete 10 years on 2032-03-01; the earliest projected application date for the residence requirement is 2032-02-02 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; route group CORE_PERMISSION.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **FAIL**. English at B1, below the B2 required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions. _(SRC-001 p21)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2022-03-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-PRE-2024-SALARY-BEFORE-CUTOFF

**Skilled Worker since 2024-01-15 on £41,000, applies 2029-01-15 (old-salary window open)**

Application date: 2029-01-15.

- Born 1996-03-02 (aged 32 on the application date), nationality CHN.
- Permission: SKILLED_WORKER from 2024-01-15 to 2027-01-14, salary £41,000 — role MAIN, socCode 2134.
- Permission: SKILLED_WORKER from 2027-01-15 to 2030-01-14, salary £41,000 — role MAIN, socCode 2134.
- No absences from the UK.
- Income: 2024-25 £41,000; 2025-26 £41,000; 2026-27 £41,000; 2027-28 £41,000; 2028-29 £41,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2029-01-15.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **PASS**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2024-01-15: 5 years completed. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row C (continuous Skilled Worker permission since 2024-01-15, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £31,300; the current salary of £41,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row C, Appendix Skilled Occupations Table 2 gives a going rate of £40,000 for SOC 2134 (Programmers and software development professionals); the current salary of £41,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B2 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2034-01-15; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2024-01-15: 5 full years by 2029-01-15. Not enough residence yet for the 10-year pathway; 10 years are completed on 2034-01-15. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 4 of the 7 tax years 2021-22 to 2027-28; 5 needed; earnings not provided for 3 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2024-25 to 2027-28; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **FAIL**. Earnings reached £50,271 in 0 of the 5 tax years 2023-24 to 2027-28; 3 needed; earnings not provided for 1 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2024-01-15, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The earliest application date is projected on the basis that residence continues from 2024-01-15, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-PRE-2024-SALARY-AFTER-CUTOFF

**Same Skilled Worker on £41,000, applies 2030-04-04 (the day the old-salary window closes)**

Application date: 2030-04-04.

- Born 1996-03-02 (aged 34 on the application date), nationality CHN.
- Permission: SKILLED_WORKER from 2024-01-15 to 2027-01-14, salary £41,000 — role MAIN, socCode 2134.
- Permission: SKILLED_WORKER from 2027-01-15 to 2030-01-14, salary £41,000 — role MAIN, socCode 2134.
- Permission: SKILLED_WORKER from 2030-01-15 to 2033-01-14, salary £41,000 — role MAIN, socCode 2134.
- No absences from the UK.
- Income: 2024-25 £41,000; 2025-26 £41,000; 2026-27 £41,000; 2027-28 £41,000; 2028-29 £41,000; 2029-30 £41,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2033-12-18.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B2 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2024-01-15: expected to complete 10 years on 2034-01-15; the earliest projected application date for the residence requirement is 2033-12-18 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Failing or unknown checks:

- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **FAIL**. Under SW 24.3 row A (rows B–E do not apply), the general salary threshold is £41,700; the current salary of £41,000 is below it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **FAIL**. Under SW 24.3 row A, Appendix Skilled Occupations Table 1 gives a going rate of £54,700 for SOC 2134 (Programmers and software development professionals); the current salary of £41,000 is below the going rate. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2024-01-15, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2034-01-15; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2024-01-15: 6 full years by 2030-04-04. Not enough residence yet for the 10-year pathway; 10 years are completed on 2034-01-15. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 5 of the 7 tax years 2022-23 to 2028-29; 5 needed; earnings not provided for 2 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2025-26 to 2028-29; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **FAIL**. Earnings reached £50,271 in 0 of the 5 tax years 2024-25 to 2028-29; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2024-01-15, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The earliest application date is projected on the basis that residence continues from 2024-01-15, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-CARE-WORKER

**Care worker (SOC 6135) on Skilled Worker since 2021-09-01 at £25,000**

Application date: 2026-09-01.

- Born 1992-04-10 (aged 34 on the application date), nationality NGA.
- Permission: SKILLED_WORKER from 2021-09-01 to 2024-08-31, salary £25,000 — role MAIN, socCode 6135.
- Permission: SKILLED_WORKER from 2024-09-01 to 2027-08-31, salary £25,000 — role MAIN, socCode 6135.
- No absences from the UK.
- Income: 2021-22 £25,000; 2022-23 £25,000; 2023-24 £25,000; 2024-25 £25,000; 2025-26 £25,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-09-01.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **PASS**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2021-09-01: 5 years completed. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row D (the job is on the Immigration Salary List, and continuous Skilled Worker permission since 2021-09-01, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £25,000; the current salary of £25,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row D, Appendix Skilled Occupations Table 2aa gives a going rate of £25,000 for SOC 6135 (Care workers and home carers); the current salary of £25,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. The application date is before 2027-03-26, and Appendix Skilled Worker sets no separate English requirement for settlement (the B2 in SW 22A.1 applies only to later applications). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; SOC 6135 is in the list’s occupation table, so the job is derived to be on the list from its occupation code. The list’s job / region restrictions (criteria) are not checked; a declaration in the questionnaire overrides this. The list entry’s removal date is 2028-07-22, compared with the date of application.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-09-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-09-01: 5 full years by 2026-09-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **PASS**. Entered the care worker route on 2021-09-01, before the cut-off of 2025-05-12, with a salary of £25,000 that reaches £25,000: the 5-year qualifying period is retained. The strengthened minimum requirements, such as criminality and B2 English, still apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_

Failing or unknown checks:

- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-EARNINGS-5Y`, `ES-BRITISH-CONNECTION`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- The response does not say how to choose when someone qualifies for both a transitional arrangement and a standard pathway; this result takes the shortest pathway whose conditions are met. The applicant may be able to choose a more favourable arrangement and should seek regulated advice.
- Continuous Skilled Worker permission since 2021-09-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The cut-off is the Immigration White Paper publication date, 2025-05-12 (PD-035). For continuous care worker permission that started before the cut-off, the start date is used as a proxy for route entry, with occupation identified by SOC 2020 6135 / 6136 (PD-036).
- The transitional arrangements also require the sponsorship and employment requirements to be met (p42); this tool does not check them.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-STUDENT-GRADUATE-SW

**Student 2019–2022, Graduate 2022–2024, then Skilled Worker; applies 2026-11-16**

Application date: 2026-11-16.

- Born 1998-07-01 (aged 28 on the application date), nationality MYS.
- Permission: STUDENT from 2019-09-15 to 2022-09-14 — role MAIN.
- Permission: GRADUATE from 2022-09-15 to 2024-09-14 — role MAIN.
- Permission: SKILLED_WORKER from 2024-09-15 to 2027-09-14, salary £45,000 — role MAIN, socCode 2134.
- No absences from the UK.
- Income: 2024-25 £45,000; 2025-26 £45,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2029-08-18.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. The application date is before 2027-03-26, and Appendix Skilled Worker sets no separate English requirement for settlement (the B2 in SW 22A.1 applies only to later applications). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2019-09-15: expected to complete 10 years on 2029-09-15; the earliest projected application date for the residence requirement is 2029-08-18 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Failing or unknown checks:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **FAIL**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2024-09-15: expected to complete 5 years on 2029-09-15; the earliest projected application date for the residence requirement is 2029-08-18 under CR 1.1. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **FAIL**. Under SW 24.3 row A, Appendix Skilled Occupations Table 1 gives a going rate of £54,700 for SOC 2134 (Programmers and software development professionals); the current salary of £45,000 is below the going rate. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The projected date is on or after 2027-03-26, when settlement requires English at B2 (SW 22A.1, LR 13.1(b)).
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2019-09-15, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2029-09-15; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2024-09-15: 2 full years by 2026-11-16. The earlier time on Graduate does not count towards settlement; this tool assumes that time on a non-counting route also breaks continuous residence, rather than only being deducted from the qualifying period (PD-053). Not enough residence yet for the 5-year pathway; 5 years are completed on 2029-09-15. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2021-22 to 2025-26; 3 needed; earnings not provided for 3 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 2 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 2 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 5 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- The earlier time on Graduate does not count towards settlement; this tool assumes that time on a non-counting route also breaks continuous residence, rather than only being deducted from the qualifying period (PD-053).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The earliest application date is projected on the basis that residence continues from 2024-09-15, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-LONG-RESIDENCE-10Y

**Student 2016–2021, Graduate 2021–2023, Skilled Worker since 2023; 10 years lawful residence on 2026-09-15**

Application date: 2026-09-15.

- Born 1997-11-20 (aged 28 on the application date), nationality PAK.
- Permission: STUDENT from 2016-09-15 to 2021-09-14 — role MAIN.
- Permission: GRADUATE from 2021-09-15 to 2023-09-14 — role MAIN.
- Permission: SKILLED_WORKER from 2023-09-15 to 2028-09-14, salary £48,000 — role MAIN, socCode 2134.
- No absences from the UK.
- Income: 2023-24 £48,000; 2024-25 £48,000; 2025-26 £48,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2026-09-15.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. The application date is before 2027-03-26, and Appendix Skilled Worker sets no separate English requirement for settlement (the B2 in SW 22A.1 applies only to later applications). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **PASS**. Continuous lawful residence since 2016-09-15: 10 years completed. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Other pathways not taken: `CL-SW-RESIDENCE-5Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2033-09-15; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2023-09-15: 3 full years by 2026-09-15. The earlier time on Graduate does not count towards settlement; this tool assumes that time on a non-counting route also breaks continuous residence, rather than only being deducted from the qualifying period (PD-053). Not enough residence yet for the 10-year pathway; 10 years are completed on 2033-09-15. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 3 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 1 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **FAIL**. Earnings reached £50,271 in 0 of the 5 tax years 2021-22 to 2025-26; 3 needed; earnings not provided for 2 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2023-09-15, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- The earlier time on Graduate does not count towards settlement; this tool assumes that time on a non-counting route also breaks continuous residence, rather than only being deducted from the qualifying period (PD-053).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The earliest application date is projected on the basis that residence continues from 2023-09-15, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-VISIT-ONLY

**Only visit visas, no qualifying residence**

Application date: 2026-11-16.

- Born 1992-04-10 (aged 34 on the application date), nationality USA.
- Permission: VISIT from 2026-06-01 to 2026-11-30 — role MAIN.
- No absences from the UK.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **INSUFFICIENT_INFORMATION**.

Failing or unknown checks:

- `CL-SCOPE` Within the scope of the modelled current rules — **UNKNOWN**. The current rules are modelled only for Skilled Worker (main applicants and their dependent partners / children), Hong Kong BN(O) and Global Talent main applicants and their dependants, Appendix FM partners and their children (Appendix Settlement Family Life on the 10-year route; paragraph 298 of Part 8 of the Immigration Rules for the children of 5-year route partners), main applicants with refugee status or humanitarian protection, UK Ancestry, Innovator Founder and Private Life main applicants, and Long Residence; the current route is none of these, and the 10 years for Long Residence are not met, so the settlement requirements of other routes cannot be assessed. _(SRC-004 SW 21.1; SRC-004 SW 39.1; SRC-004 SW 41A.1; SRC-005 LR 11.1; SRC-020 HK 62.1; SRC-021 GT 11.1; SRC-022 SETF 1.3; SRC-023 STP 1.3; SRC-026 UKA 13.1; SRC-027 INNF 18.1; SRC-028 PL 14.1; SRC-020 HK 57.1; SRC-021 GT 27.1; SRC-022 SETF 12.1; SRC-024 D-LTRC.1.1; SRC-029 para 298)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**.

Failing or unknown checks:

- `ES-ROUTE-GROUP` Current route counts towards settlement — **FAIL**. The current route, Visit, is a temporary route and does not count towards settlement; time starts to count only after switching to a counting route. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. The current route, Visit, does not count towards settlement, so the counting residence is 0. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2021-22 to 2025-26; 3 needed; earnings not provided for 5 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 0 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 7 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-HKBNO-ONE-MONTH-SHORT

**Hong Kong BN(O) Status Holder since 2021-12-01, applies 2026-11-01 (one month short of 5 years)**

Application date: 2026-11-01.

- Born 1980-05-05 (aged 46 on the application date), nationality HKG.
- Permission: HONG_KONG_BNO from 2021-12-01 to 2026-11-30 — role MAIN.
- No absences from the UK.
- English: cefrLevel B1. Life in the UK test: passed true.
- governmentDebt: outstanding false.

**Short circuit — OUTSIDE_FRAMEWORK:** The current route is outside the Earned Settlement framework and keeps the existing settlement arrangements for that group (SRC-001 p25–p26). The strengthened criminality and B2 English requirements still apply, unless an existing exemption or protection applies.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2026-12-01.

Decisive rules:

- `CL-HKBNO-RESIDENCE-5Y` 5 continuous years on the Hong Kong BN(O) route — **FAIL**. Continuous Hong Kong BN(O) permission since 2021-12-01: expected to complete 5 years on 2026-12-01; the earliest projected application date for the residence requirement is 2026-12-01 under CR 1.1 (HK 62.1(b)). _(SRC-020 HK 62.1; SRC-020 HK 63.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B1, which meets the B1 required for settlement (Appendix Hong Kong BN(O) HK 60.1; the B2 introduced by HC 1691 does not cover this Appendix, EM 5.60). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (HK 61.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Failing or unknown checks:

- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2021-12-01: expected to complete 10 years on 2031-12-01; the earliest projected application date for the residence requirement is 2031-11-03 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2021-12-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **REQUIRES_REGULATED_REVIEW**.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **FAIL**. English at B1, below the B2 required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **UNKNOWN**. The current route, Hong Kong BN(O), is outside the Earned Settlement framework and keeps the existing settlement arrangements for that group. The strengthened criminality and B2 English requirements still apply, unless an existing exemption or protection applies. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **UNKNOWN**. The current route, Hong Kong BN(O), is outside the Earned Settlement framework, so residence is not calculated under it. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2021-22 to 2025-26; 3 needed; earnings not provided for 5 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 0 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 7 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-FAMILY-10Y-PARTNER

**Partner of a British citizen on the 10-year Appendix FM route since 2016-10-01**

Application date: 2026-10-01.

- Born 1992-04-10 (aged 34 on the application date), nationality BRA.
- Permission: FAMILY_PARTNER_OR_PARENT from 2016-10-01 to 2029-03-31 — role MAIN, familyPermission PARTNER_TEN_YEAR.
- No absences from the UK.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2026-10-01.

Decisive rules:

- `CL-FAMILY-RESIDENCE` Continuous residence on the family partner route — **PASS**. 10-year partner route: continuous qualifying permission (SETF 3.1) since 2016-10-01: 10 years completed. _(SRC-022 SETF 3.1; SRC-022 SETF 3.2; SRC-022 SETF 4.1; SRC-024 E-ILRP.1.3; SRC-024 E-ILRP.1.4; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-FAMILY-RELATIONSHIP` Partner is a British citizen or settled — **PASS**. The partner is a British citizen (SETF 7.1(a)). _(SRC-022 SETF 7.1; SRC-022 SETF 7.2; SRC-022 SETF 7.3; SRC-024 R-ILRP.1.1(a); SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.1.2)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement (Appendix Settlement Family Life SETF 5.1(a), applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (SETF 6.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines the Family Partner or Parent and Family and Private Life permissions listed in SETF 3.1; each period is taken to be on the 10-year route like the current permission.
- The relationship is taken as genuine and subsisting (SETF 7.2, Appendix Relationship with Partner), with permission based on it held for at least one year (SETF 7.3); this tool does not check these.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-10-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Family Partner or Parent, is in the Core permission / British connection groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2016-10-01: 10 full years by 2026-10-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **PASS**. Holds a family visa as the partner, parent or child of a British citizen, a recognised British connection: the 5-year pathway is available. _(SRC-001 p18)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2021-22 to 2025-26; 3 needed; earnings not provided for 5 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 0 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 7 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_

Other pathways not taken: `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-FAMILY-5Y-LOW-INCOME

**Partner of a British citizen on the 5-year Appendix FM route, household income £21,000 and no savings**

Application date: 2026-08-01.

- Born 1992-04-10 (aged 34 on the application date), nationality PHL.
- Permission: FAMILY_PARTNER_OR_PARENT from 2021-08-01 to 2027-01-31 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- No absences from the UK.
- Income: 2021-22 £9,000 (+ partner £12,000); 2022-23 £9,000 (+ partner £12,000); 2023-24 £9,000 (+ partner £12,000); 2024-25 £9,000 (+ partner £12,000); 2025-26 £9,000 (+ partner £12,000). Tax years not listed: not provided.
- Cash savings: £0.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-08-01.

Decisive rules:

- `CL-FAMILY-RESIDENCE` Continuous residence on the family partner route — **PASS**. 5-year partner route: continuous partner permission since 2021-08-01: 5 years completed (E-ILRP.1.3). _(SRC-022 SETF 3.1; SRC-022 SETF 3.2; SRC-022 SETF 4.1; SRC-024 E-ILRP.1.3; SRC-024 E-ILRP.1.4; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-FAMILY-RELATIONSHIP` Partner is a British citizen or settled — **PASS**. The partner is a British citizen (E-LTRP.1.2(a)). _(SRC-022 SETF 7.1; SRC-022 SETF 7.2; SRC-022 SETF 7.3; SRC-024 R-ILRP.1.1(a); SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.1.2)_
- `CL-FAMILY-FINANCIAL` Financial requirement on the 5-year partner route — **PASS**. Combined earnings of the applicant and partner in the 2025-26 tax year are £21,000, which meets the £18,600 of the transitional requirement (E-LTRP.3.5, E-LTRP.3.7(a); 0 children, capped at £29,000). _(SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.3.1; SRC-024 E-LTRP.3.2; SRC-024 E-LTRP.3.3; SRC-024 E-LTRP.3.5; SRC-024 E-LTRP.3.7; SRC-024 E-LTRP.3.8)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement (Appendix KoLL 2.2, through E-ILRP.1.6; applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (Appendix KoLL 2.3, through E-ILRP.1.6). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- E-ILRP.1.3 counts only partner permission on the 5-year route (D-ECP.1.1 / D-LTRP.1.1), not time as a fiancé(e); each period is taken to be on the 5-year route with the same partner (E-ILRP.1.4).
- This assumes your partner is also in the UK on the date you apply (Appendix FM R-ILRP.1.1(a)).
- The relationship is taken as genuine and subsisting, with both intending to live together permanently (E-LTRP.1.7–E-LTRP.1.10); this tool does not check these.
- Whether the transitional requirement applies is judged by whether the continuous partner permission started before 2024-04-11 (E-LTRP.3.5 looks at the date of the first application, so an application made before that date and granted after it also qualifies); children are those listed under relationships with another status.
- Savings are the combined cash savings as declared; the holding period and evidence rules in Appendix FM-SE and the kinds of income and savings sources in E-LTRP.3.2 are not checked; any benefit the partner receives is taken as declared; the accommodation requirement (E-LTRP.3.4, E-LTRP.3.9) and EX.1 are not modelled.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-08-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Family Partner or Parent, is in the Core permission / British connection groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-08-01: 5 full years by 2026-08-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **PASS**. Holds a family visa as the partner, parent or child of a British citizen, a recognised British connection: the 5-year pathway is available. _(SRC-001 p18)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-EARNINGS-5Y`, `ES-EARNINGS-10Y`, `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-GLOBAL-TALENT-3Y

**Global Talent (exceptional talent) since 2023-08-01, applies after 3 years**

Application date: 2026-08-01.

- Born 1992-04-10 (aged 34 on the application date), nationality KOR.
- Permission: GLOBAL_TALENT from 2023-08-01 to 2028-07-31 — role MAIN, globalTalentEndorsement TECH_NATION, globalTalentCriteria EXCEPTIONAL_TALENT.
- No absences from the UK.
- Income: 2023-24 £70,000; 2024-25 £70,000; 2025-26 £70,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 3 years; earliest date 2026-08-01.

Decisive rules:

- `CL-GT-RESIDENCE` Global Talent: 3 or 5 continuous years — **PASS**. 3-year qualifying period under GT 11.1(b); continuous qualifying permission (GT 11.3) since 2023-08-01: 3 years completed. _(SRC-021 GT 11.1; SRC-021 GT 11.2; SRC-021 GT 11.3; SRC-021 GT 12.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement (Appendix Global Talent GT 13.1(a), applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (GT 14.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in GT 11.3: Global Talent, Innovator Founder, Skilled Worker, T2 Minister of Religion, International Sportsperson and Scale-up. Tier 1 and Representative of an Overseas Business cannot be entered in this tool and are not counted.
- The endorsement is taken as not withdrawn (GT 10.1) and the applicant as having earned money in the field of their endorsement or prize during their last permission (GT 10.2); this tool does not check these.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2028-08-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Global Talent, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2023-08-01: 3 full years by 2026-08-01. Not enough residence yet for the 5-year pathway; 5 years are completed on 2028-08-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **PASS**. Earnings reached £50,271 in 3 of the 5 tax years 2021-22 to 2025-26; 3 needed; earnings not provided for 2 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 1 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 3 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The earliest application date is projected on the basis that residence continues from 2023-08-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-REFUGEE-5Y

**Refugee status since 2021-07-01, applies after 5 years**

Application date: 2026-07-01.

- Born 1992-04-10 (aged 34 on the application date), nationality SDN.
- Permission: CORE_PROTECTION from 2021-07-01 to 2026-07-31 — role MAIN.
- No absences from the UK.
- English: not provided. Life in the UK test: not provided.
- governmentDebt: outstanding false.
- asylumSupportRepayment: NOT_REQUIRED.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-07-01.

Decisive rules:

- `CL-PROTECTION-RESIDENCE-5Y` 5 continuous years with refugee status or humanitarian protection — **PASS**. Continuously in the UK with refugee status or humanitarian protection since 2021-07-01: 5 years completed (STP 3.1). _(SRC-023 STP 1.3; SRC-023 STP 3.1)_
- `CL-PROTECTION-STATUS` Protection status not revoked or renounced — **PASS**. No revocation or renunciation declared, so refugee status or humanitarian protection is taken as still held (STP 4.1). _(SRC-023 STP 4.1; SRC-023 STP 4.2; SRC-023 STP 5.2)_

Failing or unknown checks:

- `CL-ENGLISH` Settlement English requirement — **UNKNOWN**. English level not provided; settlement requires CEFR B1 (Appendix Settlement Protection sets no English requirement for settlement; this level applies only to the 10-year Long Residence pathway, PD-072). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **UNKNOWN**. Not provided whether the Life in the UK test has been passed (Appendix Settlement Protection sets no Life in the UK requirement; this applies only to the 10-year Long Residence pathway, PD-072). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- STP 1.3 lists the permission by the date of the asylum application: refugee or humanitarian protection permission for applications before 2022-06-28, and refugee permission to stay for later ones. This tool does not tell refugee status and humanitarian protection apart, and assumes you hold a listed permission. Humanitarian protection following an asylum application made on or after 2022-06-28 is not listed in STP 1.3(b) (PD-073).
- A safe return review is carried out when the settlement application is considered (STP 4.2), checking whether personal circumstances or country conditions have changed so that protection could be revoked or not renewed; its outcome cannot be predicted.
- If the settlement requirements are not met but the person is still entitled to refugee status or humanitarian protection, a further period of at least 30 months of protection permission is granted (STP 5.2).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 20 years; earliest date 2041-07-01; route group PROTECTION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **UNKNOWN**. English level not provided. Earned Settlement requires CEFR B2 (existing exemptions are retained). _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **UNKNOWN**. Not provided whether the Life in the UK test has been passed. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Core Protection, is in the Protection group and counts towards settlement under the refugee pathways (Table 2); time on protection routes cannot be combined with time on work or family routes (p25). _(SRC-001 p25; SRC-001 p47; SRC-001 p48)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2021-07-01: 5 full years by 2026-07-01. Not enough residence yet for the 20-year pathway; 20 years are completed on 2041-07-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-PROTECTION-PATHWAY` Refugee settlement pathway and qualifying period — **PASS**. Core Protection: the 20-year pathway (p38, p47). Moving into sustained work, education or training and onto Protection Work and Study gives a 10-year pathway counted from the move (p38). _(SRC-001 p38; SRC-001 p40; SRC-001 p47)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Declared that no asylum support was received or none needs to be repaid. _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Many details of the refugee settlement pathways (when the routes start, how existing time counts, public funds and repayment, Article 31) will be set out before implementation. This result only helps to understand the announced policy; for your own case, please seek advice from a regulated immigration adviser.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Core Protection and Protection Work and Study have not been introduced and their start dates are not set (PD-034); this tool counts from the dates of the permissions entered. Whether and how refugee time before their introduction counts is inconsistent in the response and the details are still to be set out (PD-029, PD-043).
- The earliest application date is projected on the basis that residence continues from 2021-07-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-PARTNER

**Dependent partner (earning £26,000) of the 5-year Skilled Worker (G-SW-5Y-ON-DAY), applies the same day**

Application date: 2026-06-01.

- Born 1993-09-09 (aged 32 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31 — role DEPENDANT, dependantOf PARTNER.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31 — role DEPENDANT, dependantOf PARTNER.
- No absences from the UK.
- Income: 2021-22 £26,000; 2022-23 £26,000; 2023-24 £26,000; 2024-25 £26,000; 2025-26 £26,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

Principal (the person they are a dependant of):

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01.

Decisive rules:

- `CL-SW-PARTNER-5Y` 5 continuous years as a Skilled Worker dependent partner, settling with the principal applicant — **PASS**. Settling with the principal applicant: they can apply from 2026-06-01, based on their respective 5-year qualifying periods (SW 39.1(a), SW 42.1). _(SRC-004 SW 39.1; SRC-004 SW 42.1; SRC-004 SW 43.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Only continuous Skilled Worker dependant permission is counted, assuming all of it was as the same principal applicant’s dependent partner; Appendix Relationship with Partner (SW 39.3) is not checked.
- While the principal applicant has not settled, only being granted at the same time as them is assessed (SW 39.1(a)); if they have already settled, enter their settlement date and route in the principal applicant’s details (SW 39.1(b)).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-06-01: 5 full years by 2026-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 5 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 2 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_
- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **PASS**. Residence started together with the principal applicant, so they can settle together when the principal applicant’s 5-year pathway is completed (2026-06-01), each meeting the relevant requirements. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The dependant’s pathway and date follow from the principal applicant’s Earned Settlement assessment on the same application date; see the principal applicant’s own result for their rules.
- The partner’s earnings requirement is the minimum earnings (£12,571 individually or £25,142 combined household earnings), not the principal applicant’s accelerated threshold (PD-056).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-CHILD

**Child (born 2015) of the 5-year Skilled Worker, dependant since 2021-06-01**

Application date: 2026-06-01.

- Born 2015-02-14 (aged 11 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31 — role DEPENDANT, dependantOf PARENT.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31 — role DEPENDANT, dependantOf PARENT.
- No absences from the UK.
- English: not provided. Life in the UK test: not provided.
- relationships: type PARENT, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

Principal (the person they are a dependant of):

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01.

Decisive rules:

- `CL-SW-CHILD` Skilled Worker dependent child settling with the principal applicant — **PASS**. Under 18 on the date of application (CHI 1.1); settling with the principal applicant: they can apply together on 2026-06-01 (SW 39.1(a), SW 41A.1); the child has no residence requirement of their own. _(SRC-004 SW 39.1; SRC-004 SW 41A.1; SRC-018 CHI 1.1; SRC-018 CHI 1.2; SRC-018 CHI 1A.1; SRC-018 CHI 2.1)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the English requirement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The child is assumed not to be leading an independent life (CHI 1A.1).
- The child is assumed to have care and accommodation arrangements that comply with UK law (CHI 2.1).
- Only the Skilled Worker dependent child permission on the date of application is checked, assuming the child is the same principal applicant’s; the other parent must be granted settlement at the same time, already be settled or be a British citizen, unless the principal applicant has sole responsibility or similar (CHI 4.3, via SW 39.4); this tool does not check this.
- While the principal applicant has not settled, only being granted at the same time as them is assessed (SW 39.1(a)); if they have already settled, enter their settlement date and route in the principal applicant’s details (SW 39.1(b)).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. A child dependant under 18 on the date of application is exempt from the government debt requirement. _(SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the English requirement. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-06-01: 5 full years by 2026-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the minimum earnings requirement. _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_
- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **PASS**. A child under 18 settles with their parents (principal applicant’s 5-year pathway, completed on 2026-06-01); exempt from earnings, government debt, English and Life in the UK, with only the suitability and criminality requirements to meet. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- The dependant’s pathway and date follow from the principal applicant’s Earned Settlement assessment on the same application date; see the principal applicant’s own result for their rules.
- Age “when the family becomes eligible for settlement” is taken on the date the principal applicant first completes their pathway (2026-06-01), not the actual application date (PD-060).
- Assessed against one principal applicant only, assuming the other parent settles at the same time or is the principal applicant’s accompanying partner (PD-061).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-SW-AGED-66-NO-ENGLISH

**Skilled Worker aged 66 on the application date, no English test or Life in the UK test**

Application date: 2026-06-01.

- Born 1960-03-01 (aged 66 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: not provided. Life in the UK test: not provided.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **PASS**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2021-06-01: 5 years completed. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row C (continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £31,300; the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row C, Appendix Skilled Occupations Table 2 gives a going rate of £34,500 for SOC 2136 (IT quality and testing professionals); the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the English requirement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the English requirement. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-06-01: 5 full years by 2026-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **PASS**. Earnings reached £50,271 in 5 of the 5 tax years 2021-22 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-BRITISH-CONNECTION`, `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-CRIMINAL-RECORD

**Same Skilled Worker with a criminal conviction in 2024**

Application date: 2026-06-01.

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- criminalRecord: date 2024-02-01.
- governmentDebt: outstanding false.

**Short circuit — CRIMINALITY:** A criminal record has been declared. Under the announced general Earned Settlement standard, an adult criminal record in the UK leads to refusal. Overseas convictions depend on whether the conduct is also an offence in the UK, with discretion for differences between legal systems. Offences committed as a minor can also be considered on a discretionary basis (SRC-001 p12, PD-017). Under the current rules, the outcome depends on the circumstances under Part Suitability. Please seek advice from a regulated immigration adviser.

### Current Immigration Rules

Outcome **REQUIRES_REGULATED_REVIEW**.

Failing or unknown checks:

- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2021-06-01: expected to complete 10 years on 2031-06-01; the earliest projected application date for the residence requirement is 2031-05-04 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **REQUIRES_REGULATED_REVIEW**; route group CORE_PERMISSION.

Failing or unknown checks:

- `ES-CRIMINALITY` No criminal record — **UNKNOWN**. An adult criminal record was declared. The jurisdiction and whether the conduct behind any overseas conviction is an offence in the UK are unknown and need a regulated adviser’s assessment. _(SRC-001 p12)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-OVERSTAY-BREACH

**Same Skilled Worker who overstayed for a period in 2020 before the current permission**

Application date: 2026-06-01.

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- immigrationBreaches: type OVERSTAYING, date 2020-03-01.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **PASS**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2021-06-01: 5 years completed. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row C (continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £31,300; the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row C, Appendix Skilled Occupations Table 2 gives a going rate of £34,500 for SOC 2136 (IT quality and testing professionals); the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. The application date is before 2027-03-26, and Appendix Skilled Worker sets no separate English requirement for settlement (the B2 in SW 22A.1 applies only to later applications). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 20 years; earliest date 2041-06-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2021-06-01: 5 full years by 2026-06-01. Not enough residence yet for the 20-year pathway; 20 years are completed on 2041-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 5 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 2 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-BREACH` No qualifying immigration breach as an adult — **FAIL**. Qualifying immigration breach as an adult (Overstaying). Assuming pre-implementation breaches count, the 20-year pathway applies however high the earnings. _(SRC-001 p13)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The scenario applies the rules as at the decision date and assumes breaches before implementation are counted under the new rules. Retroactive treatment remains unsettled (SRC-001 p41, SRC-037 answer paragraph 2, PD-004).
- The 20 years count continuous residence on a qualifying route; breaches do not expire (PD-016).
- The earliest application date is projected on the basis that residence continues from 2021-06-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## G-UNIVERSAL-CREDIT

**Same Skilled Worker who received Universal Credit for 8 months in 2023**

Application date: 2026-06-01.

- Born 1992-04-10 (aged 34 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-06-01 to 2024-05-31, salary £52,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-06-01 to 2027-05-31, salary £52,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £52,000; 2022-23 £52,000; 2023-24 £52,000; 2024-25 £52,000; 2025-26 £52,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- benefits: benefitType UNIVERSAL_CREDIT, from 2023-03-01, to 2023-10-31.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **PASS**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2021-06-01: 5 years completed. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row C (continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £31,300; the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row C, Appendix Skilled Occupations Table 2 gives a going rate of £34,500 for SOC 2136 (IT quality and testing professionals); the current salary of £52,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. The application date is before 2027-03-26, and Appendix Skilled Worker sets no separate English requirement for settlement (the B2 in SW 22A.1 applies only to later applications). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 20 years; route group CORE_PERMISSION.
Conditional completion: 2041-06-01.
Public funds reassessment from 2028-11-01, if no further counted use.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2021-06-01: 5 full years by 2026-06-01. Not enough residence yet for the 20-year pathway; 20 years are completed on 2041-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 5 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 2 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **FAIL**. Public funds received since 2021-06-01: Universal Credit. The 3 / 5 / 10-year pathways require no use of specified public funds in the 5 years before applying; otherwise 20 years on a qualifying route are needed. If they are not used again, the lookback contains no public funds from 2028-11-01, and the shorter pathways can be reassessed. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-06-01, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- The scenario applies the rules as at the decision date and assumes public funds received before implementation count in the lookback. Retroactive treatment remains unsettled (SRC-001 p41, SRC-037 answer paragraph 2, PD-004).
- On the assumption that residence continues from 2021-06-01 and the remaining requirements are met then, the selected 20-year pathway completes on 2041-06-01.
- If no further counted public funds are received, shorter pathways can be reassessed from 2028-11-01.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- Specified public funds are judged by the current public funds definition (SRC-006) for now; the government will set the scope, and protections or exemptions for vulnerable groups, separately (PD-013).
- Only benefits received by the applicant are counted; the response does not say whether benefits received by a partner or child affect the applicant (PD-014).
- The lookback is “the 5 years immediately before applying”, as in the main text, and that time need not all be on a qualifying route (PD-047).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-INDIVIDUAL-C

**Individual C: combined household income**

Application date: 2026-11-04.

- Born 1988-04-12 (aged 38 on the application date), nationality IND.
- Permission: FAMILY_PARTNER_OR_PARENT from 2016-09-01 to 2019-02-28 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2019-03-01 to 2021-08-31 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2021-09-01 to 2024-02-29 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2024-03-01 to 2026-08-31 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2026-09-01 to 2029-02-28 — role MAIN.
- No absences from the UK.
- Income: 2019-20 £9,000 (+ partner £28,000); 2020-21 £9,000 (+ partner £28,000); 2021-22 £9,000 (+ partner £28,000); 2022-23 £9,000 (+ partner £28,000); 2023-24 £9,000 (+ partner £28,000); 2024-25 £9,000 (+ partner £28,000); 2025-26 £9,000 (+ partner £28,000). Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus SETTLED.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2026-11-04.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **PASS**. Continuous lawful residence since 2016-09-01: 10 years completed. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Failing or unknown checks:

- `CL-FAMILY-RESIDENCE` Continuous residence on the family partner route — **UNKNOWN**. Not provided whether the partner permission is on the 5-year or the 10-year route: the 5-year route follows Appendix FM, the 10-year route Appendix Settlement Family Life (SETF 3.1). _(SRC-022 SETF 3.1; SRC-022 SETF 3.2; SRC-022 SETF 4.1; SRC-024 E-ILRP.1.3; SRC-024 E-ILRP.1.4; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2026-11-04; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Family Partner or Parent, is in the Core permission / British connection groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2016-09-01: 10 full years by 2026-11-04. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 7 of the 7 tax years 2019-20 to 2025-26 (7 of them through combined household earnings of £25,142); 5 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-EARNINGS-5Y`, `ES-BRITISH-CONNECTION`, `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- Combined household earnings assume the applicant and partner are an eligible couple (a genuine and subsisting relationship) and the partner does not in turn rely on the applicant’s earnings (p17; PD-010).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-INDIVIDUAL-D

**Individual D: accessed public funds**

Application date: 2026-11-04.

- Born 1985-07-20 (aged 41 on the application date), nationality NGA.
- Permission: FAMILY_AND_PRIVATE_LIFE from 2015-06-01 to 2017-11-30 — role MAIN.
- Permission: FAMILY_AND_PRIVATE_LIFE from 2017-12-01 to 2020-05-31 — role MAIN.
- Permission: FAMILY_AND_PRIVATE_LIFE from 2020-06-01 to 2022-11-30 — role MAIN.
- Permission: FAMILY_AND_PRIVATE_LIFE from 2022-12-01 to 2025-05-31 — role MAIN.
- Permission: FAMILY_AND_PRIVATE_LIFE from 2025-06-01 to 2027-11-30 — role MAIN.
- No absences from the UK.
- Income: 2019-20 £20,000; 2020-21 £20,000; 2021-22 £20,000; 2022-23 £20,000; 2023-24 £20,000; 2024-25 £20,000; 2025-26 £20,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- benefits: benefitType UNIVERSAL_CREDIT, from 2023-01-01, to 2023-09-30.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2026-11-04.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement (Appendix Private Life PL 16.1(a), applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (PL 17.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **PASS**. Continuous lawful residence since 2015-06-01: 10 years completed. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Failing or unknown checks:

- `CL-PRIVATE-LIFE-RESIDENCE` Private Life: 5 or 10 continuous years — **UNKNOWN**. Not provided what the Private Life permission was granted on: 5 years for permission as a child (PL 3.1) or as a young adult who met the half-life test (PL 4.1) (PL 14.1); 10 years otherwise (PL 14.2(a)). _(SRC-028 PL 14.1; SRC-028 PL 14.2; SRC-028 PL 14.3; SRC-028 PL 14.4; SRC-028 PL 15.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines the permissions listed in PL 14.3: Appendix FM partner, parent and child permission, and Private Life permission. Leave Outside the Rules on Article 8 grounds (PL 14.3(e)) cannot be told apart from other such leave and is not counted. PL 13 (immediate settlement for a child born in the UK after 7 years of continuous residence), PL 14.1A / PL 14.2(b) / PL 14.2A (transitional cases with Appendix FM or Leave Outside the Rules permission before 2022-06-20) and PL 12.3–12.5 (suitability grounds that require 10 years) are not modelled.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 20 years; route group FAMILY_AND_PRIVATE_LIFE.
Conditional completion: 2035-06-01.
Public funds reassessment from 2028-10-01, if no further counted use.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Family and Private Life, is in the Family and Private Life group and counts towards settlement. Family and Private Life routes can only use the 10 or 20-year pathways. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2015-06-01: 11 full years by 2026-11-04. Not enough residence yet for the 20-year pathway; 20 years are completed on 2035-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 7 of the 7 tax years 2019-20 to 2025-26; 5 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **FAIL**. Earnings reached £50,271 in 0 of the 5 tax years 2021-22 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **FAIL**. Public funds received since 2021-11-04: Universal Credit. The 3 / 5 / 10-year pathways require no use of specified public funds in the 5 years before applying; otherwise 20 years on a qualifying route are needed. If they are not used again, the lookback contains no public funds from 2028-10-01, and the shorter pathways can be reassessed. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- The scenario applies the rules as at the decision date and assumes public funds received before implementation count in the lookback. Retroactive treatment remains unsettled (SRC-001 p41, SRC-037 answer paragraph 2, PD-004).
- On the assumption that residence continues from 2015-06-01 and the remaining requirements are met then, the selected 20-year pathway completes on 2035-06-01.
- If no further counted public funds are received, shorter pathways can be reassessed from 2028-10-01.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- Specified public funds are judged by the current public funds definition (SRC-006) for now; the government will set the scope, and protections or exemptions for vulnerable groups, separately (PD-013).
- Only benefits received by the applicant are counted; the response does not say whether benefits received by a partner or child affect the applicant (PD-014).
- The lookback is “the 5 years immediately before applying”, as in the main text, and that time need not all be on a qualifying route (PD-047).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P16-MATERNITY-BEST-YEARS

**Maternity leave: five qualifying earnings years out of seven**

Application date: 2026-04-06.

- Born 1988-04-12 (aged 37 on the application date), nationality IND.
- Permission: FAMILY_PARTNER_OR_PARENT from 2016-04-06 to 2018-10-05 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2018-10-06 to 2021-04-05 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2021-04-06 to 2023-10-05 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2023-10-06 to 2026-04-05 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2026-04-06 to 2028-10-05 — role MAIN.
- No absences from the UK.
- Income: 2019-20 £20,000; 2020-21 £20,000; 2021-22 £20,000; 2022-23 £5,000; 2023-24 £5,000; 2024-25 £20,000; 2025-26 £20,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus SETTLED.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2026-04-06.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **PASS**. Continuous lawful residence since 2016-04-06: 10 years completed. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Failing or unknown checks:

- `CL-FAMILY-RESIDENCE` Continuous residence on the family partner route — **UNKNOWN**. Not provided whether the partner permission is on the 5-year or the 10-year route: the 5-year route follows Appendix FM, the 10-year route Appendix Settlement Family Life (SETF 3.1). _(SRC-022 SETF 3.1; SRC-022 SETF 3.2; SRC-022 SETF 4.1; SRC-024 E-ILRP.1.3; SRC-024 E-ILRP.1.4; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2026-04-06; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Family Partner or Parent, is in the Core permission / British connection groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2016-04-06: 10 full years by 2026-04-06. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 5 of the 7 tax years 2019-20 to 2025-26; 5 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-EARNINGS-5Y`, `ES-BRITISH-CONNECTION`, `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P19-INDIVIDUAL-A

**Individual A: social worker on the public-service pathway**

Application date: 2026-11-04.

- Born 1988-04-12 (aged 38 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2024-04-05, salary £42,000 — role MAIN, socCode 2461.
- Permission: SKILLED_WORKER from 2024-04-06 to 2027-04-05, salary £42,000 — role MAIN, socCode 2461.
- No absences from the UK.
- Income: 2021-22 £42,000; 2022-23 £42,000; 2023-24 £42,000; 2024-25 £42,000; 2025-26 £42,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **INSUFFICIENT_INFORMATION**.

Failing or unknown checks:

- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **UNKNOWN**. SOC 2461 is a Table 3 health / education occupation, whose going rate is set by national pay scales (Appendix Skilled Occupations Tables 3–5); this tool has not extracted the pay scales in Tables 4 / 5, so it cannot check them. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2021-04-06: expected to complete 10 years on 2031-04-06; the earliest projected application date for the residence requirement is 2031-03-09 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-11-04; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-04-06: 5 full years by 2026-11-04. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **PASS**. In an Annex C public service occupation (Social workers) continuously since 2021-04-06: 5 years completed. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_

Failing or unknown checks:

- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-EARNINGS-5Y`, `ES-BRITISH-CONNECTION`, `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-04-06, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P19-INDIVIDUAL-B

**Individual B: spouse of a British citizen**

Application date: 2026-11-04.

- Born 1988-04-12 (aged 38 on the application date), nationality IND.
- Permission: FAMILY_PARTNER_OR_PARENT from 2021-04-06 to 2023-10-05 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2023-10-06 to 2026-04-05 — role MAIN.
- Permission: FAMILY_PARTNER_OR_PARENT from 2026-04-06 to 2028-10-05 — role MAIN.
- No absences from the UK.
- Income: 2021-22 £42,000; 2022-23 £42,000; 2023-24 £42,000; 2024-25 £42,000; 2025-26 £42,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **INSUFFICIENT_INFORMATION**.

Failing or unknown checks:

- `CL-FAMILY-RESIDENCE` Continuous residence on the family partner route — **UNKNOWN**. Not provided whether the partner permission is on the 5-year or the 10-year route: the 5-year route follows Appendix FM, the 10-year route Appendix Settlement Family Life (SETF 3.1). _(SRC-022 SETF 3.1; SRC-022 SETF 3.2; SRC-022 SETF 4.1; SRC-024 E-ILRP.1.3; SRC-024 E-ILRP.1.4; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2021-04-06: expected to complete 10 years on 2031-04-06; the earliest projected application date for the residence requirement is 2031-03-09 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-11-04; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Family Partner or Parent, is in the Core permission / British connection groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-04-06: 5 full years by 2026-11-04. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **PASS**. Holds a family visa as the partner, parent or child of a British citizen, a recognised British connection: the 5-year pathway is available. _(SRC-001 p18)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-EARNINGS-5Y`, `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P31-INDIVIDUAL-A

**Individual A: dependant partner arrives with the principal**

Application date: 2026-04-06.

- Born 1988-04-12 (aged 37 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2024-04-05 — role DEPENDANT, dependantOf PARTNER.
- Permission: SKILLED_WORKER from 2024-04-06 to 2027-04-05 — role DEPENDANT, dependantOf PARTNER.
- No absences from the UK.
- Income: 2021-22 £20,000; 2022-23 £20,000; 2023-24 £20,000; 2024-25 £20,000; 2025-26 £20,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

Principal (the person they are a dependant of):

- Born 1986-09-20 (aged 39 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2024-04-05, salary £55,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-04-06 to 2027-04-05, salary £55,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £55,000; 2022-23 £55,000; 2023-24 £55,000; 2024-25 £55,000; 2025-26 £55,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-04-06.

Decisive rules:

- `CL-SW-PARTNER-5Y` 5 continuous years as a Skilled Worker dependent partner, settling with the principal applicant — **PASS**. Settling with the principal applicant: they can apply from 2026-04-06, based on their respective 5-year qualifying periods (SW 39.1(a), SW 42.1). _(SRC-004 SW 39.1; SRC-004 SW 42.1; SRC-004 SW 43.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Only continuous Skilled Worker dependant permission is counted, assuming all of it was as the same principal applicant’s dependent partner; Appendix Relationship with Partner (SW 39.3) is not checked.
- While the principal applicant has not settled, only being granted at the same time as them is assessed (SW 39.1(a)); if they have already settled, enter their settlement date and route in the principal applicant’s details (SW 39.1(b)).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-04-06; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-04-06: 5 full years by 2026-04-06. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 5 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 2 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_
- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **PASS**. Residence started together with the principal applicant, so they can settle together when the principal applicant’s 5-year pathway is completed (2026-04-06), each meeting the relevant requirements. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The dependant’s pathway and date follow from the principal applicant’s Earned Settlement assessment on the same application date; see the principal applicant’s own result for their rules.
- The partner’s earnings requirement is the minimum earnings (£12,571 individually or £25,142 combined household earnings), not the principal applicant’s accelerated threshold (PD-056).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P31-INDIVIDUAL-B

**Individual B: principal whose dependant partner arrives later**

Application date: 2026-04-06.

- Born 1988-04-12 (aged 37 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2024-04-05, salary £60,000 — role MAIN.
- Permission: SKILLED_WORKER from 2024-04-06 to 2027-04-05, salary £60,000 — role MAIN.
- No absences from the UK.
- Income: 2021-22 £60,000; 2022-23 £60,000; 2023-24 £60,000; 2024-25 £60,000; 2025-26 £60,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **INSUFFICIENT_INFORMATION**.

Failing or unknown checks:

- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **UNKNOWN**. SOC 2020 code for the current Skilled Worker job not provided, so the going rate cannot be looked up. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2021-04-06: expected to complete 10 years on 2031-04-06; the earliest projected application date for the residence requirement is 2031-03-09 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; treated as not on the list.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-04-06; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-04-06: 5 full years by 2026-04-06. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **PASS**. Earnings reached £50,271 in 5 of the 5 tax years 2021-22 to 2025-26; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **UNKNOWN**. Provide the SOC 2020 code of the current sponsored job to assess the care worker transitional arrangement. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **UNKNOWN**. Provide the SOC 2020 code of the current sponsored job to assess the health or education transitional arrangement. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-BRITISH-CONNECTION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2021-04-06, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P31-INDIVIDUAL-B-PARTNER

**Individual B: dependant partner joins two years later**

Application date: 2026-04-06.

- Born 1988-04-12 (aged 37 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2023-04-06 to 2027-04-05 — role DEPENDANT, dependantOf PARTNER.
- No absences from the UK.
- Income: 2023-24 £20,000; 2024-25 £20,000; 2025-26 £20,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

Principal (the person they are a dependant of):

- Born 1986-09-20 (aged 39 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2024-04-05, salary £55,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-04-06 to 2027-04-05, salary £55,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £55,000; 2022-23 £55,000; 2023-24 £55,000; 2024-25 £55,000; 2025-26 £55,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2028-03-09.

Decisive rules:

- `CL-SW-PARTNER-5Y` 5 continuous years as a Skilled Worker dependent partner, settling with the principal applicant — **FAIL**. Settling with the principal applicant: they can apply from 2028-03-09, based on their respective 5-year qualifying periods (SW 39.1(a), SW 42.1). Not yet completed by 2026-04-06. _(SRC-004 SW 39.1; SRC-004 SW 42.1; SRC-004 SW 43.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Failing or unknown checks:

- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2023-04-06: expected to complete 10 years on 2033-04-06; the earliest projected application date for the residence requirement is 2033-03-09 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The projected date is on or after 2027-03-26, when settlement requires English at B2 (SW 22A.1, LR 13.1(b)).
- Only continuous Skilled Worker dependant permission is counted, assuming all of it was as the same principal applicant’s dependent partner; Appendix Relationship with Partner (SW 39.3) is not checked.
- While the principal applicant has not settled, only being granted at the same time as them is assessed (SW 39.1(a)); if they have already settled, enter their settlement date and route in the principal applicant’s details (SW 39.1(b)).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2023-04-06, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2028-04-06; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2023-04-06: 3 full years by 2026-04-06. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 3 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_
- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **FAIL**. The principal applicant is on the 5-year pathway, completed on 2026-04-06; the partner’s counting residence only starts on 2023-04-06, so they also need 5 years and can apply from 2028-04-06. Not yet completed by 2026-04-06. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The dependant’s pathway and date follow from the principal applicant’s Earned Settlement assessment on the same application date; see the principal applicant’s own result for their rules.
- The partner’s earnings requirement is the minimum earnings (£12,571 individually or £25,142 combined household earnings), not the principal applicant’s accelerated threshold (PD-056).
- A partner who joined later needs the length of the principal applicant’s pathway (5 years) (PD-057).
- The earliest application date is projected on the basis that residence continues from 2023-04-06, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P31-INDIVIDUAL-C

**Individual C: 14-year-old child dependant**

Application date: 2026-04-06.

- Born 2012-01-10 (aged 14 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2027-04-05 — role DEPENDANT, dependantOf PARENT.
- No absences from the UK.
- English: not provided. Life in the UK test: not provided.
- relationships: type PARENT, otherPartyStatus OTHER.

Principal (the person they are a dependant of):

- Born 1986-09-20 (aged 39 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2024-04-05, salary £55,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-04-06 to 2027-04-05, salary £55,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £55,000; 2022-23 £55,000; 2023-24 £55,000; 2024-25 £55,000; 2025-26 £55,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-04-06.

Decisive rules:

- `CL-SW-CHILD` Skilled Worker dependent child settling with the principal applicant — **PASS**. Under 18 on the date of application (CHI 1.1); settling with the principal applicant: they can apply together on 2026-04-06 (SW 39.1(a), SW 41A.1); the child has no residence requirement of their own. _(SRC-004 SW 39.1; SRC-004 SW 41A.1; SRC-018 CHI 1.1; SRC-018 CHI 1.2; SRC-018 CHI 1A.1; SRC-018 CHI 2.1)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the English requirement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The child is assumed not to be leading an independent life (CHI 1A.1).
- The child is assumed to have care and accommodation arrangements that comply with UK law (CHI 2.1).
- Only the Skilled Worker dependent child permission on the date of application is checked, assuming the child is the same principal applicant’s; the other parent must be granted settlement at the same time, already be settled or be a British citizen, unless the principal applicant has sole responsibility or similar (CHI 4.3, via SW 39.4); this tool does not check this.
- While the principal applicant has not settled, only being granted at the same time as them is assessed (SW 39.1(a)); if they have already settled, enter their settlement date and route in the principal applicant’s details (SW 39.1(b)).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-04-06; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. A child dependant under 18 on the date of application is exempt from the government debt requirement. _(SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the English requirement. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-04-06: 5 full years by 2026-04-06. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the minimum earnings requirement. _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_
- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **PASS**. A child under 18 settles with their parents (principal applicant’s 5-year pathway, completed on 2026-04-06); exempt from earnings, government debt, English and Life in the UK, with only the suitability and criminality requirements to meet. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- The dependant’s pathway and date follow from the principal applicant’s Earned Settlement assessment on the same application date; see the principal applicant’s own result for their rules.
- Age “when the family becomes eligible for settlement” is taken on the date the principal applicant first completes their pathway (2026-04-06), not the actual application date (PD-060).
- Assessed against one principal applicant only, assuming the other parent settles at the same time or is the principal applicant’s accompanying partner (PD-061).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P31-INDIVIDUAL-D

**Individual D: 22-year-old child dependant**

Application date: 2026-04-06.

- Born 2004-01-10 (aged 22 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2027-04-05 — role DEPENDANT, dependantOf PARENT.
- No absences from the UK.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARENT, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

Principal (the person they are a dependant of):

- Born 1986-09-20 (aged 39 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2024-04-05, salary £55,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-04-06 to 2027-04-05, salary £55,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £55,000; 2022-23 £55,000; 2023-24 £55,000; 2024-25 £55,000; 2025-26 £55,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-04-06.

Decisive rules:

- `CL-SW-CHILD` Skilled Worker dependent child settling with the principal applicant — **PASS**. Aged 18 or over on the date of application, but currently holding dependent child permission (CHI 1.2(a)); settling with the principal applicant: they can apply together on 2026-04-06 (SW 39.1(a), SW 41A.1); the child has no residence requirement of their own. _(SRC-004 SW 39.1; SRC-004 SW 41A.1; SRC-018 CHI 1.1; SRC-018 CHI 1.2; SRC-018 CHI 1A.1; SRC-018 CHI 2.1)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The child is assumed not to be leading an independent life (CHI 1A.1).
- Only the Skilled Worker dependent child permission on the date of application is checked, assuming the child is the same principal applicant’s; the other parent must be granted settlement at the same time, already be settled or be a British citizen, unless the principal applicant has sole responsibility or similar (CHI 4.3, via SW 39.4); this tool does not check this.
- While the principal applicant has not settled, only being granted at the same time as them is assessed (SW 39.1(a)); if they have already settled, enter their settlement date and route in the principal applicant’s details (SW 39.1(b)).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-04-06; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2021-04-06: 5 full years by 2026-04-06. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. An adult child retaining child-dependant status settles with the family and does not need to meet the individual earnings requirement. _(SRC-001 p30)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_
- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **PASS**. Aged 18 to 24 and retaining child-dependant status, so settles with the family (principal applicant’s 5-year pathway, completed on 2026-04-06); the adult mandatory requirements apply (criminality, government debt, B2 English, Life in the UK), but not individual earnings. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Current permission as a parent’s dependant is treated as retaining child-dependant status; the response does not say how this is determined (PD-059).
- The dependant’s pathway and date follow from the principal applicant’s Earned Settlement assessment on the same application date; see the principal applicant’s own result for their rules.
- Age “when the family becomes eligible for settlement” is taken on the date the principal applicant first completes their pathway (2026-04-06), not the actual application date (PD-060).
- Assessed against one principal applicant only, assuming the other parent settles at the same time or is the principal applicant’s accompanying partner (PD-061).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P31-INDIVIDUAL-E

**Individual E: child dependant aged 25**

Application date: 2026-04-06.

- Born 2001-01-10 (aged 25 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2027-04-05 — role DEPENDANT, dependantOf PARENT.
- No absences from the UK.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARENT, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

Principal (the person they are a dependant of):

- Born 1986-09-20 (aged 39 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2021-04-06 to 2024-04-05, salary £30,000 — role MAIN, socCode 2136.
- Permission: SKILLED_WORKER from 2024-04-06 to 2027-04-05, salary £30,000 — role MAIN, socCode 2136.
- No absences from the UK.
- Income: 2021-22 £30,000; 2022-23 £30,000; 2023-24 £30,000; 2024-25 £30,000; 2025-26 £30,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2031-03-09.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B1 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2021-04-06: expected to complete 10 years on 2031-04-06; the earliest projected application date for the residence requirement is 2031-03-09 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Failing or unknown checks:

- `CL-SW-CHILD` Skilled Worker dependent child settling with the principal applicant — **FAIL**. The principal applicant cannot currently settle as a Skilled Worker, so the dependent child cannot settle with them under SW 39.1(a). _(SRC-004 SW 39.1; SRC-004 SW 41A.1; SRC-018 CHI 1.1; SRC-018 CHI 1.2; SRC-018 CHI 1A.1; SRC-018 CHI 2.1)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The projected date is on or after 2027-03-26, when settlement requires English at B2 (SW 22A.1, LR 13.1(b)).
- The child is assumed not to be leading an independent life (CHI 1A.1).
- Only the Skilled Worker dependent child permission on the date of application is checked, assuming the child is the same principal applicant’s; the other parent must be granted settlement at the same time, already be settled or be a British citizen, unless the principal applicant has sole responsibility or similar (CHI 4.3, via SW 39.4); this tool does not check this.
- While the principal applicant has not settled, only being granted at the same time as them is assessed (SW 39.1(a)); if they have already settled, enter their settlement date and route in the principal applicant’s details (SW 39.1(b)).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2021-04-06, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; route group CORE_PERMISSION.

Failing or unknown checks:

- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **FAIL**. Aged 30 when the family becomes eligible for settlement on 2031-04-06 (25 or over), so cannot settle with the family as a dependant; they must independently meet every mandatory and qualifying requirement of a settlement pathway, or switch to an immigration route of their own. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Current permission as a parent’s dependant is treated as retaining child-dependant status; the response does not say how this is determined (PD-059).
- The dependant’s pathway and date follow from the principal applicant’s Earned Settlement assessment on the same application date; see the principal applicant’s own result for their rules.
- Age “when the family becomes eligible for settlement” is taken on the date the principal applicant first completes their pathway (2031-04-06), not the actual application date (PD-060).
- Assessed against one principal applicant only, assuming the other parent settles at the same time or is the principal applicant’s accompanying partner (PD-061).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P40-INDIVIDUAL-A

**Individual A: UK Resettlement Scheme refugee**

Application date: 2032-06-01.

- Born 1990-03-12 (aged 42 on the application date), nationality SYR.
- Permission: SAFE_AND_LEGAL from 2027-06-01 to 2032-06-30 — role MAIN, resettlementScheme UK_RESETTLEMENT_SCHEME.
- No absences from the UK.
- English: cefrLevel A2. Life in the UK test: not provided.
- benefits: benefitType UNIVERSAL_CREDIT, from 2028-01-01, to 2028-12-31.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2032-06-01.

Decisive rules:

- `CL-PROTECTION-RESIDENCE-5Y` 5 continuous years with refugee status or humanitarian protection — **PASS**. Continuously in the UK with refugee status or humanitarian protection since 2027-06-01: 5 years completed (STP 3.1). _(SRC-023 STP 1.3; SRC-023 STP 3.1)_
- `CL-PROTECTION-STATUS` Protection status not revoked or renounced — **PASS**. No revocation or renunciation declared, so refugee status or humanitarian protection is taken as still held (STP 4.1). _(SRC-023 STP 4.1; SRC-023 STP 4.2; SRC-023 STP 5.2)_

Failing or unknown checks:

- `CL-KOL` Pass the Life in the UK test — **UNKNOWN**. Not provided whether the Life in the UK test has been passed (Appendix Settlement Protection sets no Life in the UK requirement; this applies only to the 10-year Long Residence pathway, PD-072). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-ENGLISH`, `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- STP 1.3 lists the permission by the date of the asylum application: refugee or humanitarian protection permission for applications before 2022-06-28, and refugee permission to stay for later ones. This tool does not tell refugee status and humanitarian protection apart, and assumes you hold a listed permission. Humanitarian protection following an asylum application made on or after 2022-06-28 is not listed in STP 1.3(b) (PD-073).
- A safe return review is carried out when the settlement application is considered (STP 4.2), checking whether personal circumstances or country conditions have changed so that protection could be revoked or not renewed; its outcome cannot be predicted.
- If the settlement requirements are not met but the person is still entitled to refugee status or humanitarian protection, a further period of at least 30 months of protection permission is granted (STP 5.2).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2032-06-01; route group PROTECTION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at A2, which meets A2. Refugees admitted through the UK Resettlement Scheme need A2 only (p37, p39). _(SRC-001 p21; SRC-001 p37; SRC-001 p39; SRC-001 p47)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Refugees admitted through the UK Resettlement Scheme are exempt from the Life in the UK test until a version suitable for A2 English is available (p21 note 8, p39). _(SRC-001 p21; SRC-001 p39)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Safe and Legal, is in the Protection group and counts towards settlement under the refugee pathways (Table 2); time on protection routes cannot be combined with time on work or family routes (p25). _(SRC-001 p25; SRC-001 p47; SRC-001 p48)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2027-06-01: 5 full years by 2032-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-PROTECTION-PATHWAY` Refugee settlement pathway and qualifying period — **PASS**. Admitted through the UK Resettlement Scheme, a designated Safe and Legal Route: the 5-year pathway (p37, p47). _(SRC-001 p37; SRC-001 p47)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Many details of the refugee settlement pathways (when the routes start, how existing time counts, public funds and repayment, Article 31) will be set out before implementation. This result only helps to understand the announced policy; for your own case, please seek advice from a regulated immigration adviser.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- This exemption may change once an A2 version of the Life in the UK test is available; no date has been given (PD-021).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P40-INDIVIDUAL-B

**Individual B: Core Protection, then work**

Application date: 2030-01-01.

- Born 1995-05-01 (aged 34 on the application date), nationality SDN.
- Permission: CORE_PROTECTION from 2027-03-01 to 2028-02-29 — role MAIN.
- Permission: PROTECTION_WORK_AND_STUDY from 2028-03-01 to 2033-02-28 — role MAIN, sustainedActivity WORK.
- Permission: PROTECTION_WORK_AND_STUDY from 2033-03-01 to 2038-08-31 — role MAIN, sustainedActivity WORK.
- No absences from the UK.
- Income: 2027-28 £20,000; 2028-29 £20,000; 2029-30 £20,000; 2030-31 £20,000; 2031-32 £20,000; 2032-33 £20,000; 2033-34 £20,000; 2034-35 £20,000; 2035-36 £20,000; 2036-37 £20,000; 2037-38 £20,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.
- asylumSupportRepayment: REPAID.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2032-03-01.

Decisive rules:

- `CL-PROTECTION-RESIDENCE-5Y` 5 continuous years with refugee status or humanitarian protection — **FAIL**. Continuously in the UK with refugee status or humanitarian protection since 2027-03-01: 2 full years by 2030-01-01; 5 years are completed on 2032-03-01 (STP 3.1). _(SRC-023 STP 1.3; SRC-023 STP 3.1)_
- `CL-PROTECTION-STATUS` Protection status not revoked or renounced — **PASS**. No revocation or renunciation declared, so refugee status or humanitarian protection is taken as still held (STP 4.1). _(SRC-023 STP 4.1; SRC-023 STP 4.2; SRC-023 STP 5.2)_

Failing or unknown checks:

- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2027-03-01: expected to complete 10 years on 2037-03-01; the earliest projected application date for the residence requirement is 2037-02-01 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- STP 1.3 lists the permission by the date of the asylum application: refugee or humanitarian protection permission for applications before 2022-06-28, and refugee permission to stay for later ones. This tool does not tell refugee status and humanitarian protection apart, and assumes you hold a listed permission. Humanitarian protection following an asylum application made on or after 2022-06-28 is not listed in STP 1.3(b) (PD-073).
- A safe return review is carried out when the settlement application is considered (STP 4.2), checking whether personal circumstances or country conditions have changed so that protection could be revoked or not renewed; its outcome cannot be predicted.
- If the settlement requirements are not met but the person is still entitled to refugee status or humanitarian protection, a further period of at least 30 months of protection permission is granted (STP 5.2).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2027-03-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2038-03-01; route group PROTECTION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Protection Work and Study, is in the Protection group and counts towards settlement under the refugee pathways (Table 2); time on protection routes cannot be combined with time on work or family routes (p25). _(SRC-001 p25; SRC-001 p47; SRC-001 p48)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2028-03-01: 1 full year by 2030-01-01. Earlier time on Core Protection does not count towards the qualifying period of the current protection route; the count restarts from the move on 2028-03-01 (p38; p40 Individual B). Not enough residence yet for the 10-year pathway; 10 years are completed on 2038-03-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-PROTECTION-PATHWAY` Refugee settlement pathway and qualifying period — **PASS**. Protection Work and Study: the 10-year pathway, counted from the move onto this route; earlier time on Core Protection does not count (p38, p47). _(SRC-001 p38; SRC-001 p40; SRC-001 p47)_
- `ES-PROTECTION-CONTRIBUTION` Sustained contribution on Protection Work and Study — **UNKNOWN**. 1 of 1 complete tax year with earnings of at least £12,571 (2028-29); 3 are needed (p38, p47). The qualifying period ends on 2038-03-01, so this can still be met by then. Complete tax years from 2028-03-01 count (the tax year containing that date does not, as its earnings cannot be split at the move), up to the tax year before the application date. _(SRC-001 p38; SRC-001 p47)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Declared that asylum support has been repaid in full (p39). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Many details of the refugee settlement pathways (when the routes start, how existing time counts, public funds and repayment, Article 31) will be set out before implementation. This result only helps to understand the announced policy; for your own case, please seek advice from a regulated immigration adviser.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Core Protection and Protection Work and Study have not been introduced and their start dates are not set (PD-034); this tool counts from the dates of the permissions entered. Whether and how refugee time before their introduction counts is inconsistent in the response and the details are still to be set out (PD-029, PD-043).
- The response does not define the window for the three qualifying years; this tool counts any 3 tax years in the qualifying period on Protection Work and Study (PD-030).
- The details of refugees’ repayment obligations and safeguards are to be set out before implementation (PD-031); repayment follows what you declared.
- The earliest application date is projected on the basis that residence continues from 2028-03-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P40-INDIVIDUAL-C

**Individual C: illegal entry, then work**

Application date: 2030-01-01.

- Born 1995-05-01 (aged 34 on the application date), nationality SDN.
- Permission: CORE_PROTECTION from 2027-03-01 to 2028-02-29 — role MAIN.
- Permission: PROTECTION_WORK_AND_STUDY from 2028-03-01 to 2033-02-28 — role MAIN, sustainedActivity WORK.
- Permission: PROTECTION_WORK_AND_STUDY from 2033-03-01 to 2038-08-31 — role MAIN, sustainedActivity WORK.
- No absences from the UK.
- Income: 2027-28 £20,000; 2028-29 £20,000; 2029-30 £20,000; 2030-31 £20,000; 2031-32 £20,000; 2032-33 £20,000; 2033-34 £20,000; 2034-35 £20,000; 2035-36 £20,000; 2036-37 £20,000; 2037-38 £20,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- immigrationBreaches: type ILLEGAL_ENTRY, date 2026-08-10.
- governmentDebt: outstanding false.
- asylumSupportRepayment: REPAID.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2032-03-01.

Decisive rules:

- `CL-PROTECTION-RESIDENCE-5Y` 5 continuous years with refugee status or humanitarian protection — **FAIL**. Continuously in the UK with refugee status or humanitarian protection since 2027-03-01: 2 full years by 2030-01-01; 5 years are completed on 2032-03-01 (STP 3.1). _(SRC-023 STP 1.3; SRC-023 STP 3.1)_
- `CL-PROTECTION-STATUS` Protection status not revoked or renounced — **PASS**. No revocation or renunciation declared, so refugee status or humanitarian protection is taken as still held (STP 4.1). _(SRC-023 STP 4.1; SRC-023 STP 4.2; SRC-023 STP 5.2)_

Failing or unknown checks:

- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2027-03-01: expected to complete 10 years on 2037-03-01; the earliest projected application date for the residence requirement is 2037-02-01 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- STP 1.3 lists the permission by the date of the asylum application: refugee or humanitarian protection permission for applications before 2022-06-28, and refugee permission to stay for later ones. This tool does not tell refugee status and humanitarian protection apart, and assumes you hold a listed permission. Humanitarian protection following an asylum application made on or after 2022-06-28 is not listed in STP 1.3(b) (PD-073).
- A safe return review is carried out when the settlement application is considered (STP 4.2), checking whether personal circumstances or country conditions have changed so that protection could be revoked or not renewed; its outcome cannot be predicted.
- If the settlement requirements are not met but the person is still entitled to refugee status or humanitarian protection, a further period of at least 30 months of protection permission is granted (STP 5.2).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2027-03-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 20 years; earliest date 2048-03-01; route group PROTECTION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Protection Work and Study, is in the Protection group and counts towards settlement under the refugee pathways (Table 2); time on protection routes cannot be combined with time on work or family routes (p25). _(SRC-001 p25; SRC-001 p47; SRC-001 p48)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2028-03-01: 1 full year by 2030-01-01. Earlier time on Core Protection does not count towards the qualifying period of the current protection route; the count restarts from the move on 2028-03-01 (p38; p40 Individual B). Not enough residence yet for the 20-year pathway; 20 years are completed on 2048-03-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. On a protection route illegal entry as an adult adds 10 years under Table 2 (see the refugee settlement pathway) and is not counted here. _(SRC-001 p13)_
- `ES-PROTECTION-PATHWAY` Refugee settlement pathway and qualifying period — **PASS**. Protection Work and Study: the 10-year pathway, counted from the move onto this route; earlier time on Core Protection does not count (p38, p47). Illegal entry as an adult (2026-08-10): under Table 2’s “Protection Work and Study following illegal entry” row an extra 10 years apply, 20 years in all (p38, p48); they do not apply where Article 31 protects the person (not declared). _(SRC-001 p38; SRC-001 p40; SRC-001 p47; SRC-001 p48)_
- `ES-PROTECTION-CONTRIBUTION` Sustained contribution on Protection Work and Study — **UNKNOWN**. 1 of 1 complete tax year with earnings of at least £12,571 (2028-29); 3 are needed (p38, p47). The qualifying period ends on 2048-03-01, so this can still be met by then. Complete tax years from 2028-03-01 count (the tax year containing that date does not, as its earnings cannot be split at the move), up to the tax year before the application date. _(SRC-001 p38; SRC-001 p47)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Declared that asylum support has been repaid in full (p39). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Many details of the refugee settlement pathways (when the routes start, how existing time counts, public funds and repayment, Article 31) will be set out before implementation. This result only helps to understand the announced policy; for your own case, please seek advice from a regulated immigration adviser.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Core Protection and Protection Work and Study have not been introduced and their start dates are not set (PD-034); this tool counts from the dates of the permissions entered. Whether and how refugee time before their introduction counts is inconsistent in the response and the details are still to be set out (PD-029, PD-043).
- The response does not define the window for the three qualifying years; this tool counts any 3 tax years in the qualifying period on Protection Work and Study (PD-030).
- The details of refugees’ repayment obligations and safeguards are to be set out before implementation (PD-031); repayment follows what you declared.
- The earliest application date is projected on the basis that residence continues from 2028-03-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P40-INDIVIDUAL-D

**Individual D: illegal entry, stays on Core Protection**

Application date: 2030-01-01.

- Born 1995-05-01 (aged 34 on the application date), nationality SDN.
- Permission: CORE_PROTECTION from 2027-03-01 to 2032-02-29 — role MAIN.
- No absences from the UK.
- Income: 2027-28 £20,000; 2028-29 £20,000; 2029-30 £20,000; 2030-31 £20,000; 2031-32 £20,000; 2032-33 £20,000; 2033-34 £20,000; 2034-35 £20,000; 2035-36 £20,000; 2036-37 £20,000; 2037-38 £20,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- immigrationBreaches: type ILLEGAL_ENTRY, date 2026-08-10.
- governmentDebt: outstanding false.
- asylumSupportRepayment: REPAID.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2032-03-01.

Decisive rules:

- `CL-PROTECTION-RESIDENCE-5Y` 5 continuous years with refugee status or humanitarian protection — **FAIL**. Continuously in the UK with refugee status or humanitarian protection since 2027-03-01: 2 full years by 2030-01-01; 5 years are completed on 2032-03-01 (STP 3.1). _(SRC-023 STP 1.3; SRC-023 STP 3.1)_
- `CL-PROTECTION-STATUS` Protection status not revoked or renounced — **PASS**. No revocation or renunciation declared, so refugee status or humanitarian protection is taken as still held (STP 4.1). _(SRC-023 STP 4.1; SRC-023 STP 4.2; SRC-023 STP 5.2)_

Failing or unknown checks:

- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2027-03-01: expected to complete 10 years on 2037-03-01; the earliest projected application date for the residence requirement is 2037-02-01 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- STP 1.3 lists the permission by the date of the asylum application: refugee or humanitarian protection permission for applications before 2022-06-28, and refugee permission to stay for later ones. This tool does not tell refugee status and humanitarian protection apart, and assumes you hold a listed permission. Humanitarian protection following an asylum application made on or after 2022-06-28 is not listed in STP 1.3(b) (PD-073).
- A safe return review is carried out when the settlement application is considered (STP 4.2), checking whether personal circumstances or country conditions have changed so that protection could be revoked or not renewed; its outcome cannot be predicted.
- If the settlement requirements are not met but the person is still entitled to refugee status or humanitarian protection, a further period of at least 30 months of protection permission is granted (STP 5.2).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2027-03-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 30 years; earliest date 2057-03-01; route group PROTECTION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Core Protection, is in the Protection group and counts towards settlement under the refugee pathways (Table 2); time on protection routes cannot be combined with time on work or family routes (p25). _(SRC-001 p25; SRC-001 p47; SRC-001 p48)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2027-03-01: 2 full years by 2030-01-01. Not enough residence yet for the 30-year pathway; 30 years are completed on 2057-03-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-PROTECTION-PATHWAY` Refugee settlement pathway and qualifying period — **PASS**. Core Protection: the 20-year pathway (p38, p47). Moving into sustained work, education or training and onto Protection Work and Study gives a 10-year pathway counted from the move (p38). Illegal entry as an adult (2026-08-10): under Table 2’s “Core Protection following illegal entry” row an extra 10 years apply, 30 years in all (p38, p48); they do not apply where Article 31 protects the person (not declared). _(SRC-001 p38; SRC-001 p40; SRC-001 p47; SRC-001 p48)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Declared that asylum support has been repaid in full (p39). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Many details of the refugee settlement pathways (when the routes start, how existing time counts, public funds and repayment, Article 31) will be set out before implementation. This result only helps to understand the announced policy; for your own case, please seek advice from a regulated immigration adviser.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Core Protection and Protection Work and Study have not been introduced and their start dates are not set (PD-034); this tool counts from the dates of the permissions entered. Whether and how refugee time before their introduction counts is inconsistent in the response and the details are still to be set out (PD-029, PD-043).
- The details of refugees’ repayment obligations and safeguards are to be set out before implementation (PD-031); repayment follows what you declared.
- The earliest application date is projected on the basis that residence continues from 2027-03-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P45-INDIVIDUAL-A

**Individual A: existing care worker meeting the requirements**

Application date: 2028-04-06.

- Born 1988-04-12 (aged 39 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2023-04-06 to 2026-04-05, salary £30,000 — role MAIN, socCode 6135.
- Permission: SKILLED_WORKER from 2026-04-06 to 2029-04-05, salary £30,000 — role MAIN, socCode 6135.
- No absences from the UK.
- Income: 2023-24 £30,000; 2024-25 £30,000; 2025-26 £30,000; 2026-27 £30,000; 2027-28 £30,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2028-04-06.

Decisive rules:

- `CL-SW-RESIDENCE-5Y` 5 continuous years as a Skilled Worker — **PASS**. Continuous permission counting towards Skilled Worker settlement (SW 21.2) since 2023-04-06: 5 years completed. _(SRC-004 SW 21.1; SRC-004 SW 21.2; SRC-004 SW 22.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **PASS**. Under SW 24.3 row D (the job is on the Immigration Salary List, and continuous Skilled Worker permission since 2023-04-06, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £25,000; the current salary of £30,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **PASS**. Under SW 24.3 row D, Appendix Skilled Occupations Table 2aa gives a going rate of £25,000 for SOC 6135 (Care workers and home carers); the current salary of £30,000 meets it. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B2 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; SOC 6135 is in the list’s occupation table, so the job is derived to be on the list from its occupation code. The list’s job / region restrictions (criteria) are not checked; a declaration in the questionnaire overrides this. The list entry’s removal date is 2028-07-22, compared with the date of application.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2028-04-06; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2023-04-06: 5 full years by 2028-04-06. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **PASS**. Entered the care worker route on 2023-04-06, before the cut-off of 2025-05-12, with a salary of £30,000 that reaches £25,000: the 5-year qualifying period is retained. The strengthened minimum requirements, such as criminality and B2 English, still apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_

Failing or unknown checks:

- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-EARNINGS-5Y`, `ES-BRITISH-CONNECTION`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- The response does not say how to choose when someone qualifies for both a transitional arrangement and a standard pathway; this result takes the shortest pathway whose conditions are met. The applicant may be able to choose a more favourable arrangement and should seek regulated advice.
- Continuous Skilled Worker permission since 2023-04-06, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The cut-off is the Immigration White Paper publication date, 2025-05-12 (PD-035). For continuous care worker permission that started before the cut-off, the start date is used as a proxy for route entry, with occupation identified by SOC 2020 6135 / 6136 (PD-036).
- The transitional arrangements also require the sponsorship and employment requirements to be met (p42); this tool does not check them.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P45-INDIVIDUAL-B

**Individual B: existing care worker not meeting the requirements**

Application date: 2028-04-06.

- Born 1988-04-12 (aged 39 on the application date), nationality IND.
- Permission: SKILLED_WORKER from 2023-04-06 to 2026-04-05, salary £20,000 — role MAIN, socCode 6135.
- Permission: SKILLED_WORKER from 2026-04-06 to 2029-04-05, salary £20,000 — role MAIN, socCode 6135.
- No absences from the UK.
- Income: 2023-24 £20,000; 2024-25 £20,000; 2025-26 £20,000; 2026-27 £20,000; 2027-28 £20,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2033-03-09.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B2 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2023-04-06: expected to complete 10 years on 2033-04-06; the earliest projected application date for the residence requirement is 2033-03-09 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Failing or unknown checks:

- `CL-SW-SALARY` Skilled Worker settlement salary (general salary) — **FAIL**. Under SW 24.3 row D (the job is on the Immigration Salary List, and continuous Skilled Worker permission since 2023-04-06, before 2024-04-04, with the application before 2030-04-04 (SW 4.2(b)(ii))), the general salary threshold is £25,000; the current salary of £20,000 is below it. _(SRC-004 SW 24.3; SRC-004 SW 4.2(b); SRC-004 SW A1.1; SRC-017 Table 3; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_
- `CL-SW-GOING-RATE` Skilled Worker settlement salary (going rate) — **FAIL**. Under SW 24.3 row D, Appendix Skilled Occupations Table 2aa gives a going rate of £25,000 for SOC 6135 (Care workers and home carers); the current salary of £20,000 is below the going rate. _(SRC-004 SW 24.3; SRC-004 SW 6.1; SRC-004 SW 14.4; SRC-017 Tables 1, 1a, 2, 2aa, 2a, 2b; SOC 2020 rows; Going rate columns; SRC-019 Unnumbered introductory paragraph; occupation table; SOC 2020 rows)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; SOC 6135 is in the list’s occupation table, so the job is derived to be on the list from its occupation code. The list’s job / region restrictions (criteria) are not checked; a declaration in the questionnaire overrides this. The list entry’s removal date is 2028-07-22, compared with the date of application.
- “Granted under the rules in place before 2024-04-04” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2023-04-06, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2033-04-06; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2023-04-06: 5 full years by 2028-04-06. Not enough residence yet for the 10-year pathway; 10 years are completed on 2033-04-06. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 5 of the 7 tax years 2021-22 to 2027-28; 5 needed; earnings not provided for 2 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2024-25 to 2027-28; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **FAIL**. Earnings reached £50,271 in 0 of the 5 tax years 2023-24 to 2027-28; 3 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. Salary of £20,000 is below the £25,000 required, so settlement on this basis is unavailable after 5 years. A further 5-year Health and Care visa can be applied for once, only for genuine work in the sector, before applying again for settlement (p43; p45 Individual B). _(SRC-001 p42–p43, Care workers; p45, Individual B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Continuous Skilled Worker permission since 2023-04-06, before 2024-04-04, so in the “pre-April 2024 cohort”: permission can be extended under the existing salary requirements until 2035 (p44; exact dates not set, PD-040). This tool calculates the settlement pathway under the standard pathways.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The cut-off is the Immigration White Paper publication date, 2025-05-12 (PD-035). For continuous care worker permission that started before the cut-off, the start date is used as a proxy for route entry, with occupation identified by SOC 2020 6135 / 6136 (PD-036).
- The earliest application date is projected on the basis that residence continues from 2023-04-06, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## ES-OFFICIAL-P45-INDIVIDUAL-C

**Individual C: care worker switching after the transitional cutoff**

Application date: 2035-06-06.

- Born 1988-04-12 (aged 47 on the application date), nationality IND.
- Permission: GRADUATE from 2024-06-06 to 2025-06-05 — role MAIN.
- Permission: SKILLED_WORKER from 2025-06-06 to 2028-06-05, salary £30,000 — role MAIN, socCode 6135.
- Permission: SKILLED_WORKER from 2028-06-06 to 2031-06-05, salary £30,000 — role MAIN, socCode 6135.
- Permission: SKILLED_WORKER from 2031-06-06 to 2034-06-05, salary £30,000 — role MAIN, socCode 6135.
- Permission: SKILLED_WORKER from 2034-06-06 to 2037-06-05, salary £30,000 — role MAIN, socCode 6135.
- No absences from the UK.
- Income: 2028-29 £30,000; 2029-30 £30,000; 2030-31 £30,000; 2031-32 £30,000; 2032-33 £30,000; 2033-34 £30,000; 2034-35 £30,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2035-06-06.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B2 required for settlement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **PASS**. Continuous lawful residence since 2024-06-06: 10 years completed. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Other pathways not taken: `CL-SW-SALARY`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.
- SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.
- Not declared whether the job is on the Immigration Salary List; the list entry for SOC 6135 has a removal date of 2028-07-22, before the date of application, so the job is treated as not on the list.
- SOC 6135 is on the Health and Care ASHE salary job list in SW A1.1; the employer is assumed to be of a type listed in SW A1.1(a)–(f).
- The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2035-06-06; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Skilled Worker, is in the Core permission / High talent groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2025-06-06: 10 full years by 2035-06-06. The earlier time on Graduate does not count towards settlement; this tool assumes that time on a non-counting route also breaks continuous residence, rather than only being deducted from the qualifying period (PD-053). _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **PASS**. Earnings reached £12,571 in 7 of the 7 tax years 2028-29 to 2034-35; 5 needed. _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **UNKNOWN**. Care worker permission starts on 2025-06-06, on or after the 2025-05-12 cut-off. That date alone cannot rule out an application before the cut-off. Which date governs across the cut-off (application, grant or arrival) remains unsettled. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Other pathways not taken: `ES-EARNINGS-3Y`, `ES-EARNINGS-5Y`, `ES-BRITISH-CONNECTION`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- The earlier time on Graduate does not count towards settlement; this tool assumes that time on a non-counting route also breaks continuous residence, rather than only being deducted from the qualifying period (PD-053).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).
- The cut-off is the Immigration White Paper publication date, 2025-05-12 (PD-035). For continuous care worker permission that started before the cut-off, the start date is used as a proxy for route entry, with occupation identified by SOC 2020 6135 / 6136 (PD-036).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-HKBNO-FIVE-YEARS

**Hong Kong BN(O) Status Holder: 5 years completed on the day**

Application date: 2026-02-01.

- Born 1985-06-20 (aged 40 on the application date), nationality HKG.
- Permission: HONG_KONG_BNO from 2021-02-01 to 2026-01-31 — role MAIN.
- Permission: HONG_KONG_BNO from 2026-02-01 to 2028-07-31 — role MAIN.
- No absences from the UK.
- English: cefrLevel B1. Life in the UK test: passed true.
- governmentDebt: outstanding false.

**Short circuit — OUTSIDE_FRAMEWORK:** The current route is outside the Earned Settlement framework and keeps the existing settlement arrangements for that group (SRC-001 p25–p26). The strengthened criminality and B2 English requirements still apply, unless an existing exemption or protection applies.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-02-01.

Decisive rules:

- `CL-HKBNO-RESIDENCE-5Y` 5 continuous years on the Hong Kong BN(O) route — **PASS**. Continuous Hong Kong BN(O) permission since 2021-02-01: 5 years completed (HK 62.1(b)). _(SRC-020 HK 62.1; SRC-020 HK 63.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B1, which meets the B1 required for settlement (Appendix Hong Kong BN(O) HK 60.1; the B2 introduced by HC 1691 does not cover this Appendix, EM 5.60). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (HK 61.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **REQUIRES_REGULATED_REVIEW**.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **FAIL**. English at B1, below the B2 required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **UNKNOWN**. The current route, Hong Kong BN(O), is outside the Earned Settlement framework and keeps the existing settlement arrangements for that group. The strengthened criminality and B2 English requirements still apply, unless an existing exemption or protection applies. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **UNKNOWN**. The current route, Hong Kong BN(O), is outside the Earned Settlement framework, so residence is not calculated under it. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2021-22 to 2024-25; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2020-21 to 2024-25; 3 needed; earnings not provided for 5 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 0 of the 7 tax years 2018-19 to 2024-25; 5 needed; earnings not provided for 7 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-GLOBAL-TALENT-THREE-YEARS

**Global Talent, exceptional talent: 3 years completed on the day**

Application date: 2026-11-04.

- Born 1990-03-12 (aged 36 on the application date), nationality USA.
- Permission: GLOBAL_TALENT from 2023-11-04 to 2028-11-03 — role MAIN, globalTalentEndorsement ARTS_COUNCIL_ENGLAND, globalTalentCriteria EXCEPTIONAL_TALENT.
- No absences from the UK.
- Income: 2023-24 £55,000; 2024-25 £55,000; 2025-26 £55,000. Tax years not listed: not provided.
- English: cefrLevel B1. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 3 years; earliest date 2026-11-04.

Decisive rules:

- `CL-GT-RESIDENCE` Global Talent: 3 or 5 continuous years — **PASS**. 3-year qualifying period under GT 11.1(b); continuous qualifying permission (GT 11.3) since 2023-11-04: 3 years completed. _(SRC-021 GT 11.1; SRC-021 GT 11.2; SRC-021 GT 11.3; SRC-021 GT 12.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B1, which meets the B1 required for settlement (Appendix Global Talent GT 13.1(a), applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (GT 14.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines main applicant permission on the routes listed in GT 11.3: Global Talent, Innovator Founder, Skilled Worker, T2 Minister of Religion, International Sportsperson and Scale-up. Tier 1 and Representative of an Overseas Business cannot be entered in this tool and are not counted.
- The endorsement is taken as not withdrawn (GT 10.1) and the applicant as having earned money in the field of their endorsement or prize during their last permission (GT 10.2); this tool does not check these.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; route group CORE_PERMISSION.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **FAIL**. English at B1, below the B2 required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions. _(SRC-001 p21)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **FAIL**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 1 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 3 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-FAMILY-PARTNER-FIVE-YEARS

**Partner of a British citizen: 5-year route completed on the day**

Application date: 2026-03-01.

- Born 1992-09-08 (aged 33 on the application date), nationality PHL.
- Permission: FAMILY_PARTNER_OR_PARENT from 2021-03-01 to 2023-08-31 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- Permission: FAMILY_PARTNER_OR_PARENT from 2023-09-01 to 2026-02-28 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- Permission: FAMILY_PARTNER_OR_PARENT from 2026-03-01 to 2028-08-31 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- No absences from the UK.
- Income: 2024-25 £14,000 (+ partner £8,000). Tax years not listed: not provided.
- English: cefrLevel B1. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-03-01.

Decisive rules:

- `CL-FAMILY-RESIDENCE` Continuous residence on the family partner route — **PASS**. 5-year partner route: continuous partner permission since 2021-03-01: 5 years completed (E-ILRP.1.3). _(SRC-022 SETF 3.1; SRC-022 SETF 3.2; SRC-022 SETF 4.1; SRC-024 E-ILRP.1.3; SRC-024 E-ILRP.1.4; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-FAMILY-RELATIONSHIP` Partner is a British citizen or settled — **PASS**. The partner is a British citizen (E-LTRP.1.2(a)). _(SRC-022 SETF 7.1; SRC-022 SETF 7.2; SRC-022 SETF 7.3; SRC-024 R-ILRP.1.1(a); SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.1.2)_
- `CL-FAMILY-FINANCIAL` Financial requirement on the 5-year partner route — **PASS**. Combined earnings of the applicant and partner in the 2024-25 tax year are £22,000, which meets the £18,600 of the transitional requirement (E-LTRP.3.5, E-LTRP.3.7(a); 0 children, capped at £29,000). _(SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.3.1; SRC-024 E-LTRP.3.2; SRC-024 E-LTRP.3.3; SRC-024 E-LTRP.3.5; SRC-024 E-LTRP.3.7; SRC-024 E-LTRP.3.8)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B1, which meets the B1 required for settlement (Appendix KoLL 2.2, through E-ILRP.1.6; applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (Appendix KoLL 2.3, through E-ILRP.1.6). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- E-ILRP.1.3 counts only partner permission on the 5-year route (D-ECP.1.1 / D-LTRP.1.1), not time as a fiancé(e); each period is taken to be on the 5-year route with the same partner (E-ILRP.1.4).
- This assumes your partner is also in the UK on the date you apply (Appendix FM R-ILRP.1.1(a)).
- The relationship is taken as genuine and subsisting, with both intending to live together permanently (E-LTRP.1.7–E-LTRP.1.10); this tool does not check these.
- Whether the transitional requirement applies is judged by whether the continuous partner permission started before 2024-04-11 (E-LTRP.3.5 looks at the date of the first application, so an application made before that date and granted after it also qualifies); children are those listed under relationships with another status.
- Savings are the combined cash savings as declared; the holding period and evidence rules in Appendix FM-SE and the kinds of income and savings sources in E-LTRP.3.2 are not checked; any benefit the partner receives is taken as declared; the accommodation requirement (E-LTRP.3.4, E-LTRP.3.9) and EX.1 are not modelled.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; route group CORE_PERMISSION.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **FAIL**. English at B1, below the B2 required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions. _(SRC-001 p21)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2021-22 to 2024-25; 3 needed; earnings not provided for 3 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2020-21 to 2024-25; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 1 of the 7 tax years 2018-19 to 2024-25; 5 needed; earnings not provided for 6 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-REFUGEE-FIVE-YEARS

**Refugee: 5 years with protection completed on the day**

Application date: 2026-03-01.

- Born 1992-04-10 (aged 33 on the application date), nationality SDN.
- Permission: CORE_PROTECTION from 2021-03-01 to 2026-03-31 — role MAIN.
- No absences from the UK.
- English: not provided. Life in the UK test: not provided.
- governmentDebt: outstanding false.
- asylumSupportRepayment: NOT_REQUIRED.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-03-01.

Decisive rules:

- `CL-PROTECTION-RESIDENCE-5Y` 5 continuous years with refugee status or humanitarian protection — **PASS**. Continuously in the UK with refugee status or humanitarian protection since 2021-03-01: 5 years completed (STP 3.1). _(SRC-023 STP 1.3; SRC-023 STP 3.1)_
- `CL-PROTECTION-STATUS` Protection status not revoked or renounced — **PASS**. No revocation or renunciation declared, so refugee status or humanitarian protection is taken as still held (STP 4.1). _(SRC-023 STP 4.1; SRC-023 STP 4.2; SRC-023 STP 5.2)_

Failing or unknown checks:

- `CL-ENGLISH` Settlement English requirement — **UNKNOWN**. English level not provided; settlement requires CEFR B1 (Appendix Settlement Protection sets no English requirement for settlement; this level applies only to the 10-year Long Residence pathway, PD-072). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **UNKNOWN**. Not provided whether the Life in the UK test has been passed (Appendix Settlement Protection sets no Life in the UK requirement; this applies only to the 10-year Long Residence pathway, PD-072). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- STP 1.3 lists the permission by the date of the asylum application: refugee or humanitarian protection permission for applications before 2022-06-28, and refugee permission to stay for later ones. This tool does not tell refugee status and humanitarian protection apart, and assumes you hold a listed permission. Humanitarian protection following an asylum application made on or after 2022-06-28 is not listed in STP 1.3(b) (PD-073).
- A safe return review is carried out when the settlement application is considered (STP 4.2), checking whether personal circumstances or country conditions have changed so that protection could be revoked or not renewed; its outcome cannot be predicted.
- If the settlement requirements are not met but the person is still entitled to refugee status or humanitarian protection, a further period of at least 30 months of protection permission is granted (STP 5.2).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 20 years; earliest date 2041-03-01; route group PROTECTION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **UNKNOWN**. English level not provided. Earned Settlement requires CEFR B2 (existing exemptions are retained). _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **UNKNOWN**. Not provided whether the Life in the UK test has been passed. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Core Protection, is in the Protection group and counts towards settlement under the refugee pathways (Table 2); time on protection routes cannot be combined with time on work or family routes (p25). _(SRC-001 p25; SRC-001 p47; SRC-001 p48)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **FAIL**. Continuous residence counting towards settlement since 2021-03-01: 5 full years by 2026-03-01. Not enough residence yet for the 20-year pathway; 20 years are completed on 2041-03-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-PROTECTION-PATHWAY` Refugee settlement pathway and qualifying period — **PASS**. Core Protection: the 20-year pathway (p38, p47). Moving into sustained work, education or training and onto Protection Work and Study gives a 10-year pathway counted from the move (p38). _(SRC-001 p38; SRC-001 p40; SRC-001 p47)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Declared that no asylum support was received or none needs to be repaid. _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Many details of the refugee settlement pathways (when the routes start, how existing time counts, public funds and repayment, Article 31) will be set out before implementation. This result only helps to understand the announced policy; for your own case, please seek advice from a regulated immigration adviser.
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Core Protection and Protection Work and Study have not been introduced and their start dates are not set (PD-034); this tool counts from the dates of the permissions entered. Whether and how refugee time before their introduction counts is inconsistent in the response and the details are still to be set out (PD-029, PD-043).
- The earliest application date is projected on the basis that residence continues from 2021-03-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-UK-ANCESTRY-FIVE-YEARS

**UK Ancestry: 5 years completed on the day**

Application date: 2026-09-01.

- Born 1994-02-14 (aged 32 on the application date), nationality AUS.
- Permission: UK_ANCESTRY from 2021-09-01 to 2026-08-31 — role MAIN.
- Permission: UK_ANCESTRY from 2026-09-01 to 2031-08-31 — role MAIN.
- No absences from the UK.
- English: cefrLevel B1. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-09-01.

Decisive rules:

- `CL-ANCESTRY-RESIDENCE-5Y` 5 continuous years on the UK Ancestry route — **PASS**. Continuous UK Ancestry permission as the main applicant since 2021-09-01: 5 years completed (UKA 13.1). _(SRC-026 UKA 10.3; SRC-026 UKA 12.1; SRC-026 UKA 13.1; SRC-026 UKA 14.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B1, which meets the B1 required for settlement (Appendix UK Ancestry UKA 15.1(a), applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (UKA 16.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Assumes you are still a Commonwealth citizen on the date of application (UKA 10.3) and still meet UKA 4.1–6.1 (a grandparent born in the UK or Islands, adequate maintenance and accommodation without recourse to public funds, and able and intending to work in the UK, UKA 12.1).
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; route group CORE_PERMISSION.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **FAIL**. English at B1, below the B2 required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions. _(SRC-001 p21)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2021-22 to 2025-26; 3 needed; earnings not provided for 5 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 0 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 7 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-INNOVATOR-FOUNDER-THREE-YEARS

**Innovator Founder: 3 years completed on the day, two criteria met**

Application date: 2026-05-01.

- Born 1988-11-03 (aged 37 on the application date), nationality NGA.
- Permission: INNOVATOR_FOUNDER from 2023-05-01 to 2026-04-30 — role MAIN.
- Permission: INNOVATOR_FOUNDER from 2026-05-01 to 2029-04-30 — role MAIN, innovatorSettlementCriteria ["INVESTMENT","JOBS"].
- No absences from the UK.
- English: not provided. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 3 years; earliest date 2026-05-01.

Decisive rules:

- `CL-INNOVATOR-RESIDENCE-3Y` 3 continuous years as an Innovator Founder — **PASS**. Continuous Innovator Founder permission since 2023-05-01: 3 years completed (INNF 18.1). _(SRC-027 INNF 18.1; SRC-027 INNF 19.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-INNOVATOR-ENDORSEMENT` Business criteria for the Innovator Founder settlement endorsement — **PASS**. The business has met 2 of the criteria (INNF 17.1(f)(i), INNF 17.1(f)(vi)), at least the 2 required by INNF 17.1(f). _(SRC-027 INNF 15.2(e); SRC-027 INNF 17.1; SRC-027 INNF 17.2; SRC-027 INNF 17.3; SRC-027 INNF 17.4)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (INNF 20.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Failing or unknown checks:

- `CL-ENGLISH` Settlement English requirement — **UNKNOWN**. English level not provided; settlement requires CEFR B1 (Appendix Innovator Founder sets no English requirement for a main applicant’s settlement, INNF 15.1–21.6; this level applies only to the 10-year Long Residence pathway). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Assumes the endorsing body will confirm INNF 17.1(a)–(e) (significant achievements against the business plan, registration with Companies House with you as a director or member, active trading, sustainability for at least the next 12 months, and your key role in day-to-day management); the endorsement letter must be issued no more than 3 months before the application and not withdrawn (INNF 15.2(e)). That team members cannot share a criterion (INNF 17.3) and that jobs must have existed for 12 months with at least 30 hours a week (INNF 17.4) are not checked.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **INSUFFICIENT_INFORMATION**; route group CORE_PERMISSION.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **UNKNOWN**. English level not provided. Earned Settlement requires CEFR B2 (existing exemptions are retained). _(SRC-001 p21)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2021-22 to 2025-26; 3 needed; earnings not provided for 5 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 0 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 7 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_
- `ES-HIGHEST-TALENT` Highest Talent Group eligibility — **UNKNOWN**. Table 1 lists the Highest Talent Group as a separate route to the three-year pathway. Eligibility is subject to review pending the MAC report, and holding a high talent permission alone does not establish eligibility. _(SRC-001 p23 note 10; p46 Table 1 note 16)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-PRIVATE-LIFE-YOUNG-ADULT-FIVE-YEARS

**Private Life young adult (half-life test): 5 years completed on the day**

Application date: 2026-07-01.

- Born 2000-03-15 (aged 26 on the application date), nationality PAK.
- Permission: FAMILY_AND_PRIVATE_LIFE from 2021-07-01 to 2023-12-31 — role MAIN, privateLifeRoute YOUNG_ADULT.
- Permission: FAMILY_AND_PRIVATE_LIFE from 2024-01-01 to 2026-06-30 — role MAIN, privateLifeRoute YOUNG_ADULT.
- Permission: FAMILY_AND_PRIVATE_LIFE from 2026-07-01 to 2028-12-31 — role MAIN, privateLifeRoute YOUNG_ADULT.
- No absences from the UK.
- English: cefrLevel B1. Life in the UK test: passed true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-07-01.

Decisive rules:

- `CL-PRIVATE-LIFE-RESIDENCE` Private Life: 5 or 10 continuous years — **PASS**. 5-year qualifying period under PL 14.1; continuous qualifying permission (PL 14.3) since 2021-07-01: 5 years completed. _(SRC-028 PL 14.1; SRC-028 PL 14.2; SRC-028 PL 14.3; SRC-028 PL 14.4; SRC-028 PL 15.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B1, which meets the B1 required for settlement (Appendix Private Life PL 16.1(a), applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (PL 17.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The continuous period combines the permissions listed in PL 14.3: Appendix FM partner, parent and child permission, and Private Life permission. Leave Outside the Rules on Article 8 grounds (PL 14.3(e)) cannot be told apart from other such leave and is not counted. PL 13 (immediate settlement for a child born in the UK after 7 years of continuous residence), PL 14.1A / PL 14.2(b) / PL 14.2A (transitional cases with Appendix FM or Leave Outside the Rules permission before 2022-06-20) and PL 12.3–12.5 (suitability grounds that require 10 years) are not modelled.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**; route group FAMILY_AND_PRIVATE_LIFE.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **FAIL**. English at B1, below the B2 required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions. _(SRC-001 p21)_
- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2022-23 to 2025-26; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2021-22 to 2025-26; 3 needed; earnings not provided for 5 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 0 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 7 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **FAIL**. Not on a British citizen family route or UK Ancestry, so this 5-year pathway does not apply. _(SRC-001 p18)_
- `ES-TRANSITIONAL-CARE-WORKER` Care worker transitional arrangements (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa as a care worker (SOC 2020 6135 / 6136), so the care worker transitional arrangements do not apply. _(SRC-001 p42; SRC-001 p43; SRC-012 cover; SRC-001 p42; SRC-004 SW 6.1B)_
- `ES-TRANSITIONAL-HEALTH-EDUCATION` Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain 5 years) — **FAIL**. The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply. _(SRC-001 p44; SRC-001 p42; SRC-001 p46; SRC-012 cover; SRC-017 Table 3a)_
- `ES-PUBLIC-SERVICE` 5 years in public service occupations (5-year pathway) — **FAIL**. The current job is not in the Annex C public service occupations list, so this 5-year pathway does not apply. _(SRC-001 p16; SRC-001 p46 fn 17; SRC-001 p58; SRC-001 p59; SRC-004 SW 16.1)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-HKBNO-CHILD-WITH-PARENT

**Hong Kong BN(O) child under 18 settling with the parent**

Application date: 2026-02-01.

- Born 2014-09-01 (aged 11 on the application date), nationality HKG.
- Permission: HONG_KONG_BNO from 2021-02-01 to 2026-07-31 — role DEPENDANT, dependantOf PARENT.
- No absences from the UK.
- English: not provided. Life in the UK test: not provided.
- relationships: type PARENT, otherPartyStatus OTHER.

Principal (the person they are a dependant of):

- Born 1984-03-12 (aged 41 on the application date), nationality HKG.
- Permission: HONG_KONG_BNO from 2021-02-01 to 2026-07-31 — role MAIN.
- No absences from the UK.
- English: cefrLevel B1. Life in the UK test: passed true.
- relationships: type CHILD, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

**Short circuit — OUTSIDE_FRAMEWORK:** The current route is outside the Earned Settlement framework and keeps the existing settlement arrangements for that group (SRC-001 p25–p26). The strengthened criminality and B2 English requirements still apply, unless an existing exemption or protection applies.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-02-01.

Decisive rules:

- `CL-HKBNO-DEPENDANT` Hong Kong BN(O) child or adult dependant relative settling with the principal applicant — **PASS**. Under 18 (HK 57.1); settling with the principal applicant, who can apply on 2026-02-01, when they can apply together (HK 57.3(a)); the child has no residence requirement of their own (HK 62.1(b)). _(SRC-020 HK 57.1; SRC-020 HK 57.2; SRC-020 HK 57.3; SRC-020 HK 57.4; SRC-020 HK 58.1; SRC-020 HK 59.1; SRC-020 HK 62.1)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the English requirement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The other parent must be granted settlement at the same time, already be settled or be a British citizen, unless the principal applicant is the sole surviving parent, has sole responsibility or similar (HK 57.4); the care arrangements (HK 58.1, CHI 2.1) are assumed to be met. Age is taken on the date of application: if the child is 18 or over by the projected date, they will need 5 years of their own then (HK 62.1(b)).
- While the principal applicant has not settled, only being granted at the same time as them is assessed; if they have already settled, enter their settlement date and route in the principal applicant’s details.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **REQUIRES_REGULATED_REVIEW**.

Failing or unknown checks:

- `ES-ROUTE-GROUP` Current route counts towards settlement — **UNKNOWN**. The current route, Hong Kong BN(O), is outside the Earned Settlement framework and keeps the existing settlement arrangements for that group. The strengthened criminality and B2 English requirements still apply, unless an existing exemption or protection applies. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **UNKNOWN**. The current route, Hong Kong BN(O), is outside the Earned Settlement framework, so residence is not calculated under it. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **UNKNOWN**. The principal applicant’s circumstances need a regulated adviser’s assessment, so whether the dependant can settle with them cannot be determined either. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-GLOBAL-TALENT-PARTNER-FIVE-YEARS

**Global Talent dependent partner: 5 years after the principal settled**

Application date: 2026-06-01.

- Born 1987-08-14 (aged 38 on the application date), nationality USA.
- Permission: GLOBAL_TALENT from 2021-06-01 to 2026-05-31 — role DEPENDANT, dependantOf PARTNER.
- Permission: GLOBAL_TALENT from 2026-06-01 to 2028-05-31 — role DEPENDANT, dependantOf PARTNER.
- No absences from the UK.
- English: cefrLevel B1. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus SETTLED.
- governmentDebt: outstanding false.

Principal (the person they are a dependant of):

- Born 1986-05-20 (aged 40 on the application date), nationality USA.
- Permission: GLOBAL_TALENT from 2021-06-01 to 2024-05-31 — role MAIN, globalTalentEndorsement ARTS_COUNCIL_ENGLAND, globalTalentCriteria EXCEPTIONAL_TALENT.
- No absences from the UK.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus OTHER.
- governmentDebt: outstanding false.
- settled: date 2024-06-01, route GLOBAL_TALENT.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2026-06-01.

Decisive rules:

- `CL-GT-DEPENDANT` Global Talent dependent partner or child settling with the principal applicant — **PASS**. The principal applicant settled as a Global Talent on 2024-06-01, when this person held their dependent partner permission (GT 27.1(b)); they need 5 continuous years of their own (GT 30.1), so they can apply from 2026-06-01. _(SRC-021 GT 27.1; SRC-021 GT 27.2; SRC-021 GT 27.3; SRC-021 GT 27.4; SRC-021 GT 29A.1; SRC-021 GT 30.1; SRC-021 GT 31.1; SRC-018 CHI 1.1; SRC-018 CHI 1A.1; SRC-018 CHI 2.1; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B1, which meets the B1 required for settlement (Appendix Global Talent GT 32.1(a), applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (GT 33.1). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Only continuous Global Talent dependant permission is counted, assuming all of it was as the same principal applicant’s dependent partner; Appendix Relationship with Partner (GT 27.4) is not checked.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**.

Failing or unknown checks:

- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **FAIL**. English at B1, below the B2 required by Earned Settlement. This is a mandatory requirement and cannot be offset by earnings or other contributions. _(SRC-001 p21)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 0 of the 7 tax years 2019-20 to 2025-26; 5 needed; earnings not provided for 7 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_
- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **UNKNOWN**. The principal applicant settled on 2024-06-01. Earned Settlement only covers dependants settling at the same time as the principal applicant, or a partner who joined later completing the same qualifying period (p29–p31); it does not say how a dependant settles after the principal applicant has settled. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-FAMILY-CHILD-TEN-YEAR

**Child of a 10-year route partner settling with the parent**

Application date: 2026-03-01.

- Born 2012-07-15 (aged 13 on the application date), nationality PHL.
- Permission: FAMILY_PARTNER_OR_PARENT from 2019-03-01 to 2026-08-31 — role DEPENDANT, dependantOf PARENT.
- No absences from the UK.
- English: not provided. Life in the UK test: not provided.
- relationships: type PARENT, otherPartyStatus BRITISH_CITIZEN.

Principal (the person they are a dependant of):

- Born 1985-01-30 (aged 41 on the application date), nationality PHL.
- Permission: FAMILY_PARTNER_OR_PARENT from 2016-03-01 to 2026-08-31 — role MAIN, familyPermission PARTNER_TEN_YEAR.
- No absences from the UK.
- English: cefrLevel B1. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN; type CHILD, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 10 years; earliest date 2026-03-01.

Decisive rules:

- `CL-FAMILY-CHILD` Child of an Appendix FM partner settling with the principal applicant — **PASS**. Under 18 on the date of application (SETF 13.1); settling with the principal applicant, who can apply on 2026-03-01, when they can apply together (SETF 12.1(a)); the child has no residence requirement of their own. _(SRC-022 SETF 10.3; SRC-022 SETF 12.1; SRC-022 SETF 12.2; SRC-022 SETF 13.1; SRC-022 SETF 13.2; SRC-022 SETF 14.1; SRC-024 D-LTRC.1.1; SRC-029 para 298(i); SRC-029 para 298(ii); SRC-029 para 298(iii); SRC-029 para 298(iv); SRC-029 para 298(v); SRC-029 para 298(vii); SRC-029 para 298A)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the English requirement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- The other parent must be granted settlement at the same time, already be settled or be a British citizen, unless the principal applicant is the sole surviving parent, has sole responsibility or similar (SETF 12.2); not leading an independent life at 16 or over (SETF 13.2) and the care arrangements (SETF 14.1) are assumed to be met; children born in the UK (SETF 10.3) and the 10-year exceptions in SETF 11.3–11.6 are not modelled.
- While the principal applicant has not settled, only being granted at the same time as them is assessed; if they have already settled, enter their settlement date and route in the principal applicant’s details.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**.

Failing or unknown checks:

- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **FAIL**. The principal applicant does not currently meet the Earned Settlement requirements, so the dependant cannot settle with them; reassess once the principal applicant meets them. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-FAMILY-FIVE-YEAR-CHILD-PROJECTED

**Child of a 5-year route partner, a day before the parent qualifies**

Application date: 2026-11-05.

- Born 2014-04-10 (aged 12 on the application date), nationality IND.
- Permission: FAMILY_PARTNER_OR_PARENT from 2021-11-06 to 2026-11-05 — role DEPENDANT, dependantOf PARENT.
- No absences from the UK.
- English: not provided. Life in the UK test: not provided.
- relationships: type PARENT, otherPartyStatus BRITISH_CITIZEN.

Principal (the person they are a dependant of):

- Born 1990-05-12 (aged 36 on the application date), nationality IND.
- Permission: FAMILY_PARTNER_OR_PARENT from 2021-11-06 to 2024-05-05 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- Permission: FAMILY_PARTNER_OR_PARENT from 2024-05-06 to 2026-11-05 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- No absences from the UK.
- Income: 2025-26 £30,000. Tax years not listed: not provided.
- English: cefrLevel B1. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN; type CHILD, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 5 years; earliest date 2026-11-06.

Decisive rules:

- `CL-FAMILY-CHILD` Child of an Appendix FM partner settling with the principal applicant — **PASS**. Under 18 on the date of application (para 298(ii)(a)); settling with the principal applicant, who can be granted settlement on 2026-11-06, when they apply together (para 298(i)(d)); the child has no qualifying period of their own. _(SRC-022 SETF 10.3; SRC-022 SETF 12.1; SRC-022 SETF 12.2; SRC-022 SETF 13.1; SRC-022 SETF 13.2; SRC-022 SETF 14.1; SRC-024 D-LTRC.1.1; SRC-029 para 298(i); SRC-029 para 298(ii); SRC-029 para 298(iii); SRC-029 para 298(iv); SRC-029 para 298(v); SRC-029 para 298(vii); SRC-029 para 298A)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the English requirement. _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Under 18 or aged 65 or over on the date of application: exempt from the Life in the UK test. _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Failing or unknown checks:

- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2021-11-06: expected to complete 10 years on 2031-11-06; the earliest projected application date for the residence requirement is 2031-10-09 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Para 298(i): the principal applicant has not settled, so only (d), being granted settlement at the same time as them, applies; the other parent is assumed not to have, and not to be granted, limited leave in the UK, for example as the principal applicant’s British citizen or settled partner; (e), a close relative, is not modelled.
- Age is taken on the date of application: if the child is 18 or over by the projected date, the English and Life in the UK requirements in para 298(vii) apply then.
- Not leading an independent life, being unmarried and not having formed an independent family unit (para 298(iii)), and adequate accommodation and maintenance from the parent without recourse to public funds (para 298(iv)–(v)), are assumed to be met.
- While the principal applicant has not settled, only being granted at the same time as them is assessed; if they have already settled, enter their settlement date and route in the principal applicant’s details.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2021-11-06, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**.

Failing or unknown checks:

- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **FAIL**. The principal applicant does not currently meet the Earned Settlement requirements, so the dependant cannot settle with them; reassess once the principal applicant meets them. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-FAMILY-FIVE-YEAR-ADULT-CHILD-ENGLISH

**Adult child of a 5-year route partner without an English level**

Application date: 2026-11-05.

- Born 2007-03-01 (aged 19 on the application date), nationality NGA.
- Permission: FAMILY_PARTNER_OR_PARENT from 2021-11-05 to 2027-05-04 — role DEPENDANT, dependantOf PARENT.
- No absences from the UK.
- English: not provided. Life in the UK test: passed true.
- relationships: type PARENT, otherPartyStatus BRITISH_CITIZEN.

Principal (the person they are a dependant of):

- Born 1980-09-03 (aged 46 on the application date), nationality NGA.
- Permission: FAMILY_PARTNER_OR_PARENT from 2021-11-05 to 2024-05-04 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- Permission: FAMILY_PARTNER_OR_PARENT from 2024-05-05 to 2027-05-04 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- No absences from the UK.
- Income: 2025-26 £30,000. Tax years not listed: not provided.
- English: cefrLevel B1. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN; type CHILD, otherPartyStatus OTHER.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **INSUFFICIENT_INFORMATION**.

Failing or unknown checks:

- `CL-ENGLISH` Settlement English requirement — **UNKNOWN**. English level not provided; settlement requires CEFR B1 (paragraph 298(vii) of Part 8 of the Immigration Rules, Appendix KoLL 2.2; applications before 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2021-11-05: expected to complete 10 years on 2031-11-05; the earliest projected application date for the residence requirement is 2031-10-08 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- Para 298(i): the principal applicant has not settled, so only (d), being granted settlement at the same time as them, applies; the other parent is assumed not to have, and not to be granted, limited leave in the UK, for example as the principal applicant’s British citizen or settled partner; (e), a close relative, is not modelled.
- Para 298(ii)(b): the current Appendix FM child permission is taken as granted with a view to settlement. If only the English or Life in the UK requirement in para 298(vii) is not met, limited leave may be granted under para 298A, but settlement is not.
- Not leading an independent life, being unmarried and not having formed an independent family unit (para 298(iii)), and adequate accommodation and maintenance from the parent without recourse to public funds (para 298(iv)–(v)), are assumed to be met.
- While the principal applicant has not settled, only being granted at the same time as them is assessed; if they have already settled, enter their settlement date and route in the principal applicant’s details.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_NOT_ELIGIBLE**.

Failing or unknown checks:

- `ES-DEBT` No outstanding government debt — **UNKNOWN**. Government debt not provided (NHS debt, unpaid tax and National Insurance, litigation costs owed to the Home Office and similar). _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **UNKNOWN**. English level not provided. Earned Settlement requires CEFR B2 (existing exemptions are retained). _(SRC-001 p21)_
- `ES-DEPENDANT-PATHWAY` Settle with the principal applicant (dependant) — **FAIL**. The principal applicant does not currently meet the Earned Settlement requirements, so the dependant cannot settle with them; reassess once the principal applicant meets them. _(SRC-001 p29; SRC-001 p30; SRC-001 p31)_

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- Current permission as a parent’s dependant is treated as retaining child-dependant status; the response does not say how this is determined (PD-059).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-FAMILY-FIVE-YEAR-SAVINGS-PASS

**Partner on the 5-year route: savings make up the income shortfall**

Application date: 2029-06-01.

- Born 1993-02-14 (aged 36 on the application date), nationality BRA.
- Permission: FAMILY_PARTNER_OR_PARENT from 2024-06-01 to 2026-11-30 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- Permission: FAMILY_PARTNER_OR_PARENT from 2026-12-01 to 2029-08-31 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- No absences from the UK.
- Income: 2028-29 £20,000. Tax years not listed: not provided.
- Cash savings: £25,000.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2029-06-01.

Decisive rules:

- `CL-FAMILY-RESIDENCE` Continuous residence on the family partner route — **PASS**. 5-year partner route: continuous partner permission since 2024-06-01: 5 years completed (E-ILRP.1.3). _(SRC-022 SETF 3.1; SRC-022 SETF 3.2; SRC-022 SETF 4.1; SRC-024 E-ILRP.1.3; SRC-024 E-ILRP.1.4; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-FAMILY-RELATIONSHIP` Partner is a British citizen or settled — **PASS**. The partner is a British citizen (E-LTRP.1.2(a)). _(SRC-022 SETF 7.1; SRC-022 SETF 7.2; SRC-022 SETF 7.3; SRC-024 R-ILRP.1.1(a); SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.1.2)_
- `CL-FAMILY-FINANCIAL` Financial requirement on the 5-year partner route — **PASS**. Combined earnings of the applicant and partner in the 2028-29 tax year are £20,000, below the £29,000 of the general requirement (E-LTRP.3.1(a)): a shortfall of £9,000; cash savings of £25,000 meet £16,000 plus the shortfall, £25,000 in all (E-LTRP.3.1(b); for settlement, E-ILRP.1.3(1A) disregards “2.5 times”). _(SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.3.1; SRC-024 E-LTRP.3.2; SRC-024 E-LTRP.3.3; SRC-024 E-LTRP.3.5; SRC-024 E-LTRP.3.7; SRC-024 E-LTRP.3.8)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B2 required for settlement (Appendix KoLL 2.2, through E-ILRP.1.6; applications from 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (Appendix KoLL 2.3, through E-ILRP.1.6). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Other pathways not taken: `CL-LR-RESIDENCE-10Y`.

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- E-ILRP.1.3 counts only partner permission on the 5-year route (D-ECP.1.1 / D-LTRP.1.1), not time as a fiancé(e); each period is taken to be on the 5-year route with the same partner (E-ILRP.1.4).
- This assumes your partner is also in the UK on the date you apply (Appendix FM R-ILRP.1.1(a)).
- The relationship is taken as genuine and subsisting, with both intending to live together permanently (E-LTRP.1.7–E-LTRP.1.10); this tool does not check these.
- Whether the transitional requirement applies is judged by whether the continuous partner permission started before 2024-04-11 (E-LTRP.3.5 looks at the date of the first application, so an application made before that date and granted after it also qualifies); children are those listed under relationships with another status.
- Savings are the combined cash savings as declared; the holding period and evidence rules in Appendix FM-SE and the kinds of income and savings sources in E-LTRP.3.2 are not checked; any benefit the partner receives is taken as declared; the accommodation requirement (E-LTRP.3.4, E-LTRP.3.9) and EX.1 are not modelled.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2029-06-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Family Partner or Parent, is in the Core permission / British connection groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2024-06-01: 5 full years by 2029-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **PASS**. Holds a family visa as the partner, parent or child of a British citizen, a recognised British connection: the 5-year pathway is available. _(SRC-001 p18)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2025-26 to 2028-29; 3 needed; earnings not provided for 3 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2024-25 to 2028-29; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 1 of the 7 tax years 2022-23 to 2028-29; 5 needed; earnings not provided for 6 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_

Other pathways not taken: `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-FAMILY-FIVE-YEAR-SAVINGS-SHORT

**Partner on the 5-year route: savings short of the income shortfall**

Application date: 2029-06-01.

- Born 1993-02-14 (aged 36 on the application date), nationality BRA.
- Permission: FAMILY_PARTNER_OR_PARENT from 2024-06-01 to 2026-11-30 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- Permission: FAMILY_PARTNER_OR_PARENT from 2026-12-01 to 2029-08-31 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- No absences from the UK.
- Income: 2028-29 £20,000. Tax years not listed: not provided.
- Cash savings: £24,000.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **LIKELY_NOT_ELIGIBLE**; pathway 10 years; earliest date 2034-05-04.

Decisive rules:

- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B2 required for settlement (Appendix KoLL 2.2, through E-ILRP.1.6; applications from 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (Appendix KoLL 2.3, through E-ILRP.1.6). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_
- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2024-06-01: expected to complete 10 years on 2034-06-01; the earliest projected application date for the residence requirement is 2034-05-04 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Failing or unknown checks:

- `CL-FAMILY-FINANCIAL` Financial requirement on the 5-year partner route — **FAIL**. Combined earnings of the applicant and partner in the 2028-29 tax year are £20,000, below the £29,000 of the general requirement (E-LTRP.3.1(a)): a shortfall of £9,000; cash savings of £24,000 are below £16,000 plus the shortfall, £25,000 in all, by £1,000 (E-LTRP.3.1(b); E-ILRP.1.3(1A)). If the partner receives a benefit listed in E-LTRP.3.3(a), E-LTRP.3.3 can apply instead. _(SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.3.1; SRC-024 E-LTRP.3.2; SRC-024 E-LTRP.3.3; SRC-024 E-LTRP.3.5; SRC-024 E-LTRP.3.7; SRC-024 E-LTRP.3.8)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- E-ILRP.1.3 counts only partner permission on the 5-year route (D-ECP.1.1 / D-LTRP.1.1), not time as a fiancé(e); each period is taken to be on the 5-year route with the same partner (E-ILRP.1.4).
- This assumes your partner is also in the UK on the date you apply (Appendix FM R-ILRP.1.1(a)).
- The relationship is taken as genuine and subsisting, with both intending to live together permanently (E-LTRP.1.7–E-LTRP.1.10); this tool does not check these.
- Whether the transitional requirement applies is judged by whether the continuous partner permission started before 2024-04-11 (E-LTRP.3.5 looks at the date of the first application, so an application made before that date and granted after it also qualifies); children are those listed under relationships with another status.
- Savings are the combined cash savings as declared; the holding period and evidence rules in Appendix FM-SE and the kinds of income and savings sources in E-LTRP.3.2 are not checked; any benefit the partner receives is taken as declared; the accommodation requirement (E-LTRP.3.4, E-LTRP.3.9) and EX.1 are not modelled.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.
- The earliest application date is projected on the basis that residence continues from 2024-06-01, earnings and other circumstances stay the same, and the other requirements are still met then; it is not a guarantee about the future.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2029-06-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Family Partner or Parent, is in the Core permission / British connection groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2024-06-01: 5 full years by 2029-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **PASS**. Holds a family visa as the partner, parent or child of a British citizen, a recognised British connection: the 5-year pathway is available. _(SRC-001 p18)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2025-26 to 2028-29; 3 needed; earnings not provided for 3 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2024-25 to 2028-29; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 1 of the 7 tax years 2022-23 to 2028-29; 5 needed; earnings not provided for 6 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_

Other pathways not taken: `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## CL-FAMILY-FIVE-YEAR-PARTNER-BENEFIT

**Partner on the 5-year route whose partner receives Carer's Allowance**

Application date: 2029-06-01.

- Born 1993-02-14 (aged 36 on the application date), nationality BRA.
- Permission: FAMILY_PARTNER_OR_PARENT from 2024-06-01 to 2026-11-30 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- Permission: FAMILY_PARTNER_OR_PARENT from 2026-12-01 to 2029-08-31 — role MAIN, familyPermission PARTNER_FIVE_YEAR.
- No absences from the UK.
- Income: 2028-29 £20,000. Tax years not listed: not provided.
- English: cefrLevel B2. Life in the UK test: passed true.
- relationships: type PARTNER, otherPartyStatus BRITISH_CITIZEN.
- partnerSpecifiedBenefit: true.
- governmentDebt: outstanding false.

### Current Immigration Rules

Outcome **POTENTIALLY_ELIGIBLE**; pathway 5 years.

Decisive rules:

- `CL-FAMILY-RESIDENCE` Continuous residence on the family partner route — **PASS**. 5-year partner route: continuous partner permission since 2024-06-01: 5 years completed (E-ILRP.1.3). _(SRC-022 SETF 3.1; SRC-022 SETF 3.2; SRC-022 SETF 4.1; SRC-024 E-ILRP.1.3; SRC-024 E-ILRP.1.4; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3)_
- `CL-FAMILY-RELATIONSHIP` Partner is a British citizen or settled — **PASS**. The partner is a British citizen (E-LTRP.1.2(a)). _(SRC-022 SETF 7.1; SRC-022 SETF 7.2; SRC-022 SETF 7.3; SRC-024 R-ILRP.1.1(a); SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.1.2)_
- `CL-FAMILY-FINANCIAL` Financial requirement on the 5-year partner route — **UNKNOWN**. Combined earnings of the applicant and partner in the 2028-29 tax year are £20,000, below the £29,000 of the general requirement (E-LTRP.3.1(a)): a shortfall of £9,000; the partner receives a benefit listed in E-LTRP.3.3(a), as declared, so the applicant can instead show that the partner can maintain and accommodate themselves, the applicant and any dependants adequately without recourse to public funds (E-LTRP.3.1(c), E-LTRP.3.3(b)). This requirement has no set figure, and how it is calculated is not registered in this tool (PD-075). _(SRC-024 E-ILRP.1.3(1A); SRC-024 E-LTRP.3.1; SRC-024 E-LTRP.3.2; SRC-024 E-LTRP.3.3; SRC-024 E-LTRP.3.5; SRC-024 E-LTRP.3.7; SRC-024 E-LTRP.3.8)_
- `CL-ENGLISH` Settlement English requirement — **PASS**. English at B2, which meets the B2 required for settlement (Appendix KoLL 2.2, through E-ILRP.1.6; applications from 2027-03-26). _(SRC-004 SW 22A.1; SRC-004 SW 44.1; SRC-007 p24; SRC-005 LR 13.1; SRC-020 HK 60.1; SRC-021 GT 13.1; SRC-021 GT 32.1; SRC-022 SETF 5.1; SRC-022 SETF 15.1; SRC-024 E-ILRP.1.6; SRC-025 KoLL 2.2; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 15.1; SRC-028 PL 16.1; SRC-007 EM 5.60; SRC-014 EL 1.1)_
- `CL-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test (Appendix KoLL 2.3, through E-ILRP.1.6). _(SRC-004 SW 23.1; SRC-004 SW 45.1; SRC-005 LR 14.1; SRC-020 HK 61.1; SRC-021 GT 14.1; SRC-021 GT 33.1; SRC-022 SETF 6.1; SRC-022 SETF 16.1; SRC-025 KoLL 2.3; SRC-025 KoLL 3.1; SRC-029 para 298(vii); SRC-026 UKA 16.1; SRC-027 INNF 20.1; SRC-028 PL 17.1; SRC-015 KOL 1.1; SRC-015 KOL 2.1)_

Failing or unknown checks:

- `CL-LR-RESIDENCE-10Y` Long Residence: 10 years of continuous lawful residence — **FAIL**. Continuous lawful residence since 2024-06-01: expected to complete 10 years on 2034-06-01; the earliest projected application date for the residence requirement is 2034-05-04 under CR 1.1. _(SRC-005 LR 11.1; SRC-005 LR 11.2; SRC-008 CR 1.1, CR 3.1–3.2, CR 4.1(d)–4.3; SRC-008 CR 3.3)_

Assumptions:

- The current rules are modelled only for Skilled Worker main applicants and their dependent partners / children (Appendix Skilled Worker, Appendix Children), Hong Kong BN(O) main applicants and their dependants (Appendix Hong Kong British National (Overseas)), Global Talent main applicants and their dependent partners / children (Appendix Global Talent), Appendix FM partners (the 10-year route under Appendix Settlement Family Life, the 5-year route under Appendix FM) and their children (Appendix Settlement Family Life on the 10-year route, paragraph 298 of Part 8 of the Immigration Rules on the 5-year route), main applicants with refugee status or humanitarian protection (Appendix Settlement Protection), UK Ancestry main applicants (Appendix UK Ancestry), Innovator Founder main applicants (Appendix Innovator Founder), Private Life main applicants (Appendix Private Life) and Long Residence (Appendix Long Residence); other requirements, such as Part Suitability, suitability under STP 2.1 and the sponsor still being approved (SW 24.1–24.2), are not modelled.
- For routes under Appendix Continuous Residence, you can apply up to 28 days before completing the qualifying period (CR 1.1(b)). The estimate uses recorded permission and assumes it continues without a gap if the projected filing falls after the last recorded permission expires. It also assumes you meet the other requirements when you apply. The questionnaire has no decision date to use in the calculation.
- E-ILRP.1.3 counts only partner permission on the 5-year route (D-ECP.1.1 / D-LTRP.1.1), not time as a fiancé(e); each period is taken to be on the 5-year route with the same partner (E-ILRP.1.4).
- This assumes your partner is also in the UK on the date you apply (Appendix FM R-ILRP.1.1(a)).
- The relationship is taken as genuine and subsisting, with both intending to live together permanently (E-LTRP.1.7–E-LTRP.1.10); this tool does not check these.
- Whether the transitional requirement applies is judged by whether the continuous partner permission started before 2024-04-11 (E-LTRP.3.5 looks at the date of the first application, so an application made before that date and granted after it also qualifies); children are those listed under relationships with another status.
- Savings are the combined cash savings as declared; the holding period and evidence rules in Appendix FM-SE and the kinds of income and savings sources in E-LTRP.3.2 are not checked; any benefit the partner receives is taken as declared; the accommodation requirement (E-LTRP.3.4, E-LTRP.3.9) and EX.1 are not modelled.
- Continuous lawful residence includes temporary routes such as Student and Graduate, but not Visit, Seasonal Worker, Ukraine Scheme (LR 11.1(a)); identified gaps under CR 4.2 are deducted. Immigration bail and similar periods under LR 11.2(a) and the 12-month requirement in LR 11.3 are outside the model.

### Earned Settlement (announced in CP 1707, not yet in force)

Outcome **LIKELY_ELIGIBLE**; pathway 5 years; earliest date 2029-06-01; route group CORE_PERMISSION.

Decisive rules:

- `ES-CRIMINALITY` No criminal record — **PASS**. No criminal record declared. _(SRC-001 p12)_
- `ES-DEBT` No outstanding government debt — **PASS**. No outstanding government debt declared. _(SRC-001 p12; SRC-001 p29)_
- `ES-ENGLISH-B2` English for settlement (B2; A2 for UK Resettlement Scheme refugees) — **PASS**. English at B2, which meets B2. _(SRC-001 p21)_
- `ES-KOL` Pass the Life in the UK test — **PASS**. Passed the Life in the UK test. _(SRC-001 p21)_
- `ES-ROUTE-GROUP` Current route counts towards settlement — **PASS**. The current route, Family Partner or Parent, is in the Core permission / British connection groups and counts towards settlement. _(SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-001 p26)_
- `ES-RESIDENCE` Continuous residence counting towards settlement — **PASS**. Continuous residence counting towards settlement since 2024-06-01: 5 full years by 2029-06-01. _(SRC-001 p22; SRC-001 p23; SRC-001 p24; SRC-001 p25; SRC-008 CR 3.1)_
- `ES-BRITISH-CONNECTION` British connection (5-year pathway) — **PASS**. Holds a family visa as the partner, parent or child of a British citizen, a recognised British connection: the 5-year pathway is available. _(SRC-001 p18)_
- `ES-PUBLIC-FUNDS` No public funds in the 5 years before applying — **PASS**. No public funds received in the 5 years before applying. _(SRC-001 p18; SRC-006 #benefits-open-to-new-claims; SRC-006 #contributory-benefits-and-statutory-payments)_
- `ES-BREACH` No qualifying immigration breach as an adult — **PASS**. No qualifying immigration breach as an adult. _(SRC-001 p13)_
- `ES-ASYLUM-SUPPORT` Asylum support repaid or repayment plan kept up — **PASS**. Repayment of asylum support not declared; treated as no asylum support received (anyone who received asylum support and must repay it needs to have repaid it in full, or be keeping up with an agreed repayment plan, before settlement; p8 note 1). _(SRC-001 p8; SRC-001 p39; SRC-001 p47)_

Failing or unknown checks:

- `ES-EARNINGS-3Y` 3-year pathway earnings: £125,141 in 3 of 4 years — **UNKNOWN**. Earnings reached £125,141 in 0 of the 4 tax years 2025-26 to 2028-29; 3 needed; earnings not provided for 3 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-5Y` 5-year pathway earnings: £50,271 in 3 of 5 years — **UNKNOWN**. Earnings reached £50,271 in 0 of the 5 tax years 2024-25 to 2028-29; 3 needed; earnings not provided for 4 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46)_
- `ES-EARNINGS-10Y` Minimum earnings: £12,571 in 5 of 7 years (or £25,142 combined household earnings) — **UNKNOWN**. Earnings reached £12,571 in 1 of the 7 tax years 2022-23 to 2028-29; 5 needed; earnings not provided for 6 year(s). _(SRC-001 p15; SRC-001 p16; SRC-001 p46; SRC-001 p17; SRC-001 p30)_

Other pathways not taken: `ES-TRANSITIONAL-CARE-WORKER`, `ES-TRANSITIONAL-HEALTH-EDUCATION`, `ES-PUBLIC-SERVICE`.

Assumptions:

- Earned Settlement has been announced but is not yet in force; it is assessed as if it applied on the date of application. The rules are based on the government response (SRC-001), not on Immigration Rules in force (PD-001). The first rule changes are expected to be laid from December 2026 and take effect in January 2027, with further changes in 2027–2028 (SRC-002 col 593; SRC-003 cols 1423–1424); the actual dates will be set by the Statements of Changes (PD-003).
- “No government debt” is based on what the user declared; the response does not say whether debt other than asylum support debt that is being repaid under a repayment plan meets the requirement (PD-018).
- Earnings are gross earnings per UK tax year; the window is the complete tax years before the tax year of the application date, and every year is compared with the current thresholds (PD-005 / PD-006 / PD-007).
- Minimum earnings are calculated as “5 of the 7 years before applying”, as in p16 and Table 1; p15 also says “at least 3 years” (PD-041).

> **Reviewer:** ☐ Agree ☐ Disagree — expected outcome: ________ — deciding paragraph: ________

## Sources cited

- **SRC-001**: A Fairer Pathway to Settlement: Government Response to the Consultation (CP 1707, 62 页) — https://assets.publishing.service.gov.uk/media/6ae90b0e5b14ba0182a272a4/A_Fairer_Pathway_to_Settlement_-_Government_response_to_the_consultation.pdf
- **SRC-002**: HC Deb 2 November 2026 vol 792 cols 583 起，"Immigration: Earned Settlement"（内政大臣口头陈述及问答）；时间表句在 col 593 — https://hansard.parliament.uk/Commons/2026-11-02/debates/09F388D2-539E-4B0A-ABE2-D3195B14AF0E/ImmigrationEarnedSettlement
- **SRC-003**: HL Deb 2 November 2026 vol 860 cols 1415 起，"Immigration: Earned Settlement"（Lord Collins of Highbury 复述陈述及问答）；时间表句在 cols 1423–1424 — https://hansard.parliament.uk/Lords/2026-11-02/debates/5D3D04DB-0971-4B22-B841-6414AAFAA8C9/ImmigrationEarnedSettlement
- **SRC-004**: Immigration Rules: Appendix Skilled Worker（版本 2026-10-08，HC 584；£41,700 + going rate 见 SW 4.2 Option A、SW 8.1；settlement 见 SW 21.1–SW 24.4；dependent partner / child settlement 见 SW 37.1–SW 46.2） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-worker
- **SRC-005**: Immigration Rules: Appendix Long Residence（版本 2026-10-08，HC 584；settlement 合格期 LR 11.1–11.2，B2 自 2027-03-26 见 LR 13.1） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-long-residence
- **SRC-006**: Public funds（Home Office guidance，HTML 版；SRC-001 p18 注 6 指向此页） — https://www.gov.uk/government/publications/public-funds--2/public-funds
- **SRC-007**: Statement of Changes in Immigration Rules HC 1691（2026-03-05 提交议会）及其 Explanatory Memorandum：**已证实** 2027-03-26 起多条路线 settlement 英语要求升至 B2（Skilled Worker 见 APP SW5 插入的 SW 22A.1；EM 5.60–5.62） — https://www.gov.uk/government/publications/statement-of-changes-to-the-immigration-rules-hc-1619-5-march-2026 （正文 PDF：https://assets.publishing.service.gov.uk/media/69a9a1f58fd807b03bbe92e5/E03553349_-_HC_1691_-_Immigration_Rules_Changes__Web_Accessible_.pdf ；EM PDF：https://assets.publishing.service.gov.uk/media/69a9a2b8ac93547152b9b1eb/E03553349_-__HC_1691__-_EXPLANATORY_MEMORANDUM__Web_Accessible_.pdf ）
- **SRC-008**: Immigration Rules: Appendix Continuous Residence（版本 2025-11-11，HC 1333；180 天缺席规则 CR 3.1，连续居住中断 CR 4.1） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-continuous-residence
- **SRC-012**: Restoring control over the immigration system: White Paper（CP 1326，80 页；发布日是 SRC-001 过渡安排的截止点；settlement B2 见 ¶257，10 年基准见 ¶264） — https://www.gov.uk/government/publications/restoring-control-over-the-immigration-system-white-paper （PDF：https://assets.publishing.service.gov.uk/media/6821f334ced319d02c906103/restoring-control-over-the-immigration-system-web-optimised.pdf ）
- **SRC-014**: Immigration Rules: Appendix English Language（版本 2026-03-26，HC 1691；settlement 英语豁免 EL 1.1） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-english-language
- **SRC-015**: Immigration Rules: Appendix KOL UK（版本 2025-04-09，HC 733；Life in the UK 豁免 KOL 1.1，满足方式 KOL 2.1） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-kol-uk
- **SRC-017**: Immigration Rules: Appendix Skilled Occupations（版本 2025-11-11，HC 1333；SOC 2020 职业及 going rates） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations
- **SRC-018**: Immigration Rules: Appendix Children（版本 2025-11-11，HC 1333；dependent child 的 age CHI 1.1–1.2、independent life CHI 1A.1、care CHI 2.1、settlement 关系要求 CHI 4.1–4.3；SW 39.4、SW 41A.1 引用） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-children
- **SRC-019**: Immigration Rules: Appendix Immigration Salary List（版本 2025-11-11，HC 1333；SOC 2020 职业、进一步条件、适用国家与 removal date） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-immigration-salary-list
- **SRC-020**: Immigration Rules: Appendix Hong Kong British National (Overseas)（版本 2026-10-08，HC 584；settlement 见 HK 55.1–HK 64.2） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-hong-kong-british-national-overseas
- **SRC-021**: Immigration Rules: Appendix Global Talent（版本 2026-08-03，HC 259；主申请人 settlement 见 GT 8.1–GT 15.2） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-global-talent
- **SRC-022**: Immigration Rules: Appendix Settlement Family Life（版本 2026-08-03，HC 259；partner / parent 的 10 年 settlement 见 SETF 1.1–SETF 9.5） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-settlement-family-life
- **SRC-023**: Immigration Rules: Appendix Settlement Protection（版本 2026-04-08，HC 1691；主申请人 settlement 见 STP 1.1–STP 5.3） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-settlement-protection
- **SRC-024**: Immigration Rules: Appendix FM: family members（版本 2026-10-08，HC 584；伴侣 5 年 settlement 见 E-ILRP.1.1–E-ILRP.1.6，财务要求见其引用的 E-LTRP.3.1–E-LTRP.3.9） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-fm-family-members
- **SRC-025**: Immigration Rules: Appendix KoLL（版本 2026-03-26，HC 1691；E-ILRP.1.6 引用的英语与 Life in the UK 要求，见 KoLL 2.1–KoLL 2.3，豁免见 Part 3；不同于 SRC-015 Appendix KOL UK） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-koll
- **SRC-026**: Immigration Rules: Appendix UK Ancestry（版本 2026-08-03，HC 259；主申请人 settlement 见 UKA 10.1–UKA 17.2） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-uk-ancestry
- **SRC-027**: Immigration Rules: Appendix Innovator Founder（版本 2026-08-03，HC 259；主申请人 settlement 见 INNF 15.1–INNF 21.6，业务条件见 INNF 17.1–INNF 17.5） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-innovator-founder
- **SRC-028**: Immigration Rules: Appendix Private Life（版本 2026-10-08，HC 584；主申请人 settlement 见 PL 11.1–PL 18.5，合格期分流见 PL 13.1–PL 14.4） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-private-life
- **SRC-029**: Immigration Rules Part 8: family members（版本 2026-08-03，HC 259；child settlement 见 para 298–298A） — https://www.gov.uk/guidance/immigration-rules/immigration-rules-part-8-family-members
- **SRC-037**: Written question 39721：现有在英者、过渡与影响评估 — https://questions-statements.parliament.uk/written-questions/detail/2026-11-02/39721
