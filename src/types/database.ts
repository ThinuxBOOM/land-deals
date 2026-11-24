export type PropertyType = "land" | "apartment" | "house";
export type PropertyStatus = "available" | "sold";

export type Property = {
  id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  price: number;
  location: string;
  features: string[];
  status: PropertyStatus;
  views_count: number;
  created_at: string;
};

export type PropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  whatsapp_number: string;
  broker_name: string;
  display_email: string;
  instagram_url: string;
  facebook_url: string;
};

export type PropertyWithImages = Property & {
  property_images: Pick<PropertyImage, "id" | "image_url">[];
};

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "views_count" | "created_at" | "features"> & {
          id?: string;
          views_count?: number;
          created_at?: string;
          features?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
        Relationships: [];
      };
      property_images: {
        Row: PropertyImage;
        Insert: Omit<PropertyImage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_images"]["Insert"]>;
        Relationships: [{
          foreignKeyName: "property_images_property_id_fkey";
          columns: ["property_id"];
          isOneToOne: false;
          referencedRelation: "properties";
          referencedColumns: ["id"];
        }];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: SiteSettings;
        Update: Partial<SiteSettings>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_property_views: {
        Args: { property_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
