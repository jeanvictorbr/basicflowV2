// Substitua em: schema.js
const schema = {
    guild_settings: {
        guild_id: { type: 'VARCHAR(255)', primaryKey: true },
        premium_status: { type: 'BOOLEAN', default: false },
        premium_expires_at: { type: 'TIMESTAMPTZ' },
        ausencias_canal_aprovacoes: { type: 'VARCHAR(255)' },
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
        guardian_ai_enabled: { type: 'BOOLEAN', default: false },
        guardian_ai_alert_channel: { type: 'VARCHAR(255)' },
        guardian_ai_log_channel: { type: 'VARCHAR(255)' },
        guardian_ai_alert_enabled: { type: 'BOOLEAN', default: false },
        guardian_ai_alert_cooldown_minutes: { type: 'INTEGER', default: 5 },
        guardian_ai_alert_toxicity_threshold: { type: 'INTEGER', default: 75 },
        guardian_ai_alert_sarcasm_threshold: { type: 'INTEGER', default: 80 },
        guardian_ai_alert_attack_threshold: { type: 'INTEGER', default: 80 },
        

        // --- NOVAS CONFIGURAÇÕES DE MODERAÇÃO ---
        mod_log_channel: { type: 'VARCHAR(255)' },
        mod_roles: { type: 'TEXT' }, // IDs dos cargos, separados por vírgula
        mod_temp_ban_enabled: { type: 'BOOLEAN', default: false },
        mod_monitor_enabled: { type: 'BOOLEAN', default: false },
        mod_monitor_channel: { type: 'VARCHAR(255)' },
                // --- NOVA CONFIGURAÇÃO DE INTEGRAÇÃO ---
        guardian_use_mod_punishments: { type: 'BOOLEAN', default: false }
    },
    activation_keys: {
        key: { type: 'VARCHAR(255)', primaryKey: true },
        duration_days: { type: 'INTEGER', notNull: true },
        uses_left: { type: 'INTEGER', default: 1 },
        comment: { type: 'TEXT' }
    },
    pending_registrations: {
        message_id: { type: 'VARCHAR(255)', primaryKey: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        nome_rp: { type: 'VARCHAR(255)', notNull: true },
        id_rp: { type: 'VARCHAR(255)', notNull: true }
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
    uniforms: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        name: { type: 'VARCHAR(255)', notNull: true },
        description: { type: 'TEXT' },
        image_url: { type: 'VARCHAR(1024)' },
        preset_code: { type: 'TEXT', notNull: true }
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
    ponto_leaderboard: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        total_ms: { type: 'BIGINT', default: 0 },
        notes: { type: 'TEXT' },
        _unique: { type: 'UNIQUE', columns: ['guild_id', 'user_id'] }
    },
    pending_absences: {
        message_id: { type: 'VARCHAR(255)', primaryKey: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        start_date: { type: 'VARCHAR(100)' },
        end_date: { type: 'VARCHAR(100)' },
        reason: { type: 'TEXT' }
    },
    registrations_history: {
        id: { type: 'SERIAL', primaryKey: true },
        guild_id: { type: 'VARCHAR(255)', notNull: true },
        user_id: { type: 'VARCHAR(255)', notNull: true },
        moderator_id: { type: 'VARCHAR(255)', notNull: true },
        status: { type: 'VARCHAR(20)', notNull: true },
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
        duration: { type: 'VARCHAR(50)' }
    }
};

module.exports = schema;