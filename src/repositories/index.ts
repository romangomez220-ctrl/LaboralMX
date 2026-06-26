/**
 * repositories/index.ts
 * -----------------------------------------------------------------------------
 * ÚNICO punto del proyecto donde se decide qué implementación de cada
 * repositorio está activa. Todo componente debe importar los repositorios
 * desde aquí (`import { validatorsRepository } from '../../repositories'`),
 * nunca desde `local/...` ni desde `supabase/...` directamente.
 *
 * Fase 3: activado Supabase como implementación real para Labs/Admin/
 * Validadores. Las implementaciones locales (Fase 2) se conservan en
 * `local/` sin borrarse — siguen siendo útiles como referencia y como
 * fallback de desarrollo si alguien quiere trabajar sin conexión a
 * Supabase, pero ya no son las que usa la aplicación.
 * -----------------------------------------------------------------------------
 */

import { supabaseAuthRepository } from './supabase/supabaseAuthRepository'
import { supabaseValidatorsRepository } from './supabase/supabaseValidatorsRepository'
import { supabaseToolsRepository } from './supabase/supabaseToolsRepository'
import { supabaseAssignmentsRepository } from './supabase/supabaseAssignmentsRepository'
import { supabaseFeedbackRepository } from './supabase/supabaseFeedbackRepository'
import { supabaseActivityRepository } from './supabase/supabaseActivityRepository'

import type { AuthRepository } from './authRepository'
import type { ValidatorsRepository } from './validatorsRepository'
import type { ToolsRepository } from './toolsRepository'
import type { AssignmentsRepository } from './assignmentsRepository'
import type { FeedbackRepository } from './feedbackRepository'
import type { ActivityRepository } from './activityRepository'

export const authRepository: AuthRepository = supabaseAuthRepository
export const validatorsRepository: ValidatorsRepository = supabaseValidatorsRepository
export const toolsRepository: ToolsRepository = supabaseToolsRepository
export const assignmentsRepository: AssignmentsRepository = supabaseAssignmentsRepository
export const feedbackRepository: FeedbackRepository = supabaseFeedbackRepository
export const activityRepository: ActivityRepository = supabaseActivityRepository
