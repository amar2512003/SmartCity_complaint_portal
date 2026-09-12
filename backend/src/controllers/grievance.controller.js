import { createGrievance, getCitizenGrievances } from '../models/grievance.model.js';
import { ok, fail } from '../utils/apiResponse.util.js';
import { t } from '../i18n/index.js';

export async function create(req, res) {
  try {
    const g = await createGrievance({ citizenId: req.user.id, ...req.body });
    return ok(res, g, t('grievance:create_success', req.lang));
  } catch (e) {
    console.error('createGrievance:', e);
    return fail(res, t('grievance:create_failed', req.lang), 500);
  }
}

export async function mine(req, res) {
  try {
    return ok(res, await getCitizenGrievances(req.user.id));
  } catch (e) {
    console.error('getCitizenGrievances:', e);
    return fail(res, t('grievance:fetch_failed', req.lang), 500);
  }
}
