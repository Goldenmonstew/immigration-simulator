import type { zhCN } from './zh-CN';

export const en: Record<keyof typeof zhCN, string> = {
  'game.actionUnavailable':
    'This cannot be done now. Check the time, place and what you have.',
  'game.abroad': 'Away from town',
  'game.abroadText':
    'The days pass while you are abroad. Read any messages before continuing your journey.',
  'game.continueJourney': 'Continue the journey',
  'game.returned': 'Welcome home',
  'game.returnedText':
    'Your journey has been added to your timeline. The town is waiting for you.',
  'game.promotion': 'Promotion!',
  'game.title': 'Immigration Life',
  'game.returnSimulator': '← Simulator',
  'game.places': 'Places',
  'game.fastShort': 'Fast fwd',
  'game.endDayShort': 'End day',
  'game.tapToReveal': 'Tap the dialogue to reveal the full line',
  'game.entry': 'Play a round · Immigration Life',
  'game.entryDesc':
    'Work, meet neighbours and see how everyday choices shape your immigration timeline in a pixel-art town.',
  'game.disclaimer':
    'Fictional characters and events for learning. This is not immigration advice.',
  'game.intro':
    'Make a home in a small town. Work, learn, meet people, and make the seasons your own.',
  'game.chooseCharacter': 'Who is moving to town?',
  'game.startAs': 'Start with {name}',
  'game.continue': 'Continue last game',
  'game.newGame': 'Start over',
  'game.date': 'Game date',
  'game.results': 'One life, two sets of rules',
  'game.ending': 'Your story in town',
  'game.lifeMemories': 'Little things that stayed with you',
  'game.memoryFriends': 'People you remember',
  'game.memoryHome': 'A home made your own',
  'game.memoryLunch': 'A photograph on the green',
  'game.memoryLunchText':
    'You joined your neighbours at the long table and took a photograph together.',
  'game.memoryGarden': 'Things you planted',
  'game.memoryDishes': 'Dishes you made',
  'game.memoryFlowerbed': 'The community flowerbed sign',
  'game.memoryFlowerbedText':
    'The flowerbed you tended with your neighbours now has its own little sign.',
  'game.collection': 'Collection',
  'game.collectionFish': 'Fish you caught',
  'game.collectionDishes': 'Dishes you made',
  'game.collectionHint':
    'Things you caught or cooked stay here, even after you eat or give them away.',
  'game.collectionFirst': 'First: Year {year} · {season}',
  'game.collectionMemory.pond':
    'You caught it at the park pond on a {weather} day.',
  'game.collectionMemory.home': 'You made it at home on a {weather} day.',
  'game.collectionWeather.sunny': 'sunny',
  'game.collectionWeather.cloudy': 'cloudy',
  'game.collectionWeather.rain': 'rainy',
  'game.collectionWeather.snow': 'snowy',
  'game.collectionUnknown': 'Not yet recorded',
  'game.collectionHarvests':
    'Harvest records: {count} harvest{count:s} across {kinds} crop{kinds:s}.',
  'game.lunchScene': 'Neighbourhood lunch · 12:00–16:00',
  'game.lunchTables': 'The tables and chairs you borrowed',
  'game.lunchFood': 'The food you brought is on the table',
  'game.openTimeline': 'Open this timeline in the simulator',
  'game.replay': 'Play again',
  'game.changeCharacter': 'Change character',
  'game.saved': 'Saved in this browser. Come back whenever you like.',
  'game.storageUnavailable':
    'Local storage is unavailable. You can keep playing, but progress may be lost when you refresh or close the page.',
  'game.yearQuarter': 'Year {year} · Quarter {quarter}',
  'game.actionsLeft': '{count} action points',
  'game.visaShort': '{count}m',
  'game.visa': 'Permission: {count} month{count:s} left',
  'game.renewedThisSeason': 'You renewed this season.',
  'game.renewedThrough':
    'You renewed this season. The expiry date on that renewal was {date}.',
  'game.visaUrgent': 'Permission expiry approaching',
  'game.money': 'Savings',
  'game.mood': 'Mood',
  'game.health': 'Health',
  'game.english': 'English',
  'game.career': 'Career',
  'game.season1': 'Winter',
  'game.season2': 'Spring',
  'game.season3': 'Summer',
  'game.season4': 'Autumn',
  'game.town': 'Town map',
  'game.controls':
    'Arrow keys / WASD to walk · Tap to walk · E / Space to interact',
  'game.touchControls': 'Tap the map to walk · Tap the prompt to interact',
  'game.nextHeart': 'Next heart: {count} / 100',
  'game.fullHearts': 'All hearts full',
  'game.destinations': 'Where to?',
  'game.endQuarter': 'End this quarter',
  'game.close': '✕ Close',
  'game.continuePlaying': 'Continue',
  'game.actionCost': '{count} action points',
  'game.noActions': 'No actions are available right now.',
  'game.effects': 'Expected changes',
  'game.timelineEffect': 'Updates the timeline',
  'game.endingConfirm':
    'This will end this game. Ready to bring this story to a close?',
  'game.endingEffect': 'Ends this story',
  'game.reformSettlement': 'Simulate submission under the reform assumptions',
  'game.reformSettlementConfirm':
    'Simulate submitting your settlement application under the reform assumptions and end this game?',
  'game.settlementAssessmentAtSubmission':
    'These settlement assessments use the details from when you submitted in the game.',
  'game.timelineChanged':
    'The timeline and both assessments have been updated.',
  'game.changes': 'What changed',
  'game.noChanges': 'No stat changes.',
  'game.event': 'News around town',
  'game.quarterSummary': 'This quarter in review',
  'game.quarterChanges':
    'Stat changes from actions, events and the end-of-quarter update',
  'game.wellbeingAtSettlement':
    'What made the biggest difference at the season’s end',
  'game.settlementSource.seasonWear': 'The season’s wear and tear',
  'game.settlementSource.overtimeWear': 'Extra wear from overtime',
  'game.settlementSource.brighterHome': 'A brighter home',
  'game.settlementSource.walkingClub': 'Hiking coaching',
  'game.settlementSource.furnishings': 'Home furnishings',
  'game.cropsCleared':
    'The season changed, and crops left in the ground were cleared from {count} of your plots.',
  'game.eventReview': 'What happened this quarter',
  'game.noEvents': 'A quiet quarter has its charms.',
  'game.progressChanges': 'Before → after the start of your new game year',
  'game.nextQuarter': 'Welcome the next season',
  'game.seeEnding': 'Read your story',
  'game.achievements': 'Keepsakes along the way',
  'game.noAchievements': 'The journey is a keepsake of its own.',
  'game.currentLaw': 'Current law',
  'game.reform': 'Announced reforms',
  'game.councilDetails': 'Visit the town hall for details',
  'game.progressHint':
    'Progress tracks time accumulated. Read the outcome and rules to understand eligibility.',
  'game.loading': 'Loading the town…',
  'game.netIncome': 'Net quarterly income after bills',
  'game.yearSummary': 'Year-end review',
  'game.earned': 'Earned',
  'game.unearned': 'Still to discover',
  'game.fee': 'Fee',
  'game.travelRecall':
    'Depart today; travel skips the remaining days of this season.',
  'game.visaReminderTitle': 'A new quarter: check your permission dates',
  'game.visaReminder':
    'Your current permission has {count} month{count:s} left, and no further permission is recorded from the date it expires. Visit the visa centre to see available actions and fees.',
  'game.fastVisaWarning':
    'Your permission runs continuously until {date}, with no further permission after that. Fast-forwarding runs past that date to the end of the quarter, so visit the visa centre first.',
  'game.fastVisaWarningNone':
    'No current permission is recorded. Fast-forwarding runs to the end of the quarter, so visit the visa centre first.',
  'game.missingRules': 'Still needed: {rules}',
  'game.visaVisit': 'Visit the visa centre',
  'game.musicOn': 'Music: on',
  'game.musicOff': 'Music: off',
  'game.musicUnavailable': 'Music could not be played.',
  'game.location.home': 'Home',
  'game.location.work': 'Work',
  'game.location.college': 'College',
  'game.location.gp': 'GP clinic',
  'game.location.pub': 'Pub & park',
  'game.location.council': 'Town hall',
  'game.location.visa': 'Visa centre',
  'game.location.station': 'Station',
  'site.about': 'About',
  'site.version': 'Version {version}',
  'error.title': 'Something went wrong on this page',
  'error.body':
    'The page hit an unexpected error. Drafts and game progress saved in this browser should still be available; unsaved changes may be lost on reload. Try again first; if it keeps happening, please report the error below.',
  'error.retry': 'Try again',
  'error.home': 'Back to the home page',
  'error.report': 'Report this on GitHub',
  'error.privacy':
    'The report is pre-filled with the page address, version and error message, not your inputs; you can review it before submitting.',
  'result.reportRule': 'Is this wrong?',
  'site.feedback': 'Feedback',
  'about.title': 'How this simulator works',
  'about.intro':
    'This is a reference and learning tool that models settlement pathways using published policy. Adjust scenarios and compare outcomes to explore how rules affect a timeline, with a light element of play.',
  'about.limits':
    'It does not determine your legal immigration status, guarantee an application outcome or replace regulated immigration advice. For advice on a real application, consult a suitably qualified professional who can consider your evidence and the applicable rules.',
  'about.link': 'Read about the method, scope and privacy',
  'about.columnsTitle': 'Understanding the two result columns',
  'about.currentLaw':
    'The current law column uses the current version of the Immigration Rules registered in this project to assess potentially relevant settlement conditions on the simulation date.',
  'about.currentLawScope':
    'The current law column models main applicants on Skilled Worker, Hong Kong BN(O), Global Talent, Appendix FM partner routes (5-year and 10-year), refugee routes (Appendix Settlement Protection), UK Ancestry, Innovator Founder and Private Life. It also assesses Long Residence. Dependant coverage includes Skilled Worker, Hong Kong BN(O) (partners, children and adult dependant relatives), Global Talent (partners and children), children of Appendix FM partners on the 10-year route, and children of Appendix FM partners on the 5-year route (paragraph 298 of Part 8 of the Immigration Rules). The separate settlement requirements of other routes and their dependants still show insufficient information. This does not mean that those routes have no settlement pathway.',
  'about.reforms':
    'The announced reforms column uses Earned Settlement policy and is labelled “Announced, not in force”. It assumes that the rule set applies on the simulation date. This does not mean the reforms have taken effect or will necessarily take this form.',
  'about.reformScope':
    'The reforms column covers core permission, high talent, British connection, family and private life, and protection routes, including family and transitional provisions. Routes that do not count towards settlement, such as Visit and Student, are subject to the corresponding restrictions. Routes outside the framework, such as Hong Kong BN(O), and protection route dependants are referred for professional review.',
  'about.informationGaps':
    'Unclassified routes (such as Other) or missing required inputs may still produce insufficient information. Unresolved policy may also leave a rule UNKNOWN. Read the outcome, rule details and assumptions together; unknown does not mean met or not met.',
  'about.sourcesTitle': 'Sources and policy check date',
  'about.sources':
    'Policy figures, rules and source references come from government documents and Immigration Rules registered in this project. The check date describes the material used by this model; it is not a live feed from government websites.',
  'about.policyLink': 'View rule sets, parameters and official sources',
  'about.pendingTitle': 'What pending details (PD-xxx) mean',
  'about.pending':
    'PD-xxx is a project reference for policy details that the government has not yet clarified, not a government document number. These markers identify assessments that depend on unresolved details. The rules list on the policy page includes the relevant references and official sources; gaps must not be filled with guesses.',
  'about.pendingLink': 'View pending details and sources in the rules list',
  'about.privacyTitle': 'How your inputs are stored',
  'about.localPrivacy':
    'Inputs are processed in your browser. Questionnaire drafts and saved scenarios are stored only in this browser’s localStorage and are not uploaded to this site’s server. Other people using a shared device may see them.',
  'about.sharePrivacy':
    'A share link contains all the inputs you entered, including principal applicant information. Anyone with the link can read and load those inputs, so share it only with people you trust.',
  'about.analyticsPrivacy':
    'The site uses only Cloudflare Web Analytics for visitor statistics, without cookies. Questionnaire inputs and simulation results are not sent. When a page fails, its path, the error type and code location, the version and the browser type are sent to an error log for this site on Cloudflare, kept for a few days and never including the error text or your inputs.',
  'about.feedbackTitle': 'Feedback',
  'about.feedbackIntro':
    'If you find a policy interpretation error, a figure that does not match its source or a page problem, please report it in a GitHub issue.',
  'about.feedbackLink': 'Give feedback on GitHub',
  'about.feedbackPrivacy':
    'GitHub issues are public. Do not post share links, personal information or document details.',
  'result.print': 'Print or save as PDF',
  'scenarios.title': 'Saved scenarios on this device',
  'scenarios.privacy':
    'Scenarios stay in this browser and are not uploaded. Other people using this device may see them. Summaries are recalculated using the current policy.',
  'scenarios.defaultName': 'Scenario',
  'scenarios.name': 'Scenario name',
  'scenarios.save': 'Save this scenario',
  'scenarios.saved': 'Scenario saved on this device.',
  'scenarios.empty': 'No saved scenarios yet.',
  'scenarios.load': 'Load',
  'scenarios.delete': 'Delete',
  'scenarios.confirmDelete': 'Delete scenario “{name}”?',
  'scenarios.unavailable':
    'Unable to read or save scenarios. Check that browser storage is available.',
  'step.principal': 'Principal applicant',
  'principal.banner': 'Entering details for: principal applicant',
  'principal.sharedDate': 'Shared simulation date:',
  'principal.hint':
    'To assess your settlement as a dependant, enter the principal applicant’s timeline and any details of settlement already granted.',
  'principal.start': 'Enter the principal applicant’s timeline',
  'principal.edit': 'Edit the principal applicant’s timeline',
  'principal.return': 'Return to the applicant questionnaire',
  'principal.finish': 'Finish and return to the applicant questionnaire',
  'principal.saved':
    'The principal applicant’s timeline is complete. Continue with the applicant questionnaire.',
  'principal.incomplete':
    'Complete the principal applicant’s timeline to continue.',
  'principal.required': 'Complete the principal applicant’s timeline first.',
  'principal.prefix': 'Principal applicant: ',
  'screening.settledWorkerPartner':
    'The principal applicant’s screening requires regulated review. Current Skilled Worker partner settlement is assessed on the partner’s own circumstances (SW 38.1 and 39.1(b)).',
  'principal.settled': 'Has the principal applicant already settled?',
  'principal.settledDate': 'Date settlement was granted',
  'principal.settledRoute':
    'Immigration route held when settlement was granted',
  'episodes.immigrationSalaryList':
    'Was the job on the Immigration Salary List for this grant?',
  'episodes.immigrationSalaryListHint':
    'The Immigration Salary List is a government list of occupations; jobs on it can use a lower salary threshold. Check your SOC code against the version in force when this CoS was issued, including any regional or job conditions in the entry. Leave it blank if unsure: the simulator infers what it can from the SOC code and the list entry and marks the rest as to be confirmed.',
  'episodes.immigrationSalaryListLink':
    'See Appendix Immigration Salary List (GOV.UK)',
  'episodes.dependantOf': 'Dependant relationship',
  'episodes.partnerDependant': 'Partner dependant (principal is your partner)',
  'episodes.childDependant': 'Child dependant (principal is your parent)',
  'episodes.relativeDependant':
    'Adult dependant relative (the principal applicant is my child, grandchild, sibling or parent; HK 59.1)',
  'result.principal': 'Principal applicant’s assessment',
  'site.navigation': 'Main navigation',
  'site.policy': 'Policy',
  'site.chinese': 'Chinese',
  'policyPage.title': 'Policy basis',
  'policyPage.notDisplayed': 'Not shown on the results page',
  'policyPage.ruleSets': 'Rule sets',
  'policyPage.parameters': 'Parameters',
  'policyPage.name': 'Name',
  'policyPage.value': 'Value',
  'policyPage.rules': 'Rules',
  'policyPage.changelog': 'Policy changelog',
  'policyPage.sources': 'Source register',
  'policyPage.bestYears': '{required} of {window} years',
  'policyPage.applicationsFrom': 'for applications from',
  'site.chineseShort': 'ZH',
  'site.shortName': 'UK paths',
  'site.name': 'UK Immigration Path Simulator',
  'site.skip': 'Skip to main content',
  'site.home': 'Home',
  'site.footer':
    'General policy information and hypothetical scenario modelling',
  'home.title': 'Explore potentially relevant immigration pathways',
  'home.intro':
    'Use your timeline to explore potentially relevant pathways, key conditions and unresolved details.',
  'home.scopeTitle': 'Modelled scope',
  'home.scope':
    'Compare current settlement pathways with the announced Earned Settlement reforms. The current law column models main applicants on Skilled Worker, Hong Kong BN(O), Global Talent, Appendix FM partner routes (5-year and 10-year), refugee routes (Appendix Settlement Protection), UK Ancestry, Innovator Founder and Private Life. It also assesses Long Residence. Dependant coverage includes Skilled Worker, Hong Kong BN(O) (partners, children and adult dependant relatives), Global Talent (partners and children), children of Appendix FM partners on the 10-year route, and children of Appendix FM partners on the 5-year route (paragraph 298 of Part 8 of the Immigration Rules). The separate settlement requirements of other routes and their dependants still show insufficient information.',
  'home.start': 'Start simulation',
  'home.before': 'Before you start',
  'home.prepare':
    'Have your permission dates, absences and earnings by tax year ready. Leave uncertain information blank.',
  'home.privacy':
    'No account or document uploads. Inputs are processed in your browser and drafts are saved on this device. Other people using a shared device may see your draft.',
  'home.disclaimerTitle': 'About this simulator',
  'home.disclaimer':
    'Based on the information you entered, these rules may be relevant. This simulator provides general policy information and hypothetical scenario modelling. It does not determine your legal immigration status, is not immigration or legal advice, and does not guarantee the outcome of an application.',
  'policy.asOf': 'Policy checked as of',
  'policy.LAW': 'Current law',
  'policy.ANNOUNCED': 'Announced reforms',
  'policy.CURRENT_LAW': 'Current law',
  'policy.ANNOUNCED_NOT_IN_FORCE': 'Announced, not in force',
  'policy.IN_FORCE_FUTURE_VERSION.effectiveFrom': 'Laid, in force from {date}',
  'policy.IN_FORCE_FUTURE_VERSION': 'Future version',
  'policy.hypothesis':
    'The reforms column assumes that the rule set applies on the simulation date. Announced rules are not yet in force.',
  'result.title': 'Your pathway simulation',
  'result.navigation': 'Jump to an assessment',
  'result.jumpTo': 'Jump to {column}',
  'gap.title': 'What is missing',
  'gap.met': 'You meet the modelled requirements for this pathway.',
  'gap.earliest':
    'Based on the current situation, the earliest projected application date is {date} (assuming permission continues without a gap and the other requirements are still met then)',
  'gap.completion':
    'The selected pathway completes conditionally on {date}, provided the other requirements are still met then; this is not the earliest application date',
  'gap.reassess':
    'If no further counted public funds are received, shorter pathways can be reassessed from {date}',
  'gap.reassessPrincipal':
    'This date comes from the principal applicant’s record: if the principal applicant receives no further counted public funds, shorter pathways can be reassessed from {date}',
  'gap.wait':
    ', approximately {years} year{years:s} and {months} month{months:s} after the simulation date (rounded up to the next month).',
  'gap.pending': 'Pending government clarification',
  'gap.input': 'Provide missing information',
  'gap.more': 'More',
  'gap.less': 'Show less',
  'gap.try': 'Try in What-if',
  'result.intro':
    'Read the potentially relevant rules and information gaps together with their sources and assumptions.',
  'result.loading': 'Reading the scenario on this device…',
  'result.empty':
    'There is no simulation result yet. Please complete the questionnaire.',
  'result.edit': 'Edit inputs',
  'result.mock':
    'Development preview: fictional examples, not an assessment of your inputs.',
  'result.shortCircuit': 'This scenario needs regulated advice',
  'result.advice': 'Seek regulated advice',
  'result.adviceText':
    'These circumstances depend on legal and evidential details that this simulator does not assess. Consider an IAA-registered immigration adviser or another appropriately qualified legal professional.',
  'result.adviceLink': 'About the Immigration Advice Authority (IAA)',
  'result.pathway': 'Pathway duration',
  'result.routeGroup': 'Route group',
  'result.years': 'years',
  'result.earliest': 'Earliest projected application date',
  'result.completion': 'Conditional completion date',
  'result.reassessment': 'Shorter pathways reassessed from',
  'result.basis': 'Based on the {years}-year pathway ({route})',
  'result.basisNoRoute': 'Based on the {years}-year pathway',
  'result.thisPathway': 'Conditions on this pathway',
  'result.otherPathways': 'Other pathways (shows why they were not used)',
  'result.shorterBlocked': 'Why shorter pathways were not used:',
  'result.shorterPathway': '{years}-year pathway',
  'result.shorterPathwayEntry': '{years}-year pathway ({entry})',
  'result.shorterNotMet': '{pathway} – not met: {rules}',
  'result.shorterUnconfirmed': '{pathway} – still to be confirmed: {rules}',
  'result.entry.ES-EARNINGS-3Y': 'earnings',
  'result.entry.ES-EARNINGS-5Y': 'earnings',
  'result.entry.ES-BRITISH-CONNECTION': 'British connection',
  'result.entry.ES-PUBLIC-SERVICE': 'public service occupation',
  'result.entry.ES-TRANSITIONAL-CARE-WORKER':
    'care worker transitional arrangement',
  'result.entry.ES-TRANSITIONAL-HEALTH-EDUCATION':
    'health and education transitional arrangement',
  'result.undetermined': 'Not yet determined',
  'result.why': 'Why',
  'result.FAIL': 'Not met',
  'result.UNKNOWN': 'Unknown / unresolved',
  'result.PASS': 'Met',
  'result.noRules':
    'There are no rule details to display yet. This does not mean the conditions are met.',
  'result.noGroupRules': 'No rules in this group.',
  'result.assumptions': 'Assumptions',
  'result.assumptionCount': 'items',
  'result.noAssumptions': 'The engine has not provided additional assumptions.',
  'result.missingAssessment': 'No assessment is available for this rule set.',
  'result.sources': 'Sources',
  'result.pendingDetails': 'Details pending government decision',
  'share.copy': 'Copy share link',
  'share.privacy':
    'This link contains all the information you entered. Share it only with people you trust.',
  'share.copied': 'Share link copied.',
  'share.manual': 'Copying was not available. Copy the link below manually.',
  'share.loaded': 'Shared scenario loaded. You can edit the inputs.',
  'whatif.title': 'Scenario lab · What-if',
  'whatif.intro':
    'Adjust inputs to compare rules, durations and dates instantly. Changes apply only to this page and do not update your questionnaire draft. Refreshing returns to the baseline.',
  'whatif.empty':
    'There is no completed questionnaire draft yet. Complete the questionnaire before comparing scenarios.',
  'whatif.unsupported':
    'The scenario lab is not available for this scenario requiring professional review. Return to the results for details.',
  'whatif.controls': 'Adjust the scenario',
  'whatif.date': 'Simulation date',
  'whatif.income': 'Personal annual earnings',
  'whatif.enableIncome': 'Enable earnings override',
  'whatif.incomeHint':
    'Set personal annual earnings to X for the most recent N completed tax years. When disabled, draft earnings are retained. Preset buttons enable the override.',
  'whatif.incomeYears': 'Most recent N tax years',
  'whatif.earnings': 'Annual earnings X (GBP)',
  'whatif.incomeSlider': 'Adjust annual earnings with the slider',
  'whatif.noPublicFunds': 'Assume no public funds received before applying',
  'whatif.noAbsences': 'Assume no absences',
  'whatif.trip': 'Add one more trip abroad',
  'whatif.tripFrom': 'Departure date',
  'whatif.tripTo': 'Return date',
  'whatif.tripDays':
    '{days} whole day{days:s} away. Current law counts whole days only, not the departure and return days; the reform column counts both days as a modelling assumption (PD-054).',
  'whatif.tripIncomplete':
    'Enter both the departure and return dates for this trip to count.',
  'whatif.tripInvalid':
    'The return date is before the departure date, so this trip is not counted.',
  'whatif.reset': 'Reset',
  'whatif.back': 'Back to results',
  'whatif.before': 'Before',
  'whatif.after': 'After',
  'whatif.outcome': 'Outcome',
  'whatif.becameMet': 'Changed to met',
  'whatif.becameUnmet': 'Changed to not met / unknown',
  'whatif.stillUnmet': 'Still not met',
  'whatif.unchanged': 'Same as the current scenario',
  'form.unknown': 'Not provided / unsure',
  'form.fixErrors': 'Please check the highlighted fields.',
  'english.level': 'English CEFR level or exemption',
  'english.life': 'Life in the UK',
  'english.exempt': 'Exempt',
  'english.passed': 'Passed',
  'date.incomeWindow': 'Current income years',
  'error.date': 'Enter a valid date.',
  'error.dob':
    'Date of birth cannot be later than today or the simulation date.',
  'error.number': 'Enter a valid amount of 0 or more.',
  'error.savings':
    'Enter a whole savings amount of 0 or more, or leave blank if not provided.',
  'outcome.LIKELY_ELIGIBLE': 'Likely eligible',
  'outcome.LIKELY_ELIGIBLE.description':
    'You meet the modelled requirements for at least one pathway in this assessment. This does not guarantee an application outcome.',
  'outcome.LIKELY_NOT_ELIGIBLE': 'Likely not eligible',
  'outcome.LIKELY_NOT_ELIGIBLE.description':
    'The simulator has not identified a pathway you meet on this date. Review the requirements and any missing information below.',
  'outcome.POTENTIALLY_ELIGIBLE':
    'Potentially eligible, pending policy details',
  'outcome.POTENTIALLY_ELIGIBLE.description':
    'At least one pathway has no unmet requirements and depends on unresolved policy details.',
  'outcome.INSUFFICIENT_INFORMATION': 'Insufficient information',
  'outcome.INSUFFICIENT_INFORMATION.description':
    'The inputs are insufficient for an assessment. Review the information gaps in the rule details.',
  'outcome.POLICY_NOT_YET_IN_FORCE': 'Pending commencement arrangements',
  'outcome.POLICY_NOT_YET_IN_FORCE.description':
    'The assessment depends on when and how rules that are not yet in force take effect.',
  'outcome.REQUIRES_REGULATED_REVIEW': 'Requires regulated review',
  'outcome.REQUIRES_REGULATED_REVIEW.description':
    'A regulated professional needs to review this scenario and its evidence.',
  'screening.hint':
    'Only a yes to criminal records stops the questionnaire and directs you to regulated advice. Enter immigration breach records for the rules engine to assess alongside your route. Government debt is also assessed by the engine.',
  'benefits.publicFunds': 'Public funds',
  'benefits.notPublicFunds': 'Not public funds',
  'site.language': 'Language',
  'pilot.entryTitle': 'Other countries (pilots)',
  'au.entryDesc':
    'Use your visa and travel record to work out the dates for subclass 191, 186 TRT, the partner permanent stage, the Resident Return visa and citizenship residence.',
  'au.entryLink': 'Open the Australia pilot',
  'au.title':
    'Australia: permanent residence, return visa and citizenship dates (pilot)',
  'au.intro':
    'From your Australian visas and trips, this works out the steps that depend on time alone: subclass 191, the Hong Kong streams of 189 and 191, the 186 Temporary Residence Transition stream, the partner visa permanent stage, the Resident Return visa and the citizenship residence requirement. Points-tested visas (such as the points-tested 189, 190 and 491) are out of scope.',
  'au.scope':
    'The pilot checks only the time requirements written in the regulations. It does not check English, health, character, employer nomination, regional residence or other requirements (the 191 Hong Kong (Regional) stream uses the regional start date you enter); each result lists them. Your entries are processed in your browser and are not saved or uploaded.',
  'au.basics': 'About you',
  'au.simulationDate': 'Simulation date',
  'au.simulationDateHint':
    'Results are worked out for this date. It starts as today.',
  'au.dateOfBirth': 'Date of birth',
  'au.firstArrival':
    'Date you first arrived in Australia (leave blank if you have not arrived yet)',
  'au.visas': 'Your visas',
  'au.visasHint':
    'Enter each visa in date order, including bridging visas; leave out ETAs, special purpose visas and maritime crew visas. The start date is the day it came into effect. A new substantive visa ends the visas before it; a new bridging visa ends only an earlier bridging visa, not a substantive one (Migration Act s82). You can leave the end date blank for a visa that was ended this way or is still in effect; visas starting on the same day are taken in the order entered.',
  'au.visa': 'Visa {n}',
  'au.subclass': 'Visa subclass',
  'au.from': 'Start date',
  'au.to': 'End date (leave blank if still in effect)',
  'au.addVisa': 'Add a visa',
  'au.remove': 'Remove',
  'au.trips': 'Trips outside Australia',
  'au.tripsHint':
    'Add a row for each time you left Australia. You can include planned trips.',
  'au.trip': 'Trip {n}',
  'au.departed': 'Date you left Australia',
  'au.returned': 'Date you came back',
  'au.addTrip': 'Add a trip',
  'au.sponsored':
    'While on a 457/482 or related bridging visa, after arriving I always worked full time in Australia for my sponsor in the visa occupation (paid leave is fine, unpaid leave is not)',
  'au.partner': 'I applied for a partner visa (820/801 or 309/100)',
  'au.hongKong':
    'I hold a Hong Kong or BN(O) passport, and my current 457, 482 or 485 visa was granted to me as the primary applicant and allows a 5-year stay from when it came into effect (for the Hong Kong streams of 189 and 191)',
  'au.regionalSince':
    'Date from which you have been only in designated regional areas (for the 191 Hong Kong (Regional) stream; optional)',
  'au.regionalSinceHint':
    'From this day on you have not lived, worked or studied outside designated regional areas. If always, enter your first arrival.',
  'au.partnerLodged': 'Date you applied for the partner visa',
  'au.partnerStream': 'Where you applied',
  'au.onshore': 'In Australia (820/801)',
  'au.offshore': 'Outside Australia (309/100)',
  'au.longTerm':
    'We were already in a long-term partner relationship when I applied: 3 years as spouses or de facto partners, or 2 years with a dependent child of us both (not a step-child)',
  'au.submit': 'Calculate',
  'au.errorSummary': 'Fix the items marked in red first.',
  'au.error.date': 'Enter a valid date.',
  'au.error.order': 'This date cannot be before the start date.',
  'au.error.beforeBirth':
    'The first arrival cannot be before your date of birth.',
  'au.error.beforeArrival':
    'A trip cannot start before your first arrival; enter your first arrival if you have trips.',
  'pilot.resultTitle': 'Results',
  'pilot.policyAsOf': 'Based on official sources checked on {date}.',
  'pilot.status.MET': 'Time requirements met on the simulation date',
  'pilot.status.FUTURE': 'Time requirements met from {date}',
  'pilot.status.NOT_MET': 'Not met with your record',
  'pilot.status.UNKNOWN': 'Cannot be confirmed yet (see the notes below)',
  'pilot.status.NOT_APPLICABLE': 'Does not apply',
  'pilot.checks': 'Checks on the simulation date',
  'pilot.met': 'Met',
  'pilot.notMet': 'Not met',
  'pilot.unknownCheck': 'Not known',
  'pilot.notChecked': 'Not checked',
  'pilot.assumptions': 'Assumptions',
  'pilot.pending': 'Pending details',
  'pilot.disclaimer':
    'These dates follow the time requirements written in the law only. This is not immigration or legal advice; check the immigration authority’s records and official pages before you apply.',
  'au.sub.491': '491 Skilled Work Regional (Provisional)',
  'au.sub.494': '494 Skilled Employer Sponsored Regional (Provisional)',
  'au.sub.482': '482 Skills in Demand / Temporary Skill Shortage',
  'au.sub.457': '457 Temporary Work (Skilled)',
  'au.sub.820': '820 Partner (temporary, in Australia)',
  'au.sub.309': '309 Partner (temporary, outside Australia)',
  'au.sub.bridging-trt':
    'Bridging visa (for a 457, 482, 186 or 187 application)',
  'au.sub.bridging': 'Bridging visa (for another application)',
  'au.sub.485': '485 Temporary Graduate',
  'au.sub.other-temporary': 'Other temporary visa (student, visitor and so on)',
  'au.sub.189': '189 Skilled Independent (permanent)',
  'au.sub.190': '190 Skilled Nominated (permanent)',
  'au.sub.191': '191 Permanent Residence (Skilled Regional)',
  'au.sub.186': '186 Employer Nomination Scheme (permanent)',
  'au.sub.801': '801 Partner (permanent, in Australia)',
  'au.sub.100': '100 Partner (permanent, outside Australia)',
  'au.sub.155': '155 Resident Return visa (permanent)',
  'au.sub.other-permanent': 'Other permanent visa',
  'de.entryLink': 'Open the Germany pilot',
  'de.entryDesc':
    'Use your residence permits and travel record to work out the dates for a settlement permit, EU long-term residence and naturalisation, and when a long trip ends your permit.',
  'de.title':
    'Germany: dates for settlement, EU long-term residence and naturalisation (pilot)',
  'de.intro':
    'From your German residence permits and trips, this works out the steps that depend on time alone: a settlement permit (Niederlassungserlaubnis), EU long-term residence (Daueraufenthalt-EU), naturalisation (Einbürgerung), and when a long trip ends your permit. Whether a visa or residence permit is granted in the first place is out of scope.',
  'de.scope':
    'The pilot checks only the time requirements in the Residence Act and the Nationality Act. It does not check livelihood, German, housing, the naturalisation test or other requirements; each result lists them, and counting the law leaves open is flagged. Your entries are processed in your browser and are not saved or uploaded.',
  'de.basics': 'About you',
  'de.simulationDate': 'Simulation date',
  'de.simulationDateHint':
    'Results are worked out for this date (the decision date for a settlement permit, the application date for EU long-term residence, the naturalisation date). It starts as today.',
  'de.firstEntry': 'Date you first arrived in Germany',
  'de.firstEntryHint':
    'If you came on a national visa, time counts from the day you arrived, not from when the visa started.',
  'de.permits': 'Residence permits',
  'de.permitsHint':
    'Add a row for each permit, then the next one when it is renewed or replaced; a new permit ends the one before it even if that card shows a later expiry, and a blank end date runs until the next permit starts. If you applied to renew before expiry and the new card came after the old one ran out, tick “Renewal or a new permit applied for before it ran out”; otherwise the gap breaks continuity. Tick it too while the decision is pending: settlement and EU long-term results that rely on the wait are then shown as uncertain, while naturalisation counts it as lawful residence. If a permit was extended by law or regulation, enter the date it is legally valid until, not the date on the card. A settlement permit and EU long-term residence have no end date (the date on the card is only the document’s), so there is none to enter. Enter a national entry visa as the type it was issued for; for the asylum procedure choose “Asylum claim pending” from the day you claimed asylum. Choose “Permit for a temporary purpose” for job seeking, au pair and the like.',
  'de.permit': 'Permit {n}',
  'de.kind': 'Permit type',
  'de.kind.study': 'University study (§ 16b)',
  'de.kind.training': 'Vocational training or further training (§ 16a)',
  'de.kind.skilled': 'Skilled worker or researcher (§§ 18a, 18b, 18d)',
  'de.kind.blue-card': 'EU Blue Card (Blaue Karte EU, § 18g)',
  'de.kind.german-family': 'Family of a German (§ 28)',
  'de.kind.other':
    'Other residence permit for a lasting purpose (such as family of a foreign national or other work)',
  'de.kind.temporary':
    'Permit for a temporary purpose (such as § 20 job seeking, au pair, seasonal work, language courses, ICT card)',
  'de.kind.protection': 'Asylum or refugee status (§ 25 Abs. 1, Abs. 2 Satz 1)',
  'de.kind.subsidiary': 'Subsidiary protection (§ 25 Abs. 2 Satz 2)',
  'de.kind.humanitarian':
    'Other humanitarian residence permit (Section 5, such as § 25 Abs. 3–5, § 25a, § 25b, § 23 Abs. 1)',
  'de.kind.asylum': 'Asylum claim pending (Aufenthaltsgestattung)',
  'de.kind.settlement': 'Settlement permit (Niederlassungserlaubnis)',
  'de.kind.eu-long-term': 'EU long-term residence (Daueraufenthalt-EU)',
  'de.from': 'Valid from',
  'de.renewing':
    'Renewal or a new permit applied for before it ran out (the permit continues until the decision, § 81 Abs. 4), so it runs until the next permit starts',
  'de.to': 'Valid until (can be left blank)',
  'de.addPermit': 'Add a permit',
  'de.trips': 'Trips abroad',
  'de.tripsHint':
    'Add a row for each time you left Germany. You can include planned trips.',
  'de.trip': 'Trip {n}',
  'de.departed': 'Date you left Germany',
  'de.returned': 'Date you came back to Germany',
  'de.addTrip': 'Add a trip',
  'de.settlement': 'Settlement permit',
  'de.settlementRoute': 'Settlement route that applies to you',
  'de.settlementRoute.general': 'General (§ 9)',
  'de.settlementRoute.skilled': 'Skilled worker (§ 18c Abs. 1)',
  'de.settlementRoute.blue-card': 'EU Blue Card (§ 18c Abs. 2)',
  'de.settlementRoute.german-family': 'Family of a German (§ 28 Abs. 2)',
  'de.settlementRoute.refugee': 'Asylum or refugee status (§ 26 Abs. 3)',
  'de.trained':
    'I completed vocational training or a degree in Germany (§ 18c Abs. 1 Satz 2)',
  'de.b1': 'My German is at B1 (§ 18c Abs. 2 Satz 3)',
  'de.c1': 'My German is at C1 (§ 26 Abs. 3 Satz 3)',
  'de.contributions':
    'Months of statutory pension contributions, or payments to a comparable insurance or pension scheme, by the simulation date (can be left blank)',
  'de.contributionsHint':
    'Voluntary contributions count; your pension insurance record (Versicherungsverlauf) shows them. Months paid to a comparable insurance or pension scheme (such as a professional scheme for doctors or lawyers) count too (§ 9 Abs. 2 Satz 1 Nr. 3, § 18c Abs. 1 Satz 1 Nr. 3). Needed for the general and skilled worker routes; if blank, only the time held is worked out.',
  'de.blueCardMonths':
    'Months of employment meeting the § 18g criteria with contributions by the simulation date, also under another permit (can be left blank)',
  'de.blueCardMonthsHint':
    'Count the months employed at the Blue Card (§ 18g) level, salary threshold included, with contributions for them; such employment before you switched to the Blue Card counts too. Months out of work do not. If blank, only holding the card is checked.',
  'de.naturalisation': 'Naturalisation',
  'de.naturalisationRoute': 'Naturalisation route that applies to you',
  'de.naturalisationRoute.general': 'General (StAG § 10)',
  'de.naturalisationRoute.spouse':
    'Spouse or registered partner of a German (StAG § 9)',
  'de.marriedOn':
    'Date you married, or registered a partnership with, a German',
  'de.spouseGermanSince':
    'Date your spouse became German (leave blank if always German)',
  'de.remove': 'Remove',
  'de.submit': 'Work out dates',
  'de.errorSummary': 'Fix the items marked in red first.',
  'de.error.date': 'Enter a valid date.',
  'de.error.order': 'This date cannot be before the start date.',
  'de.error.months': 'Enter a whole number of months, or leave it blank.',
  'gr.entryLink': 'Open the Greece pilot',
  'gr.entryDesc':
    'Use your residence permits (golden visa included) and travel record to work out the dates for long-term residence, golden visa renewal and naturalisation.',
  'gr.title':
    'Greece: dates for long-term residence, golden visa renewal and naturalisation (pilot)',
  'gr.intro':
    'From your Greek residence permits (golden visa included) and trips, this works out three steps that depend on time alone: long-term residence (Μ1), the golden visa (Β.5) renewal period, and the years of residence for naturalisation. Investment thresholds and the naturalisation exam are out of scope.',
  'gr.scope':
    'The pilot checks only the time requirements in the Migration Code and the Citizenship Code. It does not check income, insurance, integration, language exams or other requirements; each result lists them, and open questions such as whether golden visa time counts towards long-term residence are flagged. Your entries are processed in your browser and are not saved or uploaded.',
  'gr.basics': 'About you',
  'gr.simulationDate': 'Simulation date',
  'gr.simulationDateHint':
    'Results are worked out for this date (the application date). It starts as today.',
  'gr.permits': 'Residence permits',
  'gr.permitsHint':
    'Add a row for each permit, then the next one if renewed on time; leave the end blank if it is still valid (for a golden visa, enter the expiry on the card to get the renewal dates).',
  'gr.permit': 'Permit {n}',
  'gr.from': 'Valid from',
  'gr.to': 'Valid until (leave blank if still valid)',
  'gr.kind': 'Permit type',
  'gr.kind.regular': 'Ordinary residence permit (work, family and others)',
  'gr.kind.investor': 'Golden visa (real estate investor permit Β.5)',
  'gr.kind.study': 'Study or vocational training',
  'gr.kind.temporary': 'National visa (such as digital nomad)',
  'gr.addPermit': 'Add a permit',
  'gr.trips': 'Trips abroad',
  'gr.tripsHint':
    'Add a row for each time you left Greece. You can include planned trips.',
  'gr.trip': 'Trip {n}',
  'gr.departed': 'Date you left Greece',
  'gr.returned': 'Date you came back to Greece',
  'gr.addTrip': 'Add a trip',
  'gr.nationality': 'Naturalisation route',
  'gr.route': 'Years of residence that apply to you',
  'gr.route.choose': 'Choose one',
  'gr.route.general':
    '7 years: holding a listed status when applying (such as long-term residence Μ1, a 10-year permit, or an investor permit such as the golden visa)',
  'gr.route.three-year':
    '3 years: EU citizen, spouse of a Greek with children, with parental responsibility for a Greek child born in Greece, or stateless (also holding a listed status when applying)',
  'gr.route.twelve-year':
    '12 years: holding another non-temporary permit when applying (such as an ordinary work permit)',
  'gr.remove': 'Remove',
  'gr.submit': 'Work out dates',
  'gr.errorSummary': 'Fix the items marked in red first.',
  'gr.error.date': 'Enter a valid date.',
  'gr.error.order': 'This date cannot be before the start date.',
  'gr.error.route': 'Choose the years of residence that apply to you.',
  'ie.entryLink': 'Open the Ireland pilot',
  'ie.entryDesc':
    'Use your immigration permissions (stamps) and travel record to work out the dates for naturalisation, naturalisation as a spouse, and Stamp 4 or Stamp 5.',
  'ie.title': 'Ireland: dates for naturalisation, spouses and Stamp 4 (pilot)',
  'ie.intro':
    'From your Irish immigration permissions (stamps) and trips, this works out the steps that depend on time alone: naturalisation (one year of continuous residence before applying plus four years in the eight before that, with the 70-day absence rule), naturalisation as the spouse or civil partner of an Irish citizen, and the Stamp 4 upgrade and Stamp 5 under Immigration Service Delivery (ISD) policy.',
  'ie.scope':
    'The pilot checks only the time requirements in the law and ISD guidance. It does not check character, intention to reside, the ceremony, fees or proofs; each result lists them. Stamp 4 and Stamp 5 are ISD policy, not statute. The draft bill published in 2026 (General Scheme) would lengthen the periods for naturalisation but is not law yet, so results only mention it. Your entries are processed in your browser and are not saved or uploaded.',
  'ie.basics': 'About you',
  'ie.simulationDate': 'Simulation date',
  'ie.simulationDateHint':
    'Results are worked out for this date (the application date). It starts as today. The rules are the current ones checked in 2026-11, also for past dates; in the archived sources the 57-month rule first covers a GEP on 2024-04-03 and an intra-company transfer on 2026-02-25 (when the upgrade page was last changed); the earlier rule is not included, so completion before that date shows as uncertain.',
  'ie.permits': 'Immigration permissions',
  'ie.permitsHint':
    'Going by your IRP cards or passport stamps, add a row for each permission, then the next one if renewed on time; leave the end blank if it is still valid. If a permission was replaced before the expiry printed on its card (for example a CSEP card to 2026-12-31 but a GEP from 2026-09-01), enter the actual last day of the old permission, not the card date. Include student permissions and time waiting for a protection decision too: they do not count. Add periods of lawful residence in Northern Ireland too, whatever route you choose: they count for naturalisation as a spouse only; after a move to Northern Ireland, an Irish permission that has not expired no longer counts as residence in the State.',
  'ie.permit': 'Permission {n}',
  'ie.from': 'Valid from',
  'ie.to': 'Valid until (leave blank if still valid)',
  'ie.kind': 'Permission type',
  'ie.kind.stamp1':
    'Stamp 1 (business, working holiday, ISD letter to work without an employment permit and other cases)',
  'ie.kind.stamp1-gep': 'Stamp 1 (General Employment Permit)',
  'ie.kind.stamp1-csep':
    'Stamp 1 or 1H (Critical Skills Employment Permit, researcher’s Hosting Agreement, Multi-Site GEP for hospital doctors)',
  'ie.kind.stamp1-ict': 'Stamp 1 (intra-company transfer permit)',
  'ie.kind.stamp1g-graduate': 'Stamp 1G (Third Level Graduate Programme)',
  'ie.kind.stamp1g-spouse':
    'Stamp 1G (spouse or partner of an employment permit holder, such as a Critical Skills, General Employment Permit or hospital doctor permit, or of a researcher on a Hosting Agreement)',
  'ie.kind.stamp1g-ict':
    'Stamp 1G (spouse or partner of an intra-company transfer permit holder)',
  'ie.kind.stamp1a': 'Stamp 1A (trainee accountant)',
  'ie.kind.stamp0':
    'Stamp 0 (independent means, visiting academic, elderly dependent relative and so on)',
  'ie.kind.stamp3':
    'Stamp 3 (volunteers, ministers of religion and other cases)',
  'ie.kind.stamp3-family':
    'Stamp 3 (spouse or partner of an employment permit holder or researcher, held under family reunification before moving to 1G)',
  'ie.kind.stamp4': 'Stamp 4',
  'ie.kind.stamp4d': 'Stamp 4D or 4S',
  'ie.kind.stamp4-eufam': 'Stamp 4 EUFam (family member of an EU citizen)',
  'ie.kind.stamp5': 'Stamp 5 (without condition as to time)',
  'ie.kind.student': 'Student Stamp 2 or 2A (does not count)',
  'ie.kind.protection-applicant':
    'Waiting for an international protection (asylum) decision (does not count)',
  'ie.kind.ni-residence':
    'Lawful residence in Northern Ireland (counts for naturalisation as a spouse only)',
  'ie.kind.other': 'Other (temporary protection and so on; uncertain)',
  'ie.addPermit': 'Add a permission',
  'ie.trips': 'Trips abroad',
  'ie.tripsHint':
    'Add a row for each time you left Ireland (short visits from Ireland to Northern Ireland included) and for each trip off the island while living in Northern Ireland; you can include planned trips. Enter periods of lawful residence in Northern Ireland as a permission above, not as a trip. The days you leave and come back are not absences.',
  'ie.trip': 'Trip {n}',
  'ie.departed': 'Date you left Ireland',
  'ie.returned': 'Date you came back to Ireland',
  'ie.addTrip': 'Add a trip',
  'ie.spouse': 'Spouse or civil partner',
  'ie.marriedOn':
    'Date you married or registered a civil partnership with an Irish citizen (leave blank if not)',
  'ie.marriedOnHint':
    'With a date, naturalisation as a spouse (s15A) is worked out too; you must live together, which this pilot does not check.',
  'ie.stamp4': 'Stamp 4 and Stamp 5',
  'ie.stamp4Route': 'Permission to work out',
  'ie.stamp4Route.choose': 'Choose one',
  'ie.stamp4Route.none': 'None',
  'ie.stamp4Route.csep':
    'Stamp 4 upgrade, 21 months: Critical Skills permit, researcher’s Hosting Agreement, Multi-Site GEP for hospital doctors',
  'ie.stamp4Route.gep':
    'Stamp 4 upgrade, 57 months: General Employment Permit, intra-company transfer',
  'ie.stamp4Route.spouse-1g':
    'Stamp 4 for spouses and partners on family reunification (Stamp 3 or 1G), after 5 years',
  'ie.stamp4Route.wcatt': 'Stamp 5: 96 months of legal residence',
  'ie.employmentStart': 'Date you started work in Ireland on that permit',
  'ie.employmentStartHint':
    'As in Revenue’s Employment Detail Summary; if you moved to Stamp 1 from another permission, the date the employment permit became valid. Enter above the permission you held before moving to Stamp 1 (such as a graduate 1G) and each later Stamp 1 or 1H: days without any permission do not count.',
  'ie.remove': 'Remove',
  'ie.submit': 'Work out dates',
  'ie.errorSummary': 'Fix the items marked in red first.',
  'ie.error.date': 'Enter a valid date.',
  'ie.error.order': 'This date cannot be before the start date.',
  'ie.error.route': 'Choose the permission to work out (or "None").',
  'pt.entryLink': 'Open the Portugal pilot',
  'pt.entryDesc':
    'Use your residence permits (golden visa included) and travel record to work out the dates for naturalisation, permanent residence, EU long-term residence and golden visa renewal.',
  'pt.title':
    'Portugal: dates for naturalisation, permanent residence and the golden visa (pilot)',
  'pt.intro':
    'From your Portuguese residence permits (golden visa included) and trips, this works out four steps that depend on time alone: the years of residence for naturalisation (under the nationality law in force since May 2026), permanent residence, EU long-term resident status, and the golden visa (ARI) minimum stays and renewal period. Investment amounts and language tests are out of scope.',
  'pt.scope':
    'The pilot checks only the time requirements in the nationality law and the foreigners law. It does not check language, criminal record, income, accommodation or other requirements; each result lists them, and open questions such as when the new law starts counting or how periods with gaps add up are flagged. Your entries are processed in your browser and are not saved or uploaded.',
  'pt.basics': 'About you',
  'pt.simulationDate': 'Simulation date',
  'pt.simulationDateHint':
    'Results are worked out for this date (the application date). It starts as today.',
  'pt.permits': 'Residence permits',
  'pt.permitsHint':
    'Add a row for each permit, then the next one if renewed on time; leave the end blank if it is still valid (for a golden visa, enter the expiry on the card to get the renewal dates). You can also add a row for time on a residence visa before your first permit. Permanent residence and EU long-term resident status have no time limit, so an expired card does not end them; the right of residence for 6 months after a temporary card expires is explained in the results.',
  'pt.permit': 'Permit {n}',
  'pt.from': 'Valid from',
  'pt.to': 'Valid until (leave blank if still valid)',
  'pt.kind': 'Permit type',
  'pt.kind.temporary': 'Temporary residence permit (work, family and others)',
  'pt.kind.golden-visa': 'Golden visa (residence permit for investment, ARI)',
  'pt.kind.study': 'Study, unpaid traineeship or volunteering permit',
  'pt.kind.visa': 'Residence visa (before your residence permit)',
  'pt.kind.permanent':
    'Permanent residence (autorização de residência permanente)',
  'pt.kind.eu-long-term':
    'EU long-term resident status (título UE de residência de longa duração)',
  'pt.addPermit': 'Add a permit',
  'pt.trips': 'Trips abroad',
  'pt.tripsHint':
    'Add a row for each time you left Portugal. You can include planned trips. If you hold a golden visa and live mostly abroad, enter each whole stretch from leaving to coming back.',
  'pt.trip': 'Trip {n}',
  'pt.departed': 'Date you left Portugal',
  'pt.returned': 'Date you came back to Portugal',
  'pt.addTrip': 'Add a trip',
  'pt.nationality': 'Naturalisation',
  'pt.route': 'Your nationality',
  'pt.route.choose': 'Choose one',
  'pt.route.cplp': 'National of a Portuguese-speaking country (7 years)',
  'pt.route.eu': 'Citizen of an EU member state (7 years)',
  'pt.route.eea':
    'Citizen of Norway, Iceland, Liechtenstein or Switzerland (10 years)',
  'pt.route.other': 'National of another country, China included (10 years)',
  'pt.route.stateless': 'Stateless (4 years)',
  'pt.pending':
    'I applied for naturalisation before the new law came into force on 19 May 2026, and it was still pending that day (the earlier law applies)',
  'pt.appliedOn': 'Date you applied for naturalisation',
  'pt.residenceApplied':
    'Date you applied for your first temporary residence permit (optional)',
  'pt.residenceAppliedHint':
    'The earlier law counts from the application for temporary residence, once granted; if left blank, it counts from the permit start.',
  'pt.remove': 'Remove',
  'pt.submit': 'Work out dates',
  'pt.errorSummary': 'Fix the items marked in red first.',
  'pt.error.date': 'Enter a valid date.',
  'pt.error.order': 'This date cannot be before the start date.',
  'pt.error.route': 'Choose your nationality group.',
  'pt.error.pendingDate':
    'Applications made after the new law came into force (2026-05-19) do not fall under the earlier law; check the date or untick the box.',
  'pt.error.afterSimulation':
    'The application date cannot be after the simulation date.',
  'es.entryLink': 'Open the Spain pilot',
  'es.entryDesc':
    'Use your residence permits and travel record to work out the dates for national long-term residence and citizenship by residence.',
  'es.title': 'Spain: dates for long-term residence and citizenship (pilot)',
  'es.intro':
    'From your Spanish residence permits and trips, this works out two steps that depend on time alone: national long-term residence (residencia de larga duración nacional) and citizenship by residence (nacionalidad por residencia). Eligibility for work, investment or arraigo permits is out of scope.',
  'es.scope':
    'The pilot checks only the time requirements in the regulations and the Civil Code. It does not check the language and constitution tests, conduct, giving up your nationality or other requirements; each result lists them, and counting the rules leave open is flagged. Your entries are processed in your browser and are not saved or uploaded.',
  'es.basics': 'About you',
  'es.simulationDate': 'Simulation date',
  'es.simulationDateHint':
    'Results are worked out for this date (the application date). It starts as today.',
  'es.permits': 'Residence permits',
  'es.permitsHint':
    'Add a row for each permit, then the next one if renewed on time; leave the end blank if it is still valid. A national long-term residence permit has no end date and an expired TIE card does not end it, so leave its end blank. Tick study stays.',
  'es.permit': 'Permit {n}',
  'es.from': 'Valid from',
  'es.to': 'Valid until (leave blank if still valid)',
  'es.study': 'This is a study stay (estancia por estudios)',
  'es.addPermit': 'Add a permit',
  'es.trips': 'Trips abroad',
  'es.tripsHint':
    'Add a row for each time you left Spain. You can include planned trips.',
  'es.trip': 'Trip {n}',
  'es.departed': 'Date you left Spain',
  'es.returned': 'Date you came back to Spain',
  'es.addTrip': 'Add a trip',
  'es.nationality': 'Citizenship route',
  'es.route': 'Years of residence that apply to you',
  'es.route.general': 'General (applies to Chinese citizens)',
  'es.route.refugee': 'Granted refugee status',
  'es.route.ibero':
    'National by origin of an Ibero-American country, Andorra, the Philippines, Equatorial Guinea or Portugal, or Sephardic',
  'es.route.marriage': 'Married to a Spanish citizen and not separated',
  'es.route.one-year': 'Another one-year case (such as born in Spain)',
  'es.marriedOn': 'Date you married a Spanish citizen',
  'es.remove': 'Remove',
  'es.submit': 'Work out dates',
  'es.errorSummary': 'Fix the items marked in red first.',
  'es.error.date': 'Enter a valid date.',
  'es.error.order': 'This date cannot be before the start date.',
  'jp.entryLink': 'Open the Japan pilot',
  'jp.entryDesc':
    'Use the start of your stay, your status and travel record to work out the dates for permanent residence and naturalisation, and how a lapsed re-entry permit breaks your stay.',
  'jp.title': 'Japan: dates for permanent residence and naturalisation (pilot)',
  'jp.intro':
    'From when your stay in Japan began, your status and your trips, this works out two steps that depend on time alone: permanent residence (永住許可) and naturalisation (帰化). A trip past your re-entry permit ends your status and starts the stay again, and that is counted too.',
  'jp.scope':
    'The pilot checks only the time requirements in the Immigration Control Act, the Nationality Act and the Immigration Services Agency guidelines. It does not check conduct, income, taxes and pensions, highly skilled points, Japanese language or integration; each result lists them. The permanent residence guideline changes from 2027-04-01 (longer periods for spouses and others, and a new test for absences), so dates are worked out by application date; open questions are flagged. Your entries are processed in your browser and are not saved or uploaded.',
  'jp.basics': 'About you',
  'jp.simulationDate': 'Simulation date',
  'jp.simulationDateHint':
    'Results are worked out for this date (the application date). It starts as today.',
  'jp.stayStart': 'Start of your unbroken stay in Japan',
  'jp.stayStartHint':
    'Enter the landing date your unbroken stay began; add every trip since under "Trips abroad" below, and a trip past your re-entry permit starts the stay again from your return.',
  'jp.pr': 'Permanent residence',
  'jp.prRoute': 'Permanent residence route that applies to you',
  'jp.prRoute.choose': 'Choose one',
  'jp.prRoute.general':
    'General: 10 years of unbroken stay, 5 of them on a work or residence status',
  'jp.prRoute.spouse':
    'Spouse of a Japanese national, permanent resident or special permanent resident',
  'jp.prRoute.child':
    'Child of a Japanese national, permanent resident or special permanent resident (change of status)',
  'jp.prRoute.child-birth':
    'Child of a permanent resident or similar born in Japan, applying for permanent resident status within 30 days of birth',
  'jp.bornOn': 'Date of birth in Japan',
  'jp.bornOnHint':
    'A child born in Japan, without landing, can apply to acquire status within 30 days of birth (Immigration Control Act art. 22-2; a deadline on a weekend, holiday or at the turn of the year moves to the next working day); after that, if the child already holds another status choose the child route for a change of status, and if the child has no status yet contact the regional immigration services bureau promptly.',
  'jp.prRoute.teijusha': 'Long-term resident (定住者)',
  'jp.prRoute.refugee': 'Recognised refugee or complementary protection',
  'jp.prRoute.hsp70': 'Highly skilled professional, 70 points or more',
  'jp.prRoute.hsp80':
    'Highly skilled professional, 80 points or more, or special highly skilled (J-Skip)',
  'jp.statusStart.general':
    'First day on a work or residence status, held without a break since',
  'jp.statusStart.teijusha': 'Date you became a long-term resident (定住者)',
  'jp.statusStart.refugee':
    'Date you were recognised as a refugee or for complementary protection',
  'jp.statusStart.hsp70': 'First day with 70 points, kept since',
  'jp.statusStart.hsp80':
    'First day with 80 points (or as special highly skilled), kept since',
  'jp.statusStartHint.general':
    'Technical Intern Training and Specified Skilled Worker (i) do not count; for applications from 2027-04-01, Employment for Skill Development, Intra-company Transferee and some Designated Activities do not count either.',
  'jp.newStatus':
    'Under the new guideline from 2027-04-01, first day on a work or residence status',
  'jp.newStatusHint':
    'The new guideline no longer counts Intra-company Transferee, Employment for Skill Development, Specified Skilled Worker (i) or some Designated Activities as work statuses. Applications from 2027-04-01 count the 5 years from here.',
  'jp.statusNone':
    'I do not yet hold a work or residence status the old guideline counts (such as only Technical Intern Training or Specified Skilled Worker (i))',
  'jp.newStatus.choose': 'Choose one',
  'jp.newStatus.same': 'The same as above',
  'jp.newStatus.own': 'A later date (I held a status it does not count)',
  'jp.newStatus.none':
    'My current status does not count (such as Intra-company Transferee)',
  'jp.newStatusStart':
    'First day on a status the new guideline counts, held since',
  'jp.departure': 'How the child leaves (birth route)',
  'jp.departureHint':
    'Leaving within 60 days of birth without a re-entry permit needs no application to acquire status (ISA Q&A Q28); leaving on a re-entry or deemed re-entry permit needs the status first.',
  'jp.departure.choose': 'Choose one',
  'jp.departure.none': 'Without a re-entry permit (landing anew on return)',
  'jp.departure.deemed': 'On a deemed re-entry permit (みなし再入国許可)',
  'jp.departure.permit': 'On a re-entry permit',
  'jp.renewalPending':
    'Before leaving I had applied to renew (or change) my status within the period of stay, and the decision was still pending',
  'jp.marriedLifeFrom': 'Date your married life began',
  'jp.marriedLifeFromHint':
    'The permanent residence guideline counts married life in substance and does not say whether it runs from registration or from when you began living together; if they differ, the later one gives the more cautious result.',
  'jp.excludedHint':
    'If part of your stay was on an exceptional, temporary Designated Activities status (such as continued job hunting, a job offer awaiting start, or a pending refugee claim), enter each period: for applications from 2027-04-01 it does not count towards the 10 years (guideline 第5). Leave this empty if none.',
  'jp.excludedPeriod': 'Excluded period {n}',
  'jp.excludedFrom': 'From',
  'jp.excludedTo': 'To',
  'jp.addExcluded': 'Add a period that does not count towards the 10 years',
  'jp.marriedOn': 'Date the marriage was registered (婚姻の日)',
  'jp.marriedOnHint':
    'Nationality Act art. 7 counts from the day of marriage: enter the date the marriage took effect (was registered).',
  'jp.naturalisation': 'Naturalisation (帰化)',
  'jp.natRoute': 'Naturalisation route that applies to you',
  'jp.natRoute.choose': 'Choose one',
  'jp.natRoute.general': 'General (Nationality Act art. 5)',
  'jp.natRoute.spouse':
    'Spouse of a Japanese national (Nationality Act art. 7)',
  'jp.dateOfBirth': 'Date of birth',
  'jp.homeMajorityLow': "My home country's age of majority is 18 or lower",
  'jp.homeMajorityAge': "Age of majority under your home country's law (years)",
  'jp.homeMajorityAgeHint':
    'Nationality Act art. 5 asks for age 18 and adulthood under your home country’s law; if adulthood there is above 18 (such as 19), enter that age, otherwise tick the box above.',
  'jp.trips': 'Trips abroad',
  'jp.tripsHint':
    'Add a row for each time you left Japan. You can include planned trips. A trip without a re-entry permit ticked uses the deemed re-entry permit (back within 1 year); if you enter the period of stay you held when leaving, you must also be back by then. On the born-in-Japan route, also choose how the child leaves (no permit, deemed or re-entry permit).',
  'jp.trip': 'Trip {n}',
  'jp.departed': 'Date you left Japan',
  'jp.returned': 'Date you came back to Japan',
  'jp.reentryPermit':
    'Left on a re-entry permit (not the deemed permit) and came back while it was valid',
  'jp.stayExpiry': 'Period of stay when you left (optional)',
  'jp.stayExpiryHint':
    'The expiry date on your residence card when you left; leave blank if you are a permanent resident or it did not end before you came back. If a renewal was pending when you left, also tick the box below (you then have until 2 months after expiry).',
  'jp.addTrip': 'Add a trip',
  'jp.remove': 'Remove',
  'jp.submit': 'Work out dates',
  'jp.errorSummary': 'Fix the items marked in red first.',
  'jp.error.date': 'Enter a valid date.',
  'jp.error.order': 'This date cannot be before the start date.',
  'jp.error.prRoute':
    'Choose the permanent residence route that applies to you.',
  'jp.error.natRoute': 'Choose the naturalisation route that applies to you.',
  'jp.error.specialPeriod':
    'Even with a renewal pending you can leave only within 2 months after your period of stay ended; check the dates.',
  'jp.error.newStatus': 'Choose how the new guideline counts your status.',
  'jp.error.homeMajority':
    "Tick that your home country's age of majority is 18 or lower, or enter the age.",
  'jp.error.age': 'Enter a whole number of years from 1 to 99.',
  'jp.error.newBeforeOld':
    'The new guideline counts fewer statuses than the old one, so this start cannot be before the old-guideline start above.',
  'jp.error.newWithoutOld':
    'You ticked that you hold no status the old guideline counts; anything the new guideline counts, the old one counts too, so choose "The same as above" or "My current status does not count" instead of a date.',
  'jp.error.overlap': 'This trip overlaps an earlier one.',
  'us.entryLink': 'Open the United States pilot',
  'us.entryDesc':
    'Use your green card date and travel record to work out the dates for naturalization, naturalization as the spouse of a citizen, removing conditions and time abroad.',
  'us.title':
    'United States: dates for naturalization and your green card (pilot)',
  'us.intro':
    'From your green card date and trips, this works out the steps that depend on time alone: general naturalization, naturalization as the spouse of a U.S. citizen, the filing period for removing conditions, and how long you can be away and still return on your green card. How you get a green card (family, employment and investment categories, priority dates) is out of scope.',
  'us.scope':
    'The pilot checks only the time requirements in the law and the USCIS Policy Manual. It does not check the English and civics tests, good moral character, abandonment of residence or other requirements; each result lists them. Your entries are processed in your browser and are not saved or uploaded.',
  'us.basics': 'About you',
  'us.simulationDate': 'Simulation date',
  'us.simulationDateHint':
    'Results are worked out for this date (for naturalization, the filing date). It starts as today.',
  'us.dateOfBirth': 'Date of birth',
  'us.greenCard': 'Green card',
  'us.permanentResident':
    'Date you became a permanent resident (Resident Since on the card)',
  'us.permanentResidentHint':
    'For a conditional green card, enter the date you yourself got conditional status.',
  'us.conditional': 'Green card type',
  'us.conditional.none': 'Regular green card',
  'us.conditional.marriage': 'Conditional, based on marriage (file I-751)',
  'us.conditional.investor': 'Conditional, based on investment (file I-829)',
  'us.stateResidenceFrom':
    'Date you started living in your current state or USCIS district (optional)',
  'us.role': 'You got your conditional green card',
  'us.role.choose': 'Choose one',
  'us.role.principal': 'Yourself, through marriage or investment',
  'us.roleHint':
    'A spouse or child who got the card with a parent or the investor chooses by whether they file together with that person.',
  'us.role.joint': 'With a parent or the investor, filing together',
  'us.role.separate': 'With a parent or the investor, filing separately',
  'us.principalSince':
    'Date the principal applicant got their conditional green card',
  'us.married': 'I am married to and living with a U.S. citizen',
  'us.marriedOn': 'Date of marriage',
  'us.spouseCitizenSince':
    'Date your spouse became a U.S. citizen (leave blank if a citizen by birth)',
  'us.trips': 'Trips abroad',
  'us.tripsHint':
    'Add a row for each time you left the United States after getting your green card. You can include planned trips.',
  'us.trip': 'Trip {n}',
  'us.departed': 'Date you left the United States',
  'us.returned': 'Date you came back to the United States',
  'us.addTrip': 'Add a trip',
  'us.remove': 'Remove',
  'us.submit': 'Work out dates',
  'us.errorSummary': 'Fix the items marked in red first.',
  'us.error.date': 'Enter a valid date.',
  'us.error.order': 'This date cannot be before the start date.',
  'us.error.beforeGreenCard': 'Enter only trips after you got your green card.',
  'us.error.role': 'Choose how you got your conditional green card.',
  'us.error.principalOrder':
    'The principal applicant’s date cannot be after the date you got your green card.',
  'ca.entryLink': 'Open the Canada pilot',
  'ca.entryDesc':
    'Use the date you became a permanent resident and your travel record to work out the residency obligation and the physical presence for citizenship.',
  'ca.title':
    'Canada: dates for keeping permanent residence and for citizenship (pilot)',
  'ca.intro':
    'From the date you became a Canadian permanent resident, your status before that and your trips, this works out two steps that depend on time alone: the residency obligation for keeping permanent resident status, and the physical presence for citizenship. How you get permanent residence (Express Entry points, provincial nomination, sponsorship and so on) is out of scope.',
  'ca.scope':
    'The pilot checks only the day counts written in the law. It does not check tax filing, language, the citizenship test, prohibitions or other requirements; each result lists them. For an online application, the official calculator in your account takes precedence. Your entries are processed in your browser and are not saved or uploaded.',
  'ca.basics': 'About you',
  'ca.simulationDate': 'Simulation date',
  'ca.simulationDateHint':
    'Results are worked out for this date (for citizenship, the date you sign). It starts as today.',
  'ca.dateOfBirth': 'Date of birth',
  'ca.permanentResident': 'Date you became a permanent resident',
  'ca.periods': 'Temporary status before permanent residence',
  'ca.periodsHint':
    'Add a row for each period you were in Canada lawfully as a visitor, student, worker or protected person. Leave the end blank if it ran until the day before you became a permanent resident. Do not include time without status or waiting on a refugee claim.',
  'ca.period': 'Status {n}',
  'ca.from': 'Start date',
  'ca.to':
    'End date (leave blank if it ran until you became a permanent resident)',
  'ca.addPeriod': 'Add a period',
  'ca.trips': 'Trips abroad',
  'ca.tripsHint':
    'Add a row for each time you left Canada. You can include planned trips; if you are abroad now, enter the date you expect to return, and the results follow it.',
  'ca.trip': 'Trip {n}',
  'ca.departed': 'Date you left Canada',
  'ca.returned': 'Date you came back to Canada',
  'ca.addTrip': 'Add a trip',
  'ca.remove': 'Remove',
  'ca.submit': 'Work out dates',
  'ca.errorSummary': 'Fix the items marked in red first.',
  'ca.error.date': 'Enter a valid date.',
  'ca.error.order': 'This date cannot be before the start date.',
  'ca.error.afterPr':
    'A temporary status must start before you became a permanent resident.',
  'nz.entryLink': 'Open the New Zealand pilot',
  'nz.entryDesc':
    'Use your resident visa and travel record to work out when your travel conditions end and the dates for the permanent resident visa and citizenship presence.',
  'nz.title':
    'New Zealand: dates for the permanent resident visa and citizenship (pilot)',
  'nz.intro':
    'From your New Zealand resident visa and trips, this works out three steps that depend on time alone: when your resident visa travel conditions end, the days needed for a permanent resident visa, and the presence requirement for citizenship. Whether you can get a resident visa (Skilled Migrant points, employers, investment and so on) is out of scope.',
  'nz.scope':
    'The pilot checks only the time requirements written in the immigration instructions and the Citizenship Act. It does not check character, English, conditions on your resident visa or other requirements; each result lists them. Your entries are processed in your browser and are not saved or uploaded.',
  'nz.basics': 'About you',
  'nz.simulationDate': 'Simulation date',
  'nz.simulationDateHint':
    'Results are worked out for this date. It starts as today.',
  'nz.dateOfBirth': 'Date of birth',
  'nz.firstArrival': 'Date you first arrived in New Zealand (on any visa)',
  'nz.visas': 'Resident visa',
  'nz.residentGranted': 'Date your resident visa was granted',
  'nz.residentGrantedHint':
    'If it was granted outside New Zealand, you are in New Zealand as a resident only from your next arrival.',
  'nz.category': 'Residence category',
  'nz.category.general':
    'General (Skilled Migrant, partner, work to residence and others)',
  'nz.category.parent': 'Parent',
  'nz.category.religious-worker': 'Religious Worker',
  'nz.category.aip-growth': 'Active Investor Plus: Growth',
  'nz.category.aip-balanced': 'Active Investor Plus: Balanced',
  'nz.travelConditionsEnd':
    'Travel conditions expiry date on your visa (optional)',
  'nz.travelConditionsEndHint':
    'The Expiry date travel on your eVisa. If blank, it is worked out under the current rule; older visas may differ, so entering it is better.',
  'nz.conditions':
    's49 conditions on your resident visa on the simulation date (such as employment, investment or sponsorship)',
  'nz.conditions.unsure': 'Not sure (go by the visa category)',
  'nz.conditions.none': 'None, or already removed',
  'nz.conditions.met': 'Met, not yet removed',
  'nz.conditions.outstanding': 'Not yet met',
  'nz.nonPrincipal':
    'I was included as a partner or child (not the principal applicant)',
  'nz.prvGranted':
    'Date your permanent resident visa was granted (leave blank if you do not have one)',
  'nz.trips': 'Trips abroad',
  'nz.tripsHint':
    'Add a row for each time you left New Zealand after becoming a resident. If your resident visa was granted while you were abroad, include that trip too. You can include planned trips.',
  'nz.trip': 'Trip {n}',
  'nz.departed': 'Date you left New Zealand',
  'nz.returned': 'Date you came back to New Zealand',
  'nz.addTrip': 'Add a trip',
  'nz.remove': 'Remove',
  'nz.submit': 'Work out dates',
  'nz.errorSummary': 'Fix the items marked in red first.',
  'nz.error.date': 'Enter a valid date.',
  'nz.error.order': 'This date cannot be before the start date.',
  'nz.error.beforeBirth':
    'Your first arrival cannot be before your date of birth.',
  'nz.error.beforeArrival': 'A trip cannot start before your first arrival.',
  'nz.error.prvOrder':
    'The permanent resident visa cannot be granted before the resident visa.',
  'home.disclaimerEnglish':
    'Based on the information you entered, these rules may be relevant. This simulator provides general policy information and hypothetical scenario modelling. It does not determine your legal immigration status, is not immigration or legal advice, and does not guarantee the outcome of an application.',
  'form.title': 'Enter your timeline',
  'form.step': 'Step',
  'form.of': 'of',
  'form.saved':
    'Your draft is saved on this device. Your inputs are not uploaded.',
  'form.storageUnavailable':
    'Storage is unavailable. Your inputs are kept while you navigate, but may be lost if you refresh or close the page.',
  'form.continue': 'Continue',
  'form.back': 'Back',
  'form.results': 'View results',
  'form.remove': 'Remove',
  'form.optional': 'Optional',
  'form.yes': 'Yes',
  'form.no': 'No',
  'form.choose': 'Select an option',
  'step.basic': 'About you',
  'step.screening': 'Check if you need professional advice',
  'step.episodes': 'Immigration permission history',
  'step.absences': 'Time outside the UK',
  'step.income': 'Earnings by tax year',
  'step.benefits': 'Benefits and statutory payments',
  'step.relationships': 'Family relationships',
  'step.english': 'English and Life in the UK',
  'step.date': 'Simulation date',
  'basic.dob': 'Date of birth',
  'basic.nationality': 'Nationality',
  'basic.nationalityHint':
    'Type a country name in English or Chinese, or its three-letter code (ISO 3166-1 alpha-3), for example China or CHN.',
  'basic.nationalitySelected': 'Selected: {name} ({code})',
  'screening.criminality':
    'Do you have a criminal record in the UK or overseas?',
  'screening.breach': 'Have you breached immigration rules?',
  'screening.breachHint':
    'This includes overstaying, breaching visa conditions, deception, obstructing immigration control or illegal entry. Illegal entry as an adult on a non-protection route still leads to regulated review by the engine.',
  'screening.debt': 'Do you have any outstanding government debt?',
  'screening.message':
    'You have reported a criminal record, which needs regulated professional assessment. This simulator stops the automated assessment here and does not collect further information.',
  'breaches.title': 'Immigration breach records',
  'breaches.item': 'Breach record',
  'breaches.add': 'Add a breach record',
  'breaches.type': 'Breach type',
  'breaches.date': 'Date of the breach (required)',
  'breaches.article31':
    'Do you consider yourself protected by Refugee Convention Article 31?',
  'breaches.required':
    'Add at least one breach record, or answer no to immigration breaches.',
  'episodes.resettlementScheme': 'Resettlement or sponsorship route',
  'episodes.sustainedActivity': 'Sustained activity on this route',
  'episodes.globalTalentEndorsement':
    'Endorsement or prize for your first Global Talent permission',
  'episodes.globalTalentEndorsementHint':
    'If your endorsing body is not listed below, leave this as “Not provided / unsure”.',
  'episodes.endorsement.RESEARCH_BODY':
    'Research body endorsement (Royal Society, British Academy, Royal Academy of Engineering or UKRI)',
  'episodes.endorsement.ARTS_COUNCIL_ENGLAND':
    'Arts Council England endorsement',
  'episodes.endorsement.TECH_NATION': 'Tech Nation endorsement',
  'episodes.endorsement.PRIZE': 'A prize listed in Prestigious Prizes',
  'episodes.globalTalentCriteria': 'Endorsement criteria',
  'episodes.criteria.EXCEPTIONAL_TALENT': 'exceptional talent',
  'episodes.criteria.EXCEPTIONAL_PROMISE': 'exceptional promise',
  'episodes.familyPermission': 'Appendix FM permission type',
  'episodes.familyPermission.PARTNER_FIVE_YEAR': 'Partner, 5-year route',
  'episodes.familyPermission.PARTNER_TEN_YEAR': 'Partner, 10-year route',
  'episodes.familyPermission.PARENT': 'Parent of a child',
  'episodes.familyPermissionHint':
    'Enter your partner’s status in the Family relationships step, and your own and your partner’s income for the last completed tax year in the Earnings by tax year step (for the 5-year route’s financial requirement).',
  'episodes.innovatorSettlementCriteria':
    'Settlement endorsement criteria met by the business (INNF 17.1(f))',
  'episodes.innovatorCriteriaHint':
    'Select every criterion met. Leaving all unchecked means “None of the above”.',
  'episodes.innovatorCriteriaNone': 'None of the above',
  'episodes.innovatorSettlementEndorser':
    'Who issued your Innovator Founder settlement endorsement?',
  'episodes.innovatorSettlementEndorserHint':
    'If it is a Legacy Endorsing Body, compare it with the body that supported your last grant of permission (INNF 17.5).',
  'episodes.innovatorEndorser.NON_LEGACY': 'A non-legacy Endorsing Body',
  'episodes.innovatorEndorser.LEGACY_SAME': 'The same Legacy Endorsing Body',
  'episodes.innovatorEndorser.LEGACY_DIFFERENT':
    'A different Legacy Endorsing Body',
  'episodes.innovatorCriteria.INVESTMENT':
    'At least £50,000 invested in the business and actively spent furthering it (INNF 17.1(f)(i))',
  'episodes.innovatorCriteria.CUSTOMERS':
    'Customer numbers at least doubled in the last 3 years and exceed the average for comparable UK businesses (INNF 17.1(f)(ii))',
  'episodes.innovatorCriteria.RESEARCH_AND_IP':
    'Significant research and development activity, with an application for intellectual property protection in the UK (INNF 17.1(f)(iii))',
  'episodes.innovatorCriteria.REVENUE':
    'At least £1,000,000 in annual gross revenue in the last full accounting year (INNF 17.1(f)(iv))',
  'episodes.innovatorCriteria.EXPORT_REVENUE':
    'At least £500,000 in annual gross revenue in the last full accounting year, including at least £100,000 from exports (INNF 17.1(f)(v))',
  'episodes.innovatorCriteria.JOBS':
    'At least 10 full-time equivalent jobs created for settled workers (INNF 17.1(f)(vi))',
  'episodes.innovatorCriteria.JOBS_WITH_SALARY':
    'At least 5 full-time-equivalent jobs created for settled workers, each paying an average of at least £25,000 a year in gross salary, excluding allowances (INNF 17.1(f)(vii))',
  'episodes.privateLifeRoute': 'Basis of Appendix Private Life permission',
  'episodes.privateLifeRoute.CHILD':
    'Granted as a child (under 18, with at least 7 years of continuous residence in the UK; PL 3.1 / 10.1)',
  'episodes.privateLifeRoute.YOUNG_ADULT':
    'Aged 18–24, arrived before 18 and has lived continuously in the UK for at least half their life (PL 4.1)',
  'episodes.privateLifeRoute.ADULT':
    'Other (aged 18 or over on the date of application: more than 20 years of continuous residence in the UK, or very significant obstacles to integration into the country they would have to live in if required to leave the UK; PL 5.1)',
  'benefits.protectionStatusRevoked':
    'My protection status has been revoked or I have renounced it (STP 4.1)',
  'benefits.asylumSupportRepayment':
    'Do you need to repay asylum support costs?',
  'result.protectionNotice':
    'Protection route conclusions reflect only the published policy framework. Article 31 safeguards, whether time before the routes launch will count, and repayment and public funds details have not yet been published. Read these conclusions alongside the pending details.',
  'episodes.hint':
    'Enter the start and end dates of each grant of immigration permission. Leave the list empty if you have none.',
  'episodes.item': 'Permission period',
  'episodes.add': 'Add a permission period',
  'episodes.empty': 'No permission periods added.',
  'episodes.route': 'Immigration route',
  'episodes.from': 'Valid from',
  'episodes.to': 'Valid to',
  'episodes.roleHint':
    'Choose dependant if this permission was granted as someone else’s dependant, for example the partner or child of a Skilled Worker or Global Talent holder, whether or not you were granted at the same time. Otherwise choose main applicant, for example a Skilled Worker, or a partner of a British citizen or settled person holding a family visa.',
  'episodes.role': 'Applicant role',
  'episodes.MAIN': 'Main applicant',
  'episodes.DEPENDANT': 'Dependant',
  'episodes.soc': 'SOC 2020 occupation code (optional)',
  'episodes.salary': 'Sponsored annual salary (GBP, optional)',
  'absences.hint':
    'Enter the dates you left and returned to the UK. Continue if you have no absences. You can remove existing entries.',
  'absences.item': 'Absence',
  'absences.add': 'Add an absence',
  'absences.empty': 'No absences added.',
  'absences.from': 'Date you left the UK',
  'absences.to': 'Date you returned',
  'income.hint':
    'Enter earnings for the 7 completed UK tax years before the simulation date. Leave unknown amounts blank. Enter 0 for no earnings. All amounts are in GBP.',
  'income.taxYearHint':
    'The UK tax year runs from 6 April to 5 April the following year. Changing the simulation date in the final step updates these years.',
  'income.simulationDate':
    'Tax years are listed for the simulation date {date}; change it in the last step.',
  'income.copyAbove': 'Same as {year}',
  'income.earnings': 'Personal annual earnings',
  'income.partner': 'Partner annual earnings (optional)',
  'income.partnerHint':
    'Leave partner earnings blank if you are not relying on them.',
  'income.cashSavings': 'Cash savings (you and your partner combined, £)',
  'income.cashSavingsHint':
    'Savings can cover an income shortfall: at least £{base} plus the shortfall (E-LTRP.3.1(b); settlement applications do not multiply by 2.5 under E-ILRP.1.3(1A)). Enter 0 if you have no savings.',
  'benefits.partnerSpecifiedBenefit':
    "My partner receives a benefit listed in E-LTRP.3.3(a) (such as Carer's Allowance, Personal Independence Payment, Disability Living Allowance or Attendance Allowance)",
  'benefits.hint':
    'Enter any benefits or statutory payments received. Public funds are the benefits and services listed in the Immigration Rules, such as Universal Credit, Housing Benefit, Child Benefit and Personal Independence Payment. Statutory payments are paid by employers under the law, such as Statutory Maternity Pay and Statutory Sick Pay, and are not public funds. The reform column uses this definition as a modelling assumption; the final scope and exemptions are still to be set (PD-013). Leave the end date blank if it is still being received.',
  'benefits.item': 'Payment record',
  'benefits.add': 'Add a payment record',
  'benefits.empty': 'No payment records added.',
  'benefits.type': 'Benefit or payment name',
  'benefits.from': 'Start date',
  'benefits.to': 'End date (optional)',
  'relationships.hint':
    'Add a partner, parent or child relevant to this scenario. Names and identity documents are not needed.',
  'relationships.item': 'Family relationship',
  'relationships.add': 'Add a family relationship',
  'relationships.empty': 'No family relationships added.',
  'relationships.type': 'Relationship to you',
  'relationships.PARTNER': 'Partner',
  'relationships.PARENT': 'Parent',
  'relationships.CHILD': 'Child',
  'relationships.status': 'Their status',
  'relationships.BRITISH_CITIZEN': 'British citizen',
  'relationships.SETTLED': 'Settled',
  'relationships.OTHER': 'Other',
  'english.hint':
    'Select “Not provided / unsure” if you are unsure whether an exemption applies.',
  'date.label': 'Which date would you like to simulate?',
  'date.hint':
    'The default is today. You can choose another date. Changing it updates the income years. Check them before viewing your results.',
  'date.reviewIncome': 'Go back to check earnings',
  'error.required': 'Complete this field.',
  'error.nationality':
    'Choose a country or territory from the list, or enter its three-letter code from the list.',
  'error.range': 'The end date must not be before the start date.',
  'error.soc': 'Enter a four-digit SOC 2020 occupation code, or leave blank.',
  'game.day': 'Day {day} of 3',
  'game.morning': 'Good morning',
  'game.beginDay': 'Get up and start the day',
  'game.mailCount': '{count} letter{count:s} in your mailbox',
  'game.noFestival': 'An ordinary day, with little things to look forward to.',
  'game.sunny': 'Sunny',
  'game.cloudy': 'Cloudy',
  'game.rain': 'Rain',
  'game.snow': 'Snow',
  'game.workday': 'Workday',
  'game.weekend': 'Weekend',
  'game.special': 'Special day',
  'game.fastForward': 'Fast-forward this season',
  'game.fastConfirm':
    'Follow a daily routine for the rest of the season, stopping for events.',
  'game.endDay': 'Call it a day',
  'game.sleep': 'Go to sleep',
  'game.sleepConfirm':
    'Return to bed and end the day? Any unread events will arrive first.',
  'game.confirm': 'Confirm',
  'game.cancel': 'Not yet',
  'game.daysReview': 'Days of this season',
  'game.bag': 'Bag',
  'game.friends': 'Townsfolk',
  'game.gift': 'Give a gift',
  'game.giftDone': 'You already gave a gift today',
  'game.emptyBag': 'Your bag is empty.',
  'game.eat': 'Eat',
  'game.cook': 'Cook',
  'game.kitchen': 'Kitchen',
  'game.kitchenHint': 'Cook at the kitchen in your home.',
  'game.recipeNeeds': 'Needs',
  'game.buy': 'Buy',
  'game.quantity': 'Quantity',
  'game.purchased': 'Added to your bag',
  'game.itemFallback': 'Item',
  'game.hours': 'Opening hours',
  'game.closed': 'Closed now',
  'game.closedLabel': 'Closed',
  'game.noVisaActions': 'No immigration actions are available here right now.',
  'game.tooLate':
    'There is not enough time to finish before closing at {time}.',
  'game.tooLateSome':
    'Some things cannot be finished before closing at {time}; only those that still fit today are listed.',
  'game.openAllDay': 'Open all day',
  'game.minutes': '{count} minutes',
  'game.peopleHere': 'People here',
  'game.talk': 'Talk',
  'game.finishedTalking': 'See you later',
  'game.reveal': 'Show full line',
  'game.plot': 'Plot {count}',
  'game.plant': 'Plant',
  'game.water': 'Water',
  'game.watered': 'Watered today',
  'game.harvest': 'Harvest',
  'game.growth': 'Growth {count} / {days}',
  'game.cropMaturity': 'Days to maturity with watering · {days}',
  'game.cropMature': 'Ready to harvest.',
  'game.cropTimeLeft': 'Days left this season after today · {days}',
  'game.cropSeasonWarning':
    'Any crops left in the ground will be cleared when the season changes.',
  'game.noSeeds': 'No seeds for this season. Visit the corner shop.',
  'game.rentFirst': 'Rent a plot at the allotment shed first.',
  'game.fish': 'Fish',
  'game.cast': 'Cast the line',
  'game.waitingFish': 'Watch the float…',
  'game.bite': 'A bite! Reel in now!',
  'game.reel': 'Reel in',
  'game.fishWin': 'Caught it!',
  'game.fishMiss': 'It got away',
  'game.castingFish': 'A swing of the rod; the line lands…',
  'game.reelingFish': 'Pulling the line back in…',
  'game.fishEasy': 'Easy mode (2 seconds)',
  'game.fishEasyHint':
    'When the float dips, press Space / E or tap Reel in within 2 seconds. Space / E also casts the line.',
  'game.fishFirst': 'First catch! Added to your collection.',
  'game.fishCollected': 'Hello again! See this fish in your collection.',
  'game.fishJunk': 'A little pond surprise, brought safely ashore.',
  'game.fishRetry': 'Try again. No game time or items were used.',
  'game.kitchenAdd': 'Add {item} × {count}',
  'game.kitchenServe': 'Plate up and serve',
  'game.kitchenStep': 'Step {step} / {total}',
  'game.kitchenSkip': 'Skip the steps and finish cooking',
  'game.kitchenRecipes': 'Back to recipes',
  'game.kitchenComment': 'A little homemade goodness, just right.',
  'game.kitchenNoIngredients':
    'You do not have the ingredients for any dish yet: vegetables come from allotment harvests, and perch from the pond.',
  'game.prepare-dumplings': 'Fold the dumplings and simmer',
  'game.prepare-summer-corn': 'Turn the corn on the grill',
  'game.prepare-turnip-soup': 'Stir the simmering soup',
  'game.prepare-corn-soup': 'Stir until creamy',
  'game.prepare-baked-potato': 'Bake until fluffy inside',
  'game.prepare-salad': 'Toss gently',
  'game.prepare-fish-and-potatoes': 'Turn the fish in the pan',
  'game.prepare-strawberry-jam': 'Stir until the jam thickens',
  'game.fishHint':
    'When the float dips, press Space / E or tap Reel in within 0.6 seconds.',
  'game.mailbox': 'Mailbox',
  'game.readMail': 'Read the next letter',
  'game.noMail': 'All caught up with the post.',
  'game.desk': 'Desk',
  'game.bed': 'Bed',
  'game.exitHome': 'Leave home',
  'game.interact': 'Interact: {name}',
  'game.goHome': 'Go home',
  'game.muted': 'Sound off',
  'game.unmuted': 'Sound on',
  'game.continueFast': 'Continue the routine after this event',
  'game.eventResult': 'What happened next',
};
