

// Legacy client - redirects to the new singleton client
import { createClient } from './utils/supabase/client.js'

const supabase = createClient()

export default supabase