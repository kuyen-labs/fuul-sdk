import { Conversion } from '../../conversions/types';
import { Trigger } from '../../triggers/types';

enum ProjectIntegrationType {
  FUUL_HOSTED = 'FUUL_HOSTED',
  HYBRID = 'HYBRID',
  PROJECT_HOSTED = 'PROJECT_HOSTED',
}
type ProjectSettings = {
  validateEventSignature?: boolean;
  integrationType?: ProjectIntegrationType;
  userLandingPageUrl?: string; // Url to redirect the user after connecting the wallet on fuul hosted page
  partnerLandingPageUrl?: string; // Url of the project hosted page for creating tracking links
  userOnboardingPageUrl?: string; // Url of the project hosted page for onboarding users and connecting wallets
};

type ApiKey = {
  id: string;
  token: string;
};

type ProjectTeamMember = {
  id: string;
  address: string;
  role: string;
  enabled: boolean;
};

export type Project = {
  category: string;
  conversions: Conversion[] | [];
  description: string;
  slug: string;
  id: string;
  name: string;
  thumbnail_url: string;
  triggers: Trigger[] | [];
  twitter_handle: string;
  website_url: string;
  settings: ProjectSettings;
  contract_address: string;
  api_keys: ApiKey[] | [];
  team_members: ProjectTeamMember[] | [];
};
