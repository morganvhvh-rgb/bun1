import { motion } from 'framer-motion';
import { hpVariants } from '../animations';

interface StatLineProps {
    label: string;
    value: string | number;
    color?: string;
    /** If true, uses the 'hurt' flash animation */
    flash?: boolean;
}

export function StatLine({ label, value, color, flash }: StatLineProps) {
    return (
        <div className="flex items-center" style={{ gap: '0.35em' }}>
            <span className={color ?? ''}>{label}</span>
            {flash !== undefined ? (
                <motion.span
                    animate={flash ? 'hurt' : 'idle'}
                    variants={hpVariants}
                    className="text-zinc-300 inline-block"
                >
                    {value}
                </motion.span>
            ) : (
                <span className={color ? color : 'text-zinc-300'}>{value}</span>
            )}
        </div>
    );
}
