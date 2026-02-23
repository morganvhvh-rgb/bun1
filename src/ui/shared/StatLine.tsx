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
        <div className="flex justify-between items-center">
            <span className={color ?? ''}>{label}</span>
            {flash !== undefined ? (
                <motion.span
                    animate={flash ? 'hurt' : 'idle'}
                    variants={hpVariants}
                    className="text-zinc-300 inline-block origin-right"
                >
                    {value}
                </motion.span>
            ) : (
                <span className={color ? color : 'text-zinc-300'}>{value}</span>
            )}
        </div>
    );
}
