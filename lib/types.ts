export interface Stand {
  id: number;
  order_index: number;
  name: string;
  code: string | null;
  hint_1: string;
  hint_2: string;
  character_name: string;
  anime_name: string;
  initial: string;
  narrative_role: string | null;
  map_x: number;
  map_y: number;
  logo_url: string | null;
}

export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  pseudo: string;
  rgpd_consent: boolean;
  newsletter_consent: boolean;
  created_at: string;
  completed_at: string | null;
  final_anime_guess: string | null;
  is_winner_eligible: boolean;
  onboarding_seen: boolean;
  reset_used: boolean;
}

export interface NarrativeOrderEntry {
  role: string;
  character: string;
  letter: string;
}

export interface Progress {
  id: string;
  participant_id: string;
  stand_id: number;
  validated_at: string;
}

export interface MeResponse {
  participant: Participant;
  progress: Progress[];
  stands: Pick<Stand, "id" | "order_index" | "name" | "map_x" | "map_y">[];
  nextStandId: number | null;
}
