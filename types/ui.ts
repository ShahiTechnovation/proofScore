/**
 * UI Component Type Definitions
 */

import { type ReactNode } from 'react';

// ============================================================================
// COMMON PROPS
// ============================================================================

export interface BaseComponentProps {
    className?: string;
    children?: ReactNode;
}

// ============================================================================
// MODAL PROPS
// ============================================================================

export interface ModalProps extends BaseComponentProps {
    open: boolean;
    onClose: () => void;
}

export interface ScoringModalProps extends ModalProps {
    onComplete: (assessment: import('./sdk').CreditAssessment) => void;
}

export interface SuccessModalProps extends ModalProps {
    score: number;
    riskLevel: import('./sdk').RiskLevel;
    transactionId: string;
}

// ============================================================================
// CARD PROPS
// ============================================================================

export interface MetricCardProps {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    change?: number;
    trend?: 'up' | 'down';
    loading?: boolean;
}

export interface ScoreRingProps {
    score: number;
    riskLevel: import('./sdk').RiskLevel;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
}

// ============================================================================
// BUTTON PROPS
// ============================================================================

export interface ActionButtonProps extends BaseComponentProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

export interface AnimationVariant {
    initial: Record<string, unknown>;
    animate: Record<string, unknown>;
    exit?: Record<string, unknown>;
    transition?: Record<string, unknown>;
}
