export interface SocialAccount {
  id: string;
  name: string;
  provider: 'google_my_business' | 'facebook' | 'instagram' | 'linkedin'; // Example providers
}

export interface ResearchSnapshot {
  client: {
    name: string | null;
    homepage_url: string | null;
    gbp_hint: string | null;
    locationId: string | null;
    selectedGbpAccountId: string | null;
  };
  site_facts: {
    products_services: string[];
    service_areas: string[];
    usp: string[];
    brand_tone: string | null;
    keywords: string[];
  };
  gbp_facts: {
    categories: string[];
    attributes: string[];
    hours: string | null;
    phone: string | null;
    address: string | null;
    services: string[];
    existing_posts_summary: string[];
  };
  hero_images: {
    url: string | null;
    width: number | null;
    height: number | null;
    aspect_ratio: string | null;
  }[];
  generated_hero_image_prompt: string | null;
  post_pillars: {
    pillar: string | null;
    rationale: string | null;
  }[];
  avoid_list: string[];
  citations: {
    uri: string;
    title: string;
  }[];
}

export type PostType = "STANDARD" | "EVENT" | "OFFER";
export type CtaType = "learn_more" | "call" | "book" | "order" | "shop" | "sign_up" | "none";

export interface Post {
  type: PostType;
  title: string | null;
  body: string | null;
  cta_type: CtaType;
  cta_url: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  image: {
    source: "domain" | "generated";
    url: string | null;
    prompt: string | null;
  };
  schedule_at_iso: string | null;
  submissionStatus?: 'pending' | 'submitting' | 'success' | 'failed';
  submissionError?: string | null;
}

export interface PostPlan {
  posts: Post[];
  notes: {
    cadence: string;
    assumptions: string[];
  };
}

export enum Step {
  Researcher = 1,
  Planner = 2,
  Submission = 3,
}
