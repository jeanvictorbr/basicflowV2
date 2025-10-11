// Substitua completamente o conteúdo do seu arquivo: schema.js
const schema = {
    // Tabela para configurações globais do bot (ex: status de manutenção)
    bot_status: {
        status_key: { type: 'VARCHAR(255)', primaryKey: true, default: 'main' },
        ai_services_enabled: { type: 'BOOLEAN', default: true },
        maintenance_message: { type: 'TEXT' },
        bot_enabled: { type: 'BOOLEAN', default: true }, // <-- NOVA COLUNA
        maintenance_message_global: { type: 'TEXT' }    // <-- NOVA COLUNA
    },

    // Tabela principal de configurações por servidor (guild)
    guild_settings: {
        guild_id: { type: 'VARCHAR(255)', primaryKey: true },
        ai_services_disabled_by_dev: { type: 'BOOLEAN', default: false },
        ausencias_canal_aprovacoes: { type: 'VARCHAR(255)' },
        store_mp_token: { type: 'TEXT' }, 
        ausencias_cargo_ausente: { type: 'VARCHAR(255)' },
        ausencias_canal_logs: { type: 'VARCHAR(255)' },
        ausencias_imagem_vitrine: { type: 'VARCHAR(1024)' },
        ausencias_canal_vitrine: { type: 'VARCHAR(255)' },
        registros_canal_aprovacoes: { type: 'VARCHAR(255)' },
        registros_cargo_aprovado: { type: 'VARCHAR(255)' },
        registros_canal_logs: { type: 'VARCHAR(255)' },
        registros_tag_aprovado: { type: 'VARCHAR(255)' },
        registros_status: { type: 'BOOLEAN', default: true },
        registros_canal_vitrine: { type: 'VARCHAR(255)' },
        registros_imagem_vitrine: { type: 'VARCHAR(1024)' },
        tickets_painel_channel: { type: 'VARCHAR(255)' },
        tickets_cargo_suporte: { type: 'VARCHAR(255)' },
        tickets_canal_logs: { type: 'VARCHAR(255)' },
        tickets_category: { type: 'VARCHAR(255)' },
        tickets_thumbnail_url: { type: 'VARCHAR(1024)' },
        tickets_feedback_enabled: { type: 'BOOLEAN', default: false },
        tickets_autoclose_enabled: { type: 'BOOLEAN', default: false },
        tickets_autoclose_hours: { type: 'INTEGER', default: 48 },
        tickets_autoclose_dm_user: { type: 'BOOLEAN', default: true },
        tickets_autoclose_warn_user: { type: 'BOOLEAN', default: true },
        tickets_greeting_enabled: { type: 'BOOLEAN', default: false },
        tickets_use_departments: { type: 'BOOLEAN', default: false },
        tickets_ai_assistant_enabled: { type: 'BOOLEAN', default: false },
        tickets_ai_assistant_prompt: { type: 'TEXT' },
        tickets_ai_use_base_knowledge: { type: 'BOOLEAN', default: true },
        uniformes_thumbnail_url: { type: 'VARCHAR(1024)' },
        uniformes_color: { type: 'VARCHAR(7)', default: '#FFFFFF' },
        uniformes_vitrine_channel_id: { type: 'VARCHAR(255)' },
        uniformes_vitrine_message_id: { type: 'VARCHAR(255)' },
        ponto_canal_registros: { type: 'VARCHAR(255)' },
        ponto_cargo_em_servico: { type: 'VARCHAR(255)' },
        ponto_imagem_vitrine: { type: 'VARCHAR(1024)' },
        ponto_status: { type: 'BOOLEAN', default: false },
        ponto_afk_check_enabled: { type: 'BOOLEAN', default: false },
        ponto_afk_check_interval_minutes: { type: 'INTEGER', default: 60 },
        ponto_vitrine_footer: { type: 'TEXT' },
        ponto_vitrine_color: { type: 'VARCHAR(7)' },
        ponto_dashboard_v2_enabled: { type: 'BOOLEAN', default: false },
        suggestions_enabled: { type: 'BOOLEAN', default: false },
        suggestions_channel: { type: 'VARCHAR(255)' },
        suggestions_log_channel: { type: 'VARCHAR(255)' },
        suggestions_staff_role: { type: 'VARCHAR(255)' },
        suggestions_vitrine_image: { type: 'VARCHAR(1024)' },
        suggestions_cooldown_minutes: { type: 'INTEGER', default: 2 },
        suggestions_mention_everyone: { type: 'BOOLEAN', default: false },
        mod_log_channel: { type: 'VARCHAR(255)' },
        mod_roles: { type: 'TEXT' },
        mod_temp_ban_enabled: { type: 'BOOLEAN', default: false },
        mod_monitor_enabled: { type: 'BOOLEAN', default: false },
        mod_monitor_channel: { type: 'VARCHAR(255)' },
        guardian_ai_enabled: { type: 'BOOLEAN', default: false },
        guardian_ai_mention_chat_enabled: { type: 'BOOLEAN', default: false },
        guardian_ai_alert_channel: { type: 'VARCHAR(255)' },
        guardian_ai_log_channel: { type: 'VARCHAR(255)' },
        guardian_ai_alert_enabled: { type: 'BOOLEAN', default: false },
        guardian_ai_alert_cooldown_minutes: { type: 'INTEGER', default: 5 },
        guardian_ai_alert_toxicity_threshold: { type: 'INTEGER', default: 75 },
        guardian_ai_alert_sarcasm_threshold: { type: 'INTEGER', default: 80 },
        guardian_ai_alert_attack_threshold: { type: 'INTEGER', default: 80 },
        guardian_use_mod_punishments: { type: 'BOOLEAN', default: false },
        roletags_enabled: { type: 'BOOLEAN', default: false },
        store_enabled: { type: 'BOOLEAN', default: false },
        store_category_id: { type: 'VARCHAR(255)' },
        store_vitrine_channel_id: { type: 'VARCHAR(255)' },
        store_log_channel_id: { type: 'VARCHAR(255)' },
        store_vitrine_message_id: { type: 'VARCHAR(255)' },
        store_staff_role_id: { type: 'VARCHAR(255)' },
        store_pix_key: { type: 'TEXT' },
        store_client_role_id: { type: 'VARCHAR(255)' },
        store_client_role_duration_days: { type: 'INTEGER' },
        store_vitrine_config: { type: 'JSONB' },
        store_mp_token: { type: 'TEXT' },
        store_inactivity_monitor_enabled: { type: 'BOOLEAN', default: false },
        store_auto_close_hours: { type: 'INTEGER', default: 24 },
        store_premium_dm_flow_enabled: { type: 'BOOLEAN', default: false }
    },

    // --- Módulo StoreFlow V3 ---
    store_products: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        name: { type: 'VARCHAR(255)', notNull: true },
        description: { type: 'TEXT' },
        price: { type: 'NUMERIC(10, 2)', notNull: true },
        stock: { type: 'INTEGER', default: -1 },
        stock_type: { type: 'VARCHAR(10)', default: 'GHOST' },
        role_id_to_grant: { type: 'VARCHAR(255)' },
        role_duration_days: { type: 'INTEGER' },
        is_enabled: { type: 'BOOLEAN', default: true },
        image_url: { type: 'VARCHAR(1024)' }
    },
    store_carts: {
        channel_id: { type: 'VARCHAR(255)', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        products_json: { type: 'JSONB' },
        status: { type: 'VARCHAR(20)', default: 'open' },
        coupon_id: { type: 'INTEGER' },
        total_price: { type: 'NUMERIC(10, 2)' },
        payment_id: { type: 'VARCHAR(255)' }, // NOVA COLUNA
        claimed_by_staff_id: { type: 'VARCHAR(255)' },
        last_activity_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
        thread_id: { type: 'VARCHAR(255)' } // <-- NOVA COLUNA
    },
    store_coupons: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        code: { type: 'VARCHAR(100)', notNull: true },
        discount_percent: { type: 'INTEGER', notNull: true },
        uses_left: { type: 'INTEGER', notNull: true, default: 1 },
        is_active: { type: 'BOOLEAN', default: true },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'code'] }
    },
    store_stock: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        product_id: { type: 'INTEGER', notNull: true },
        content: { type: 'TEXT', notNull: true },
        is_claimed: { type: 'BOOLEAN', default: false },
        claimed_by_user_id: { type: 'VARCHAR(255)' },
        claimed_at: { type: 'TIMESTAMPTZ' }
    },
    store_user_roles_expiration: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        role_id: { type: 'VARCHAR(255)', notNull: true },
        expires_at: { type: 'TIMESTAMPTZ', notNull: true },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'user_id', 'role_id'] }
    },
    store_sales_log: {
        sale_id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        total_amount: { type: 'NUMERIC(10, 2)', notNull: true },
        product_details: { type: 'JSONB', notNull: true },
        status: { type: 'VARCHAR(50)', notNull: true }, // completed, cancelled
        created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },

    // --- Features e Licenciamento ---
    guild_features: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        feature_key: { type: 'VARCHAR(100)', notNull: true },
        expires_at: { type: 'TIMESTAMPTZ', notNull: true },
        activated_by_key: { type: 'VARCHAR(255)' },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'feature_key'] }
    },
    activation_keys: {
        key: { type: 'VARCHAR(255)', primaryKey: true },
        duration_days: { type: 'INTEGER', notNull: true },
        uses_left: { type: 'INTEGER', default: 1 },
        grants_features: { type: 'TEXT' },
        comment: { type: 'TEXT' }
    },
    key_activation_history: {
        id: { type: 'SERIAL', primaryKey: true },
        key: { type: 'VARCHAR(255)', notNull: true },
        grants_features: { type: 'TEXT' },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        guild_name: { type: 'VARCHAR(255)' },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        user_tag: { type: 'VARCHAR(255)' },
        activated_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },

    // --- Logs e Históricos ---
    ai_usage_logs: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        feature_name: { type: 'VARCHAR(255)', notNull: true },
        prompt_tokens: { type: 'INTEGER', default: 0 },
        completion_tokens: { type: 'INTEGER', default: 0 },
        total_tokens: { type: 'INTEGER', default: 0 },
        cost: { type: 'NUMERIC(10, 8)', default: 0 },
        created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },
    ponto_history: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        start_time: { type: 'TIMESTAMPTZ', notNull: true },
        end_time: { type: 'TIMESTAMPTZ', notNull: true },
        duration_ms: { type: 'BIGINT', notNull: true }
    },
    registrations_history: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        moderator_id: { type: 'VARCHAR(255)', notNull: true },
        status: { type: 'VARCHAR(20)', notNull: true },
        created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },

    // --- Módulos Específicos ---
    pending_absences: {
        message_id: { type: 'VARCHAR(255)', primaryKey: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        start_date: { type: 'VARCHAR(100)' },
        end_date: { type: 'VARCHAR(100)' },
        reason: { type: 'TEXT' }
    },
    ponto_leaderboard: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        total_ms: { type: 'BIGINT', default: 0 },
        notes: { type: 'TEXT' },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'user_id'] }
    },
    ponto_sessions: {
        session_id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        start_time: { type: 'TIMESTAMPTZ', notNull: true },
        log_message_id: { type: 'VARCHAR(255)' },
        dashboard_message_id: { type: 'VARCHAR(255)' },
        is_paused: { type: 'BOOLEAN', default: false },
        last_pause_time: { type: 'TIMESTAMPTZ' },
        total_paused_ms: { type: 'BIGINT', default: 0 }
    },
    pending_registrations: {
        message_id: { type: 'VARCHAR(255)', primaryKey: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        nome_rp: { type: 'VARCHAR(255)', notNull: true },
        id_rp: { type: 'VARCHAR(255)', notNull: true }
    },
    role_tags: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        role_id: { type: 'VARCHAR(255)', notNull: true },
        tag: { type: 'VARCHAR(255)', notNull: true },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'role_id'] }
    },
    tickets: {
        channel_id: { type: 'VARCHAR(255)', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        ticket_number: { type: 'SERIAL' },
        claimed_by: { type: 'VARCHAR(255)' },
        status: { type: 'VARCHAR(20)', default: 'open' },
        action_log: { type: 'TEXT', default: '' },
        closed_at: { type: 'TIMESTAMPTZ' },
        last_message_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
        warning_sent_at: { type: 'TIMESTAMPTZ' }
    },
    ticket_departments: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        name: { type: 'VARCHAR(100)', notNull: true },
        description: { type: 'TEXT' },
        role_id: { type: 'VARCHAR(255)', notNull: true },
        emoji: { type: 'VARCHAR(100)' }
    },
    ticket_feedback: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        ticket_channel_id: { type: 'VARCHAR(255)', unique: true, notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        claimed_by: { type: 'VARCHAR(255)' },
        rating: { type: 'INTEGER' },
        comment: { type: 'TEXT' },
        created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },
    ticket_greeting_messages: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        message: { type: 'TEXT', notNull: true },
        is_active: { type: 'BOOLEAN', default: true }
    },
    ai_knowledge_base: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        topic: { type: 'VARCHAR(255)', notNull: true },
        keywords: { type: 'TEXT', notNull: true },
        content: { type: 'TEXT', notNull: true },
        created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },
    suggestions: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        message_id: { type: 'VARCHAR(255)', notNull: true, unique: true },
        thread_id: { type: 'VARCHAR(255)' },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        title: { type: 'TEXT', notNull: true },
        description: { type: 'TEXT', notNull: true },
        status: { type: 'VARCHAR(50)', default: 'pending' },
        upvotes: { type: 'INTEGER', default: 0 },
        downvotes: { type: 'INTEGER', default: 0 },
        created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },
    suggestion_votes: {
        id: { type: 'SERIAL', primaryKey: true },
        suggestion_id: { type: 'INTEGER', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        vote_type: { type: 'VARCHAR(10)', notNull: true },
        _unique: { type: 'UNIQUE', columns: ['suggestion_id', 'user_id'] }
    },
    suggestion_cooldowns: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        last_suggestion_at: { type: 'TIMESTAMPTZ', notNull: true, default: 'NOW()' },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'user_id'] }
    },
    uniforms: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        name: { type: 'VARCHAR(255)', notNull: true },
        description: { type: 'TEXT' },
        image_url: { type: 'VARCHAR(1024)' },
        preset_code: { type: 'TEXT', notNull: true }
    },
    
    // --- Moderação ---
    moderation_logs: {
        case_id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        moderator_id: { type: 'VARCHAR(255)', notNull: true },
        action: { type: 'VARCHAR(50)', notNull: true },
        reason: { type: 'TEXT', notNull: true },
        duration: { type: 'VARCHAR(50)' },
        created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },
    moderation_notes: {
        note_id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        moderator_id: { type: 'VARCHAR(255)', notNull: true },
        content: { type: 'TEXT', notNull: true },
        created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },
    moderation_punishments: {
        punishment_id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        name: { type: 'VARCHAR(100)', notNull: true },
        action: { type: 'VARCHAR(50)', notNull: true },
        role_id: { type: 'VARCHAR(255)' },
        duration: { type: 'VARCHAR(50)' },
        auto_create_role: { type: 'BOOLEAN', default: false },
    },
    
    // --- Guardian AI ---
    guardian_policies: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        name: { type: 'VARCHAR(100)', notNull: true },
        trigger_type: { type: 'VARCHAR(50)', notNull: true },
        is_enabled: { type: 'BOOLEAN', default: true },
        reset_interval_hours: { type: 'INTEGER', default: 24 }
    },
    guardian_policy_steps: {
        id: { type: 'SERIAL', primaryKey: true },
        policy_id: { type: 'INTEGER', notNull: true },
        step_level: { type: 'INTEGER', notNull: true },
        threshold: { type: 'INTEGER', notNull: true },
        action_delete_message: { type: 'BOOLEAN', default: false },
        action_warn_publicly: { type: 'BOOLEAN', default: false },
        action_punishment: { type: 'VARCHAR(50)', default: 'NONE' },
        action_punishment_duration_minutes: { type: 'INTEGER' }
    },
    guardian_infractions: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        policy_id: { type: 'INTEGER', notNull: true },
        infraction_count: { type: 'INTEGER', default: 0 },
        last_infraction_at: { type: 'TIMESTAMPTZ' },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'user_id', 'policy_id'] }
    },
    guardian_rules: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        name: { type: 'VARCHAR(100)', notNull: true },
        is_enabled: { type: 'BOOLEAN', default: true },
        trigger_type: { type: 'VARCHAR(50)', notNull: true },
        trigger_threshold: { type: 'INTEGER', notNull: true },
        action_delete_message: { type: 'BOOLEAN', default: false },
        action_warn_member_dm: { type: 'BOOLEAN', default: false },
        action_warn_publicly: { type: 'BOOLEAN', default: false },
        action_punishment: { type: 'VARCHAR(50)', default: 'NONE' },
        action_punishment_duration_minutes: { type: 'INTEGER' }
    },
    
    // --- Mini-Games ---
    hangman_games: {
        channel_id: { type: 'VARCHAR(255)', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        secret_word: { type: 'VARCHAR(100)', notNull: true },
        theme: { type: 'VARCHAR(100)' },
        guessed_letters: { type: 'TEXT', default: '' },
        lives: { type: 'INTEGER', default: 6 },
        status: { type: 'VARCHAR(20)', default: 'playing' },
        participants: { type: 'TEXT', default: '' },
        current_turn_user_id: { type: 'VARCHAR(255)' },
        turn_started_at: { type: 'TIMESTAMPTZ' },
        skipped_turn_user_id: { type: 'VARCHAR(255)' },
        message_id: { type: 'VARCHAR(255)' },
        action_log: { type: 'TEXT', default: '' },
        created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' }
    },
    hangman_ranking: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        points: { type: 'INTEGER', default: 0 },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'user_id'] }
    },
    stop_games: {
        message_id: { type: 'VARCHAR(255)', primaryKey: true },
        channel_id: { type: 'VARCHAR(255)', notNull: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        letter: { type: 'CHAR(1)', notNull: true },
        categories: { type: 'TEXT', notNull: true },
        status: { type: 'VARCHAR(20)', default: 'playing' },
        starter_id: { type: 'VARCHAR(255)', notNull: true },
        stopper_id: { type: 'VARCHAR(255)' }
    },
    stop_submissions: {
        id: { type: 'SERIAL', primaryKey: true },
        game_message_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        category: { type: 'VARCHAR(100)', notNull: true },
        word: { type: 'VARCHAR(255)', notNull: true },
        _unique: { type: 'UNIQUE', columns: ['game_message_id', 'user_id', 'category'] }
    },
    stop_votes: {
        id: { type: 'SERIAL', primaryKey: true },
        submission_id: { type: 'INTEGER', notNull: true },
        voter_id: { type: 'VARCHAR(255)', notNull: true },
        is_valid: { type: 'BOOLEAN', notNull: true },
        _unique: { type: 'UNIQUE', columns: ['submission_id', 'voter_id'] }
    },
    stop_ranking: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        points: { type: 'INTEGER', default: 0 },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'user_id'] }
    },
    stop_categories: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        name: { type: 'VARCHAR(100)', notNull: true },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'name'] }
    }
};

module.exports = schema;