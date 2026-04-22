export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_slots: {
        Row: {
          codigo_html_ou_imagem: string | null
          created_at: string | null
          dimensoes: string | null
          id: string
          nome_slot: string | null
          posicao_html: string | null
          status_ativo: boolean | null
        }
        Insert: {
          codigo_html_ou_imagem?: string | null
          created_at?: string | null
          dimensoes?: string | null
          id?: string
          nome_slot?: string | null
          posicao_html?: string | null
          status_ativo?: boolean | null
        }
        Update: {
          codigo_html_ou_imagem?: string | null
          created_at?: string | null
          dimensoes?: string | null
          id?: string
          nome_slot?: string | null
          posicao_html?: string | null
          status_ativo?: boolean | null
        }
        Relationships: []
      }
      biblioteca_lives: {
        Row: {
          created_at: string | null
          data_live: string | null
          end_time_sec: number | null
          id: string
          is_hidden: boolean | null
          is_pinned: boolean | null
          start_time_sec: number | null
          tema: string | null
          thumbnail: string | null
          titulo: string
          url_video: string
        }
        Insert: {
          created_at?: string | null
          data_live?: string | null
          end_time_sec?: number | null
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          start_time_sec?: number | null
          tema?: string | null
          thumbnail?: string | null
          titulo: string
          url_video: string
        }
        Update: {
          created_at?: string | null
          data_live?: string | null
          end_time_sec?: number | null
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          start_time_sec?: number | null
          tema?: string | null
          thumbnail?: string | null
          titulo?: string
          url_video?: string
        }
        Relationships: []
      }
      biblioteca_webtv: {
        Row: {
          capa_video: string | null
          categoria: string
          created_at: string
          descricao: string | null
          end_time_sec: number | null
          id: string
          is_hidden: boolean | null
          is_pinned: boolean | null
          start_time_sec: number | null
          titulo: string
          url_video: string
        }
        Insert: {
          capa_video?: string | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          end_time_sec?: number | null
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          start_time_sec?: number | null
          titulo: string
          url_video: string
        }
        Update: {
          capa_video?: string | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          end_time_sec?: number | null
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          start_time_sec?: number | null
          titulo?: string
          url_video?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          cor: string | null
          created_at: string
          id: string
          nome: string
          slug: string | null
        }
        Insert: {
          cor?: string | null
          created_at?: string
          id?: string
          nome: string
          slug?: string | null
        }
        Update: {
          cor?: string | null
          created_at?: string
          id?: string
          nome?: string
          slug?: string | null
        }
        Relationships: []
      }
      comentarios: {
        Row: {
          comentario: string
          criado_em: string | null
          id: string
          noticia_id: string | null
          usuario_nome: string
        }
        Insert: {
          comentario: string
          criado_em?: string | null
          id?: string
          noticia_id?: string | null
          usuario_nome: string
        }
        Update: {
          comentario?: string
          criado_em?: string | null
          id?: string
          noticia_id?: string | null
          usuario_nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_noticias: {
        Row: {
          aprovado: boolean | null
          conteudo: string
          created_at: string
          id: string
          noticia_id: string | null
          usuario_id: string | null
        }
        Insert: {
          aprovado?: boolean | null
          conteudo: string
          created_at?: string
          id?: string
          noticia_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          aprovado?: boolean | null
          conteudo?: string
          created_at?: string
          id?: string
          noticia_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_noticias_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_podcast: {
        Row: {
          created_at: string | null
          episodio_id: string | null
          id: string
          mensagem: string
        }
        Insert: {
          created_at?: string | null
          episodio_id?: string | null
          id?: string
          mensagem: string
        }
        Update: {
          created_at?: string | null
          episodio_id?: string | null
          id?: string
          mensagem?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_podcast_episodio_id_fkey"
            columns: ["episodio_id"]
            isOneToOne: false
            referencedRelation: "episodios"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracao_portal: {
        Row: {
          ad_slot_1: Json | null
          ad_slot_2: Json | null
          alerta_urgente_ativo: boolean | null
          alerta_urgente_texto: string | null
          banner_anuncio_home: string | null
          banner_vertical_noticia: string | null
          descricao_live: string | null
          facebook_page_url: string | null
          fake_viewers_boost: number | null
          hero_banner_items: Json | null
          id: number
          is_live: boolean | null
          last_live_end: string | null
          link_anuncio_home: string | null
          link_vertical_noticia: string | null
          live_last_ended_at: string | null
          logo_url: string | null
          modo_manutencao: boolean | null
          mostrar_live_facebook: boolean | null
          nome_plataforma: string | null
          openrouter_api_key: string | null
          organic_views_enabled: boolean | null
          tema_live: string | null
          thumbnail_live: string | null
          titulo_live: string | null
          ui_settings: Json | null
          updated_at: string | null
          url_live: string | null
          url_live_facebook: string | null
          url_live_youtube: string | null
          youtube_channel_url: string | null
        }
        Insert: {
          ad_slot_1?: Json | null
          ad_slot_2?: Json | null
          alerta_urgente_ativo?: boolean | null
          alerta_urgente_texto?: string | null
          banner_anuncio_home?: string | null
          banner_vertical_noticia?: string | null
          descricao_live?: string | null
          facebook_page_url?: string | null
          fake_viewers_boost?: number | null
          hero_banner_items?: Json | null
          id?: number
          is_live?: boolean | null
          last_live_end?: string | null
          link_anuncio_home?: string | null
          link_vertical_noticia?: string | null
          live_last_ended_at?: string | null
          logo_url?: string | null
          modo_manutencao?: boolean | null
          mostrar_live_facebook?: boolean | null
          nome_plataforma?: string | null
          openrouter_api_key?: string | null
          organic_views_enabled?: boolean | null
          tema_live?: string | null
          thumbnail_live?: string | null
          titulo_live?: string | null
          ui_settings?: Json | null
          updated_at?: string | null
          url_live?: string | null
          url_live_facebook?: string | null
          url_live_youtube?: string | null
          youtube_channel_url?: string | null
        }
        Update: {
          ad_slot_1?: Json | null
          ad_slot_2?: Json | null
          alerta_urgente_ativo?: boolean | null
          alerta_urgente_texto?: string | null
          banner_anuncio_home?: string | null
          banner_vertical_noticia?: string | null
          descricao_live?: string | null
          facebook_page_url?: string | null
          fake_viewers_boost?: number | null
          hero_banner_items?: Json | null
          id?: number
          is_live?: boolean | null
          last_live_end?: string | null
          link_anuncio_home?: string | null
          link_vertical_noticia?: string | null
          live_last_ended_at?: string | null
          logo_url?: string | null
          modo_manutencao?: boolean | null
          mostrar_live_facebook?: boolean | null
          nome_plataforma?: string | null
          openrouter_api_key?: string | null
          organic_views_enabled?: boolean | null
          tema_live?: string | null
          thumbnail_live?: string | null
          titulo_live?: string | null
          ui_settings?: Json | null
          updated_at?: string | null
          url_live?: string | null
          url_live_facebook?: string | null
          url_live_youtube?: string | null
          youtube_channel_url?: string | null
        }
        Relationships: []
      }
      episodio_reacoes: {
        Row: {
          count: number | null
          emoji: string
          episodio_id: string
        }
        Insert: {
          count?: number | null
          emoji: string
          episodio_id: string
        }
        Update: {
          count?: number | null
          emoji?: string
          episodio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodio_reacoes_episodio_id_fkey"
            columns: ["episodio_id"]
            isOneToOne: false
            referencedRelation: "episodios"
            referencedColumns: ["id"]
          },
        ]
      }
      episodios: {
        Row: {
          convidados: string | null
          created_at: string
          data_publicacao: string
          end_time: number | null
          id: string
          podcast_id: string
          start_time: number | null
          thumbnail_url: string | null
          titulo: string
          video_url: string
          view_count: number | null
        }
        Insert: {
          convidados?: string | null
          created_at?: string
          data_publicacao?: string
          end_time?: number | null
          id?: string
          podcast_id: string
          start_time?: number | null
          thumbnail_url?: string | null
          titulo: string
          video_url: string
          view_count?: number | null
        }
        Update: {
          convidados?: string | null
          created_at?: string
          data_publicacao?: string
          end_time?: number | null
          id?: string
          podcast_id?: string
          start_time?: number | null
          thumbnail_url?: string | null
          titulo?: string
          video_url?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "episodios_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      live_mensagens: {
        Row: {
          cor_nome: string | null
          created_at: string | null
          id: string
          mensagem: string
          nome_usuario: string
        }
        Insert: {
          cor_nome?: string | null
          created_at?: string | null
          id?: string
          mensagem: string
          nome_usuario: string
        }
        Update: {
          cor_nome?: string | null
          created_at?: string | null
          id?: string
          mensagem?: string
          nome_usuario?: string
        }
        Relationships: []
      }
      live_messages: {
        Row: {
          conteudo: string
          created_at: string | null
          id: string
          is_admin_msg: boolean | null
          profile_id: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          id?: string
          is_admin_msg?: boolean | null
          profile_id?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          id?: string
          is_admin_msg?: boolean | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_reacoes: {
        Row: {
          created_at: string | null
          id: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tipo?: string
        }
        Relationships: []
      }
      mensagens_chat: {
        Row: {
          canal: string | null
          created_at: string | null
          id: string
          mensagem: string
          nome: string
        }
        Insert: {
          canal?: string | null
          created_at?: string | null
          id?: string
          mensagem: string
          nome: string
        }
        Update: {
          canal?: string | null
          created_at?: string | null
          id?: string
          mensagem?: string
          nome?: string
        }
        Relationships: []
      }
      noticias: {
        Row: {
          ad_id: string | null
          audio_content_hash: string | null
          audio_url: string | null
          categoria: string | null
          conteudo: string | null
          created_at: string | null
          galeria_urls: string[] | null
          id: string
          imagem_capa: string | null
          imagem_capa_url: string | null
          is_sponsored: boolean | null
          mostrar_em_recentes: boolean | null
          mostrar_na_home_recentes: boolean | null
          mostrar_no_player: boolean | null
          ordem_prioridade: number | null
          real_views: number | null
          seo_tags: string | null
          slug: string | null
          sponsor_id: string | null
          subtitulo: string | null
          subtitulo_config: Json | null
          tipo_midia: string | null
          titulo: string
          titulo_config: Json | null
          video_url: string | null
        }
        Insert: {
          ad_id?: string | null
          audio_content_hash?: string | null
          audio_url?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string | null
          galeria_urls?: string[] | null
          id?: string
          imagem_capa?: string | null
          imagem_capa_url?: string | null
          is_sponsored?: boolean | null
          mostrar_em_recentes?: boolean | null
          mostrar_na_home_recentes?: boolean | null
          mostrar_no_player?: boolean | null
          ordem_prioridade?: number | null
          real_views?: number | null
          seo_tags?: string | null
          slug?: string | null
          sponsor_id?: string | null
          subtitulo?: string | null
          subtitulo_config?: Json | null
          tipo_midia?: string | null
          titulo: string
          titulo_config?: Json | null
          video_url?: string | null
        }
        Update: {
          ad_id?: string | null
          audio_content_hash?: string | null
          audio_url?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string | null
          galeria_urls?: string[] | null
          id?: string
          imagem_capa?: string | null
          imagem_capa_url?: string | null
          is_sponsored?: boolean | null
          mostrar_em_recentes?: boolean | null
          mostrar_na_home_recentes?: boolean | null
          mostrar_no_player?: boolean | null
          ordem_prioridade?: number | null
          real_views?: number | null
          seo_tags?: string | null
          slug?: string | null
          sponsor_id?: string | null
          subtitulo?: string | null
          subtitulo_config?: Json | null
          tipo_midia?: string | null
          titulo?: string
          titulo_config?: Json | null
          video_url?: string | null
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          lido_por: string[] | null
          noticia_id: string | null
          titulo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lido_por?: string[] | null
          noticia_id?: string | null
          titulo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lido_por?: string[] | null
          noticia_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
        ]
      }
      plantao_policial: {
        Row: {
          ativo: boolean | null
          conteudo: string
          created_at: string | null
          id: string
          urgencia: string | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo: string
          created_at?: string | null
          id?: string
          urgencia?: string | null
        }
        Update: {
          ativo?: boolean | null
          conteudo?: string
          created_at?: string | null
          id?: string
          urgencia?: string | null
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          apresentador_foto_url: string | null
          apresentador_nome: string | null
          created_at: string
          descricao: string | null
          horario_exibicao: string | null
          id: string
          nome: string
        }
        Insert: {
          apresentador_foto_url?: string | null
          apresentador_nome?: string | null
          created_at?: string
          descricao?: string | null
          horario_exibicao?: string | null
          id?: string
          nome: string
        }
        Update: {
          apresentador_foto_url?: string | null
          apresentador_nome?: string | null
          created_at?: string
          descricao?: string | null
          horario_exibicao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          nome_completo: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome_completo?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome_completo?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_reaction_count: {
        Args: { emoji_val: string; target_id: string }
        Returns: undefined
      }
      increment_view_count: { Args: { target_id: string }; Returns: undefined }
      incrementar_views: { Args: { p_noticia_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
