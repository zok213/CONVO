export interface AgoraTokenData {
  token: string;
  channel: string;
  uid: string;
}

export interface ClientStartRequest {
  channel: string;
  token: string;
  uid: string;
  requester_id?: string;
  channel_name?: string;
  domain?: 'maritime' | 'coaching';
  sourceLanguage?: string;
  targetLanguages?: string[];
}

export type AgentResponse = {
  agent_id: string;
  create_ts: number;
  state: string;
};

export type StopConversationRequest = {
  agent_id: string;
};
