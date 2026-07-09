export interface N8nWorkflow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  webhook_url: string | null;
  workflow_json: Record<string, unknown> | null;
  category: string;
  tags: string[];
  is_favorite: boolean;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateN8nWorkflowDTO {
  title: string;
  description?: string;
  webhook_url?: string;
  workflow_json?: Record<string, unknown> | null;
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface UpdateN8nWorkflowDTO extends Partial<CreateN8nWorkflowDTO> {
  last_run_at?: string;
}
