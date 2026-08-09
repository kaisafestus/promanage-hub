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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          file_type: string
          id: string
          name: string
          org_id: string
          size: number
          updated_at: string
          uploaded_by_id: string | null
          url: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_type?: string
          id?: string
          name: string
          org_id: string
          size?: number
          updated_at?: string
          uploaded_by_id?: string | null
          url: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_type?: string
          id?: string
          name?: string
          org_id?: string
          size?: number
          updated_at?: string
          uploaded_by_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          org_id: string
          property_id: string | null
          receipt: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          org_id: string
          property_id?: string | null
          receipt?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          org_id?: string
          property_id?: string | null
          receipt?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          first_name: string | null
          id: string
          invited_by_id: string | null
          last_name: string | null
          org_id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          first_name?: string | null
          id?: string
          invited_by_id?: string | null
          last_name?: string | null
          org_id: string
          phone?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          first_name?: string | null
          id?: string
          invited_by_id?: string | null
          last_name?: string | null
          org_id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          org_id: string
          property_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          tenant_id: string | null
          total_amount: number
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          invoice_number: string
          issue_date?: string
          org_id: string
          property_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tenant_id?: string | null
          total_amount?: number
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          org_id?: string
          property_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tenant_id?: string | null
          total_amount?: number
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string
          end_date: string
          id: string
          monthly_rent: number
          org_id: string
          property_id: string
          rent_due_day: number
          security_deposit: number
          start_date: string
          status: Database["public"]["Enums"]["lease_status"]
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          monthly_rent?: number
          org_id: string
          property_id: string
          rent_due_day?: number
          security_deposit?: number
          start_date: string
          status?: Database["public"]["Enums"]["lease_status"]
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          monthly_rent?: number
          org_id?: string
          property_id?: string
          rent_due_day?: number
          security_deposit?: number
          start_date?: string
          status?: Database["public"]["Enums"]["lease_status"]
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          category: string | null
          completed_date: string | null
          cost: number | null
          created_at: string
          description: string
          id: string
          notes: string | null
          org_id: string
          priority: Database["public"]["Enums"]["maintenance_priority"]
          property_id: string
          scheduled_date: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          tenant_id: string | null
          title: string
          unit_id: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          category?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          org_id: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          property_id: string
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          tenant_id?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          category?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          org_id?: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          property_id?: string
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          tenant_id?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          org_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          org_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          org_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          automatic_publishing: boolean
          created_at: string
          email: string | null
          id: string
          logo: string | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["org_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          automatic_publishing?: boolean
          created_at?: string
          email?: string | null
          id?: string
          logo?: string | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          automatic_publishing?: boolean
          created_at?: string
          email?: string | null
          id?: string
          logo?: string | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["org_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          org_id: string
          paid_at: string
          property_id: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tenant_id: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          org_id: string
          paid_at?: string
          property_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          org_id?: string
          paid_at?: string
          property_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_login: string | null
          last_name: string
          org_id: string | null
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string
          id: string
          last_login?: string | null
          last_name?: string
          org_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_login?: string | null
          last_name?: string
          org_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          active: boolean
          address_line1: string
          address_line2: string | null
          city: string
          code: string
          county: string
          created_at: string
          description: string | null
          id: string
          mpesa_paybill: string | null
          name: string
          org_id: string
          postal_code: string | null
          property_type: string | null
          updated_at: string
          water_rate: number | null
        }
        Insert: {
          active?: boolean
          address_line1?: string
          address_line2?: string | null
          city?: string
          code: string
          county?: string
          created_at?: string
          description?: string | null
          id?: string
          mpesa_paybill?: string | null
          name: string
          org_id: string
          postal_code?: string | null
          property_type?: string | null
          updated_at?: string
          water_rate?: number | null
        }
        Update: {
          active?: boolean
          address_line1?: string
          address_line2?: string | null
          city?: string
          code?: string
          county?: string
          created_at?: string
          description?: string | null
          id?: string
          mpesa_paybill?: string | null
          name?: string
          org_id?: string
          postal_code?: string | null
          property_type?: string | null
          updated_at?: string
          water_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          lease_end_date: string | null
          lease_start_date: string | null
          monthly_rent: number
          org_id: string
          phone: string | null
          property_id: string | null
          security_deposit: number
          unit_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number
          org_id: string
          phone?: string | null
          property_id?: string | null
          security_deposit?: number
          unit_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number
          org_id?: string
          phone?: string | null
          property_id?: string | null
          security_deposit?: number
          unit_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          bathrooms: number
          bedrooms: number
          created_at: string
          floor: string | null
          id: string
          monthly_rent: number
          org_id: string
          property_id: string
          security_deposit: number
          size_sq_ft: number | null
          status: Database["public"]["Enums"]["unit_status"]
          unit_number: string
          updated_at: string
          vacant: boolean
        }
        Insert: {
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          floor?: string | null
          id?: string
          monthly_rent?: number
          org_id: string
          property_id: string
          security_deposit?: number
          size_sq_ft?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number: string
          updated_at?: string
          vacant?: boolean
        }
        Update: {
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          floor?: string | null
          id?: string
          monthly_rent?: number
          org_id?: string
          property_id?: string
          security_deposit?: number
          size_sq_ft?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number?: string
          updated_at?: string
          vacant?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "units_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          company_name: string
          created_at: string
          email: string | null
          id: string
          org_id: string
          phone: string | null
          specialization: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          email?: string | null
          id?: string
          org_id: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          org_id?: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_org_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager: { Args: never; Returns: boolean }
      my_property_ids: { Args: never; Returns: string[] }
      my_tenant_ids: { Args: never; Returns: string[] }
      my_unit_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      app_role: "ADMIN" | "LANDLORD" | "TENANT" | "VENDOR" | "APPLICANT"
      document_category:
        | "LEASE_AGREEMENT"
        | "RECEIPT"
        | "INVOICE"
        | "CONTRACT"
        | "MAINTENANCE_RECORD"
        | "PHOTO"
        | "OTHER"
      invitation_status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
      invoice_status:
        | "DRAFT"
        | "SENT"
        | "PAID"
        | "PARTIAL"
        | "OVERDUE"
        | "CANCELLED"
        | "UNCOLLECTIBLE"
      lease_status: "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED"
      maintenance_priority: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY"
      maintenance_status:
        | "OPEN"
        | "ASSIGNED"
        | "IN_PROGRESS"
        | "WAITING_PARTS"
        | "COMPLETED"
        | "CANCELLED"
      notification_type:
        | "SYSTEM"
        | "MESSAGE"
        | "PAYMENT"
        | "MAINTENANCE"
        | "REMINDER"
      org_status: "ACTIVE" | "SUSPENDED"
      payment_method:
        | "BANK_TRANSFER"
        | "CREDIT_CARD"
        | "DEBIT_CARD"
        | "M_PESA"
        | "ACH"
        | "CASH"
        | "OTHER"
      payment_status:
        | "PENDING"
        | "CONFIRMED"
        | "PAID"
        | "PARTIAL"
        | "FAILED"
        | "REFUNDED"
        | "OVERDUE"
      unit_status:
        | "AVAILABLE"
        | "UNDER_APPLICATION"
        | "RESERVED"
        | "OCCUPIED"
        | "NOTICE"
        | "MAINTENANCE"
      user_status: "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED"
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
    Enums: {
      app_role: ["ADMIN", "LANDLORD", "TENANT", "VENDOR", "APPLICANT"],
      document_category: [
        "LEASE_AGREEMENT",
        "RECEIPT",
        "INVOICE",
        "CONTRACT",
        "MAINTENANCE_RECORD",
        "PHOTO",
        "OTHER",
      ],
      invitation_status: ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"],
      invoice_status: [
        "DRAFT",
        "SENT",
        "PAID",
        "PARTIAL",
        "OVERDUE",
        "CANCELLED",
        "UNCOLLECTIBLE",
      ],
      lease_status: ["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"],
      maintenance_priority: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"],
      maintenance_status: [
        "OPEN",
        "ASSIGNED",
        "IN_PROGRESS",
        "WAITING_PARTS",
        "COMPLETED",
        "CANCELLED",
      ],
      notification_type: [
        "SYSTEM",
        "MESSAGE",
        "PAYMENT",
        "MAINTENANCE",
        "REMINDER",
      ],
      org_status: ["ACTIVE", "SUSPENDED"],
      payment_method: [
        "BANK_TRANSFER",
        "CREDIT_CARD",
        "DEBIT_CARD",
        "M_PESA",
        "ACH",
        "CASH",
        "OTHER",
      ],
      payment_status: [
        "PENDING",
        "CONFIRMED",
        "PAID",
        "PARTIAL",
        "FAILED",
        "REFUNDED",
        "OVERDUE",
      ],
      unit_status: [
        "AVAILABLE",
        "UNDER_APPLICATION",
        "RESERVED",
        "OCCUPIED",
        "NOTICE",
        "MAINTENANCE",
      ],
      user_status: ["PENDING", "ACTIVE", "SUSPENDED", "ARCHIVED"],
    },
  },
} as const
