import type { JapanDraft } from './japan-draft';
import {
  natRouteFields,
  natSections,
  prFilingSections,
  prRouteFields,
  prStatusSections,
  travelRouteFields,
  tripFields,
  type JapanField,
} from './japan-fields';

const prEvidence = Object.values({
  ...prStatusSections,
  ...prFilingSections,
}).flat();
const natEvidence = Object.values(natSections).flat();

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Policy inputs use missing evidence for unknown. On disk each optional
// yes/no question has an explicit answer, including those in optional groups.
function mapAnswers(record: object, fields: JapanField[], writing: boolean) {
  const result: Record<string, unknown> = { ...record };
  for (const field of fields) {
    const key = field.name;
    const value = result[key];
    if (field.type === 'boolean' && !field.required) {
      if (writing && value === undefined) result[key] = null;
      else if (!writing && value === null && key !== 'alreadyDeparted')
        delete result[key];
    } else if (field.type === 'list' && Array.isArray(value)) {
      result[key] = value.map((row) =>
        isRecord(row) ? mapAnswers(row, field.fields, writing) : row,
      );
    } else if (field.type === 'group') {
      if (key === 'businessManager' && result.kind !== key && !value) continue;
      if (!isRecord(value) && !(writing && value === undefined)) continue;
      const group = mapAnswers(value ?? {}, field.fields, writing);
      if (Object.keys(group).length) result[key] = group;
      else if (isRecord(value) && Object.keys(value).length) delete result[key];
    }
  }
  return result;
}

function mapDraft(draft: JapanDraft, writing: boolean) {
  const pr = draft.permanentResidence;
  const nat = draft.naturalisation;
  return {
    ...draft,
    trips: draft.trips.map((row) => mapAnswers(row, tripFields, writing)),
    permanentResidence: {
      ...pr,
      routes: pr.routes.map((r) =>
        mapAnswers(r, prRouteFields[r.route], writing),
      ),
      evidence:
        pr.routes.length || Object.keys(pr.evidence).length
          ? mapAnswers(pr.evidence, prEvidence, writing)
          : pr.evidence,
    },
    naturalisation: {
      ...nat,
      routes: nat.routes.map((r) =>
        mapAnswers(r, natRouteFields[r.route], writing),
      ),
      evidence:
        nat.routes.length || Object.keys(nat.evidence).length
          ? mapAnswers(nat.evidence, natEvidence, writing)
          : nat.evidence,
    },
    reentry: draft.reentry.map((r) =>
      mapAnswers(r, travelRouteFields[r.route], writing),
    ),
  };
}

export function storeJapanAnswers(draft: JapanDraft): object {
  return draft.answerFormat === 'explicit' ? mapDraft(draft, true) : draft;
}

export function readJapanAnswers(draft: JapanDraft): JapanDraft {
  // Only the wire representation allows null in place of optional booleans.
  return draft.answerFormat === 'explicit'
    ? (mapDraft(draft, false) as unknown as JapanDraft)
    : draft;
}
