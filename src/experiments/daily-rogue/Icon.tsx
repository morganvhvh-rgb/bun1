import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ICON_MAP, type IconName } from './data';
import 'rpg-awesome/css/rpg-awesome.min.css';

export interface IconProps {
    name: IconName;
    className?: string;
    scale?: number;
    onClick?: () => void;
    tintColor?: string;
    gradient?: string[];
    animateGradient?: boolean;
    idleAnimation?: boolean | 'sway' | 'hover';
}

export function Icon({ name, className, scale = 4, onClick, tintColor, gradient, animateGradient, idleAnimation }: IconProps) {
    const iconClass = ICON_MAP[name];
    if (!iconClass) return null;

    const size = 16 * scale;

    const animationType = idleAnimation === true ? 'sway' : idleAnimation;
    const idleVariants = {
        sway: {
            rotate: [-5, 5, -5],
        },
        hover: {
            y: [0, -6, 0],
        }
    };

    return (
        <motion.div
            onClick={onClick}
            className={cn("inline-flex items-center justify-center relative select-none", onClick && "cursor-pointer active:scale-95 transition-transform", className)}
            style={{ width: size, height: size }}
            animate={animationType ? idleVariants[animationType] : undefined}
            transition={animationType ? {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            } : undefined}
        >
            <i
                className={cn(`ra ra-${iconClass}`, animateGradient && "animate-pulse")}
                style={{
                    fontSize: size,
                    color: tintColor || (gradient ? gradient[0] : undefined),
                    ...gradient ? { color: gradient[0] } : undefined
                }}
            />
        </motion.div>
    );
}
